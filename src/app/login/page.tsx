'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { gsap } from 'gsap'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Squares from '@/components/Squares'

const roles = [
  { id: 'admin', label: 'Admin' },
  { id: 'student', label: 'Student' },
  { id: 'client', label: 'Client' },
  { id: 'mentor', label: 'Mentor' },
  { id: 'employee', label: 'Employee' },
  { id: 'intern', label: 'Intern' },
]

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
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'client')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fullName, setFullName] = useState('')

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
    if (!selectedRole) {
      setError('Please select a role')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: selectedRole,
            },
          },
        })
        if (signUpError) throw signUpError
        setError('Check your email for the confirmation link!')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        window.location.href = `/dashboard/${selectedRole}`
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
            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-none shadow-[4px_4px_0px_rgba(255,255,255,0.2)] transition-transform group-hover:-translate-y-1">
              <span className="text-primary-dark font-heading font-black text-lg tracking-tighter">SC</span>
            </div>
            <span className="text-white text-2xl font-heading font-black tracking-tight">SUG CREATIVE</span>
          </Link>
        </div>

        <div className="login-brand relative z-10 mt-24 mb-auto">
          <h2 className="text-5xl lg:text-7xl font-heading font-black text-white leading-[1.1] mb-6 uppercase tracking-tight">
            Your<br />
            Gateway<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">To Growth</span>
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
              <div className="w-10 h-10 bg-primary-dark flex items-center justify-center rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <span className="text-white font-heading font-black text-sm tracking-tighter">SC</span>
              </div>
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
            <div className={`p-4 mb-6 text-sm font-bold border-2 rounded-none shadow-[2px_2px_0px_currentColor] ${
              error.includes('Check your email') 
                ? 'bg-blue-50 text-blue-800 border-blue-800'
                : 'bg-red-50 text-red-600 border-red-600'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6 flex flex-col">
            
            {/* Minimal Role Selection Dropdown instead of large buttons */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-primary-dark mb-2">Access Role</label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full appearance-none px-4 py-4 bg-white border-2 border-black/10 text-primary-dark font-bold text-sm focus:border-primary-dark focus:ring-0 focus:outline-none transition-colors rounded-none cursor-pointer"
                >
                  <option value="" disabled>Select Role...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.label} Portal</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-primary-dark">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-primary-dark mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-4 bg-white border-2 border-black/10 text-primary-dark font-medium text-sm focus:border-primary-dark focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:outline-none transition-all rounded-none placeholder:text-black/30"
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
                className="w-full px-4 py-4 bg-white border-2 border-black/10 text-primary-dark font-medium text-sm focus:border-primary-dark focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:outline-none transition-all rounded-none placeholder:text-black/30"
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
                  className="w-full px-4 py-4 bg-white border-2 border-black/10 text-primary-dark font-medium text-sm focus:border-primary-dark focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:outline-none transition-all rounded-none placeholder:text-black/30 pr-12"
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
              className="w-full group mt-4 flex items-center justify-center gap-3 px-6 py-5 bg-primary-dark text-white font-black text-sm uppercase tracking-widest border-2 border-primary-dark hover:bg-white hover:text-primary-dark hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all rounded-none disabled:opacity-50 disabled:pointer-events-none active:translate-y-1 active:shadow-none"
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
