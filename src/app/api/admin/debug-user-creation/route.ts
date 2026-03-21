import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// Debug endpoint to diagnose user creation issues
export async function GET(req: NextRequest) {
  try {
    const adminClient = createAdminClient()
    const diagnostics: Record<string, unknown> = {}

    // 1. Check if we can connect to profiles table
    const { data: profilesData, error: profilesError } = await adminClient
      .from('profiles')
      .select('id, email, role')
      .limit(5)

    diagnostics.profiles = {
      success: !profilesError,
      count: profilesData?.length ?? 0,
      error: profilesError?.message,
      sample: profilesData?.map(p => ({ email: p.email, role: p.role }))
    }

    // 2. Check auth users
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 10
    })

    diagnostics.authUsers = {
      success: !authError,
      count: authUsers?.users?.length ?? 0,
      error: authError?.message,
      sample: authUsers?.users?.map(u => ({ email: u.email, id: u.id }))
    }

    // 3. Check user_role enum values using raw query via RPC if available
    // This will help us see if the enum values match what we're sending
    const { data: enumData, error: enumError } = await adminClient.rpc('get_user_role_values').select()
    diagnostics.userRoleEnum = {
      data: enumData,
      error: enumError?.message,
      note: 'If error, the function may not exist - this is expected'
    }

    // 4. Try a test user creation with explicit lowercase role
    const testEmail = `test-debug-${Date.now()}@delete-me.local`
    const { data: testUser, error: testError } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: { full_name: 'Debug Test User', role: 'student' },
    })

    diagnostics.testUserCreation = {
      success: !testError,
      error: testError?.message,
      errorCode: (testError as any)?.code,
      errorStatus: (testError as any)?.status,
      fullError: testError ? JSON.stringify(testError, null, 2) : null
    }

    // If test user was created, check if profile was also created
    if (testUser?.user) {
      const { data: createdProfile, error: profileCheckError } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', testUser.user.id)
        .single()

      diagnostics.triggerWorked = {
        profileCreated: !!createdProfile,
        profile: createdProfile,
        error: profileCheckError?.message
      }

      // Cleanup - delete test user
      await adminClient.auth.admin.deleteUser(testUser.user.id)
      ;(diagnostics.testUserCreation as Record<string, unknown>).cleanup = 'Test user deleted'
    }

    // 5. Check for ANY orphaned profiles (profiles that might not have auth users)
    const { data: allProfiles } = await adminClient
      .from('profiles')
      .select('id, email')
      .limit(100)

    if (allProfiles && allProfiles.length > 0) {
      const orphaned = []
      for (const profile of allProfiles) {
        const { data: authUser } = await adminClient.auth.admin.getUserById(profile.id)
        if (!authUser?.user) {
          orphaned.push(profile)
        }
      }
      diagnostics.orphanedProfiles = orphaned
    }

    return NextResponse.json({
      status: 'Diagnostics complete',
      diagnostics,
      recommendation: diagnostics.testUserCreation && !(diagnostics.testUserCreation as any).success
        ? 'The trigger is failing. Run this SQL in Supabase Dashboard > SQL Editor to fix it.'
        : 'User creation appears to be working. Check the error details.',
      sqlFix: `
-- Run this in Supabase Dashboard > SQL Editor
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete any orphaned profile with same email (different id)
  DELETE FROM public.profiles WHERE email = NEW.email AND id != NEW.id;

  -- Insert new profile
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the user creation
  RAISE WARNING 'Profile trigger error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
      `
    })

  } catch (err) {
    console.error('Debug error:', err)
    return NextResponse.json({
      error: 'Debug failed',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 })
  }
}

// POST — Try to fix by running diagnostics and cleanup
export async function POST(req: NextRequest) {
  try {
    const adminClient = createAdminClient()
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const results: Record<string, unknown> = {}

    // Step 1: Delete any auth user with this email
    const { data: authUsers } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const existingUser = authUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(existingUser.id)
      results.deletedAuthUser = { id: existingUser.id, error: deleteError?.message }
    }

    // Step 2: Delete any profile with this email
    const { data: deletedProfiles, error: deleteProfileError } = await adminClient
      .from('profiles')
      .delete()
      .ilike('email', email)
      .select()

    results.deletedProfiles = { count: deletedProfiles?.length ?? 0, error: deleteProfileError?.message }

    // Step 3: Wait for cleanup to propagate
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Step 4: Try creating the user again
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: 'TempPassword123!',
      email_confirm: true,
      user_metadata: { full_name: 'New User', role: 'student' },
    })

    results.userCreation = {
      success: !createError,
      userId: newUser?.user?.id,
      error: createError?.message,
      fullError: createError ? JSON.stringify(createError) : null
    }

    return NextResponse.json(results)

  } catch (err) {
    console.error('Fix attempt error:', err)
    return NextResponse.json({
      error: 'Fix attempt failed',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 })
  }
}
