'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { gsap } from 'gsap'
import { Check, ChevronRight, User2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface Avatar {
  id: number
  svg: ReactNode
  alt: string
}

// RGB values for the per-avatar color ring on the stage
const AVATAR_RGB: Record<number, string> = {
  1: '53, 200, 224',    // Cyan (brand)
  2: '130, 201, 61',    // Lime (brand)
  3: '139, 92, 246',    // Violet
  4: '245, 158, 11',    // Amber
}

const avatars: Avatar[] = [
  {
    id: 1,
    svg: (
      <svg aria-label="Avatar 1" fill="none" height="40" role="img" viewBox="0 0 36 36" width="40" xmlns="http://www.w3.org/2000/svg">
        <title>Avatar 1</title>
        <mask height="36" id=":r111:" maskUnits="userSpaceOnUse" width="36" x="0" y="0">
          <rect fill="#FFFFFF" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#:r111:)">
          <rect fill="#35C8E0" height="36" width="36" />
          <rect fill="#82C93D" height="36" rx="6" transform="translate(9 -5) rotate(219 18 18) scale(1)" width="36" x="0" y="0" />
          <g transform="translate(4.5 -4) rotate(9 18 18)">
            <path d="M15 19c2 1 4 1 6 0" fill="none" stroke="#000000" strokeLinecap="round" />
            <rect fill="#000000" height="2" rx="1" stroke="none" width="1.5" x="10" y="14" />
            <rect fill="#000000" height="2" rx="1" stroke="none" width="1.5" x="24" y="14" />
          </g>
        </g>
      </svg>
    ),
    alt: 'Avatar 1 - Cyan & Lime',
  },
  {
    id: 2,
    svg: (
      <svg aria-label="Avatar 2" fill="none" height="40" role="img" viewBox="0 0 36 36" width="40" xmlns="http://www.w3.org/2000/svg">
        <title>Avatar 2</title>
        <mask height="36" id=":R4mrttb:" maskUnits="userSpaceOnUse" width="36" x="0" y="0">
          <rect fill="#FFFFFF" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#:R4mrttb:)">
          <rect fill="#82C93D" height="36" width="36" />
          <rect fill="#0a0310" height="36" rx="6" transform="translate(5 -1) rotate(55 18 18) scale(1.1)" width="36" x="0" y="0" />
          <g transform="translate(7 -6) rotate(-5 18 18)">
            <path d="M15 20c2 1 4 1 6 0" fill="none" stroke="#FFFFFF" strokeLinecap="round" />
            <rect fill="#FFFFFF" height="2" rx="1" stroke="none" width="1.5" x="14" y="14" />
            <rect fill="#FFFFFF" height="2" rx="1" stroke="none" width="1.5" x="20" y="14" />
          </g>
        </g>
      </svg>
    ),
    alt: 'Avatar 2 - Lime & Dark',
  },
  {
    id: 3,
    svg: (
      <svg aria-label="Avatar 3" fill="none" height="40" role="img" viewBox="0 0 36 36" width="40" xmlns="http://www.w3.org/2000/svg">
        <title>Avatar 3</title>
        <mask height="36" id=":r11c:" maskUnits="userSpaceOnUse" width="36" x="0" y="0">
          <rect fill="#FFFFFF" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#:r11c:)">
          <rect fill="#0a0310" height="36" width="36" />
          <rect fill="#8B5CF6" height="36" rx="36" transform="translate(-3 7) rotate(227 18 18) scale(1.2)" width="36" x="0" y="0" />
          <g transform="translate(-3 3.5) rotate(7 18 18)">
            <path d="M13,21 a1,0.75 0 0,0 10,0" fill="#FFFFFF" />
            <rect fill="#FFFFFF" height="2" rx="1" stroke="none" width="1.5" x="12" y="14" />
            <rect fill="#FFFFFF" height="2" rx="1" stroke="none" width="1.5" x="22" y="14" />
          </g>
        </g>
      </svg>
    ),
    alt: 'Avatar 3 - Violet & Dark',
  },
  {
    id: 4,
    svg: (
      <svg aria-label="Avatar 4" fill="none" height="40" role="img" viewBox="0 0 36 36" width="40" xmlns="http://www.w3.org/2000/svg">
        <title>Avatar 4</title>
        <mask height="36" id=":r11d:" maskUnits="userSpaceOnUse" width="36" x="0" y="0">
          <rect fill="#FFFFFF" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#:r11d:)">
          <rect fill="#F59E0B" height="36" width="36" />
          <rect fill="#1A9AB5" height="36" rx="6" transform="translate(0 0) rotate(45 18 18) scale(1.2)" width="36" x="0" y="0" />
          <g transform="translate(0 0) rotate(0 18 18)">
            <path d="M15 19c2 1 4 1 6 0" fill="none" stroke="#000000" strokeLinecap="round" />
            <rect fill="#000000" height="2" rx="1" stroke="none" width="1.5" x="12" y="14" />
            <rect fill="#000000" height="2" rx="1" stroke="none" width="1.5" x="22" y="14" />
          </g>
        </g>
      </svg>
    ),
    alt: 'Avatar 4 - Amber & Teal',
  },
]

export default function SetupProfilePage() {
  const router = useRouter()
  const [step, setStep] = useState<'avatar' | 'username'>('avatar')
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Check if user is logged in and needs setup
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Check if user already has username
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', user.id)
        .single()

      if (profile?.username) {
        // Already has username, redirect to dashboard
        router.push(`/dashboard/${profile.role || 'student'}`)
        return
      }

      setUserRole(profile?.role || 'student')
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    gsap.fromTo('.setup-card',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    )
  }, [])

  // Check username availability with debounce
  useEffect(() => {
    if (username.length < 3) {
      setIsAvailable(null)
      return
    }

    const timer = setTimeout(async () => {
      setChecking(true)
      const supabase = createClient()
      
      const { data } = await supabase.rpc('check_username_available', {
        check_username: username.toLowerCase()
      })
      
      setIsAvailable(data === true)
      setChecking(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [username])

  const handleSubmit = async () => {
    if (!selectedAvatar || !username || username.length < 3) {
      setError('Please select an avatar and enter a username (min 3 characters)')
      return
    }

    if (!isAvailable) {
      setError('Username is not available')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.toLowerCase(),
          avatar_id: selectedAvatar,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save profile')
      }

      // Redirect to dashboard
      router.push(`/dashboard/${userRole || 'student'}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const rgb = selectedAvatar ? AVATAR_RGB[selectedAvatar] : '53, 200, 224'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="setup-card w-full max-w-md bg-white p-8 border-2 border-primary-dark shadow-[8px_8px_0px_rgba(0,0,0,1)]">
        
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/sug-new-log.svg" alt="Sug Creative" width={40} height={40} className="flex-shrink-0" />
            <span className="text-primary-dark text-xl font-heading font-black tracking-tight">SUG CREATIVE</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-black text-primary-dark uppercase tracking-tight mb-2">
            Complete Your Profile
          </h1>
          <p className="text-sm text-gray-600">
            Choose an avatar and pick a unique username
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm font-bold bg-red-50 text-red-600 border-2 border-red-600 shadow-[2px_2px_0px_currentColor]">
            {error}
          </div>
        )}

        {/* Avatar Selection */}
        {step === 'avatar' && (
          <div className="space-y-6">
            <div className="text-xs font-black uppercase tracking-widest text-primary-dark mb-4 text-center">
              Step 1: Choose Your Avatar
            </div>
            
            {/* Selected Avatar Display */}
            <div className="flex justify-center mb-6">
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  boxShadow: selectedAvatar
                    ? `0 0 0 4px rgba(${rgb}, 0.3), 0 0 30px rgba(${rgb}, 0.4)`
                    : '0 0 0 4px rgba(0,0,0,0.1)',
                }}
              >
                {selectedAvatar ? (
                  <div className="w-20 h-20 flex items-center justify-center scale-[2]">
                    {avatars.find((a) => a.id === selectedAvatar)?.svg}
                  </div>
                ) : (
                  <User2 className="w-12 h-12 text-gray-300" />
                )}
              </div>
            </div>

            {/* Avatar Options */}
            <div className="flex justify-center gap-4">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={cn(
                    'relative w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110',
                    selectedAvatar === avatar.id
                      ? 'border-primary-dark shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                      : 'border-gray-200 hover:border-gray-400'
                  )}
                >
                  {avatar.svg}
                  {selectedAvatar === avatar.id && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#82C93D] rounded-full flex items-center justify-center border-2 border-white">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => selectedAvatar && setStep('username')}
              disabled={!selectedAvatar}
              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-primary-dark text-white font-black text-sm uppercase tracking-widest border-2 border-primary-dark hover:bg-white hover:text-primary-dark hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Username Selection */}
        {step === 'username' && (
          <div className="space-y-6">
            <div className="text-xs font-black uppercase tracking-widest text-primary-dark mb-4 text-center">
              Step 2: Choose Your Username
            </div>

            {/* Show selected avatar */}
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ boxShadow: `0 0 0 3px rgba(${rgb}, 0.3)` }}
              >
                <div className="scale-150">
                  {avatars.find((a) => a.id === selectedAvatar)?.svg}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-primary-dark mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="yourname"
                  minLength={3}
                  maxLength={20}
                  className="w-full pl-10 pr-12 py-4 bg-white border-2 border-black/10 text-primary-dark font-medium text-sm focus:border-primary-dark focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:outline-none transition-all rounded-none placeholder:text-black/30"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {checking && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
                  {!checking && isAvailable === true && <Check className="w-5 h-5 text-green-500" />}
                  {!checking && isAvailable === false && <span className="text-red-500 text-xs font-bold">Taken</span>}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('avatar')}
                className="flex-1 px-4 py-4 bg-white text-primary-dark font-black text-sm uppercase tracking-widest border-2 border-primary-dark hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !isAvailable || username.length < 3}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-primary-dark text-white font-black text-sm uppercase tracking-widest border-2 border-primary-dark hover:bg-[#82C93D] hover:border-[#82C93D] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Complete <Check className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
