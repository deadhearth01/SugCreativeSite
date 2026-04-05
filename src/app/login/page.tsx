'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { gsap } from 'gsap'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Squares from '@/components/Squares'

function LoginFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-primary-dark font-heading font-black text-xl tracking-widest uppercase">Loading Portal...</div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fullName, setFullName] = useState('')

  // Check for redirect param (e.g., after email confirmation)
  const redirectTo = searchParams.get('redirect')

  useEffect(() => {
    // GSAP entry animations
    gsap.fromTo('.login-card', 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    )
    
    gsap.fromTo('.login-brand',
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.4 }
    )
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    try {
      if (isSignUp) {
        // Sign up - role will be set to 'student' by default for new users
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'student', // Default role for new signups
            },
          },
        })
        if (signUpError) throw signUpError
        setError('Check your email for the confirmation link!')
      } else {
        // Sign in - auto-detect role from database
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError

        if (signInData.user) {
          // Fetch user's profile to get role and username
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, username')
            .eq('id', signInData.user.id)
            .single()

          if (!profile?.role) {
            // No profile found - shouldn't happen but handle gracefully
            setError('Account setup incomplete. Please contact support.')
            return
          }

          // Check if username is set - if not, redirect to setup
          if (!profile.username) {
            window.location.href = '/setup-profile'
            return
          }

          // Redirect to user's dashboard based on their role
          const targetPath = redirectTo || `/dashboard/${profile.role}`
          window.location.href = targetPath
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
      {/* Left: Branding with Interactive Squares */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-primary-dark overflow-hidden p-16 flex-col justify-between" style={{ minHeight: '100vh' }}>
        {/* The interactive squares background */}
        <div className="absolute inset-0 z-0">
          <Squares 
            direction="diagonal"
            speed={0.5}
            squareSize={40}
            borderColor="rgba(255,255,255,0.05)"
            hoverFillColor="rgba(255,255,255,0.1)"
          />
        </div>

        {/* Content overlaid on top of Squares */}
        <div className="login-brand relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Image src="/sug-new-log.svg" alt="Sug Creative" width={44} height={44} className="flex-shrink-0 transition-transform group-hover:-translate-y-1" />
            <span className="text-white text-2xl font-heading font-black tracking-tight">SUG CREATIVE</span>
          </Link>
        </div>

        <div className="login-brand relative z-10 mt-24 mb-auto">
          <h2 className="text-5xl lg:text-7xl font-heading font-black text-white leading-[1.1] mb-6 uppercase tracking-tight">
            Your<br />
            Gateway<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#82C93D] to-[#35C8E0]">To Growth</span>
          </h2>
          <p className="text-white/70 max-w-md text-lg font-medium leading-relaxed border-l-2 border-white/20 pl-4">
            Access your personalized portal to manage projects, track progress, collaborate with experts, and scale your operations.
          </p>
        </div>

        <div className="login-brand relative z-10 flex gap-8 pt-12 border-t border-white/10">
          {[
            { num: '3000+', label: 'Careers' },
            { num: '200+', label: 'Businesses' },
            { num: '50+', label: 'Startups' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-heading font-black text-white">{stat.num}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Brutalist Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-gray-50 relative">
        <div className="login-card w-full max-w-lg bg-white p-8 sm:p-12 border-2 border-primary-dark shadow-[8px_8px_0px_rgba(0,0,0,1)] relative z-10">
          
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex justify-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/sug-new-log.svg" alt="Sug Creative" width={40} height={40} className="flex-shrink-0" />
              <span className="text-primary-dark text-xl font-heading font-black tracking-tight">SUG CREATIVE</span>
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-heading font-black text-primary-dark uppercase tracking-tight mb-2">
              {isSignUp ? 'Create Portal Account' : 'Portal Access'}
            </h1>
            <p className="text-foreground/60 text-sm font-medium border-l-2 border-primary-dark/20 pl-3">
              {isSignUp ? 'Initialize your Sug Creative workspace connection.' : 'Enter your credentials to access your workspace.'}
            </p>
          </div>

          {error && (
            <div className={`p-4 mb-6 text-sm font-bold border-2 rounded-3xl shadow-[2px_2px_0px_currentColor] ${
              error.includes('Check your email') 
                ? 'bg-blue-50 text-blue-800 border-blue-800'
                : 'bg-red-50 text-red-600 border-red-600'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6 flex flex-col">

            {isSignUp && (
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-primary-dark mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-4 bg-white border-2 border-black/10 text-primary-dark font-medium text-sm focus:border-primary-dark focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:outline-none transition-all rounded-3xl placeholder:text-black/30"
                  placeholder="JOHN DOE"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-primary-dark mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-white border-2 border-black/10 text-primary-dark font-medium text-sm focus:border-primary-dark focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:outline-none transition-all rounded-3xl placeholder:text-black/30"
                placeholder="YOU@COMPANY.COM"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-primary-dark mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-white border-2 border-black/10 text-primary-dark font-medium text-sm focus:border-primary-dark focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:outline-none transition-all rounded-3xl placeholder:text-black/30 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-dark/50 hover:text-primary-dark transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group mt-4 flex items-center justify-center gap-3 px-6 py-5 bg-primary-dark text-white font-black text-sm uppercase tracking-widest border-2 border-primary-dark hover:bg-white hover:text-primary-dark hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all rounded-3xl disabled:opacity-50 disabled:pointer-events-none active:translate-y-1 active:shadow-none"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Initialize Account' : 'Authenticate')}
              {!loading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <div className="mt-8 text-center border-t-2 border-black/5 pt-8">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              className="text-xs font-bold uppercase tracking-widest text-primary-dark/60 hover:text-primary-dark transition-colors border-b-2 border-transparent hover:border-primary-dark pb-1"
            >
              {isSignUp ? 'RETURN TO LOGIN' : "REQUEST NEW ACCESS"}
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs font-bold uppercase tracking-widest text-primary-dark/40 hover:text-primary-dark transition-colors">
              &larr; BACK TO MAIN SITE
            </Link>
          </div>

        </div>
        
        {/* Background decorative elements for the right side */}
        <div className="absolute top-0 right-0 w-64 h-64 border-l-2 border-b-2 border-black/5 rounded-bl-none pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-t-2 border-r-2 border-black/5 rounded-tr-none pointer-events-none" />
      </div>
    </div>
  )
}
