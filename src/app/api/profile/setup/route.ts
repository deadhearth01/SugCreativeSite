import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, avatar_id } = body;

    // Validate username
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim().toLowerCase();

    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return NextResponse.json(
        { error: "Only letters, numbers, and underscores allowed" },
        { status: 400 }
      );
    }

    // Validate avatar_id
    if (!avatar_id || typeof avatar_id !== "number" || avatar_id < 1 || avatar_id > 4) {
      return NextResponse.json(
        { error: "Invalid avatar selection" },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", trimmedUsername)
      .neq("id", user.id)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }

    // Update the user's profile
    const { data, error } = await supabase
      .from("profiles")
      .update({
        username: trimmedUsername,
        avatar_id: avatar_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: data,
    });
  } catch (error) {
    console.error("Profile setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Check if username is available
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter required" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim().toLowerCase();

    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", trimmedUsername)
      .single();

    return NextResponse.json({
      available: !existingUser,
      username: trimmedUsername,
    });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
