'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowRight, Sparkles } from 'lucide-react'

const roleMessages: Record<string, { title: string; subtitle: string; cta: string }> = {
  admin: {
    title: 'Welcome, Admin!',
    subtitle: 'You have full access to manage users, finances, content, and operations. Let\'s keep things running smoothly.',
    cta: 'Go to Admin Dashboard',
  },
  student: {
    title: 'Welcome, Student!',
    subtitle: 'Your learning journey starts here. Explore courses, track your progress, and build your career.',
    cta: 'Explore Courses',
  },
  client: {
    title: 'Welcome, Client!',
    subtitle: 'Your workspace is ready. Track your projects, view reports, and collaborate with the SUG team.',
    cta: 'View My Projects',
  },
  mentor: {
    title: 'Welcome, Mentor!',
    subtitle: 'Make an impact. Connect with your students, schedule sessions, and help them grow.',
    cta: 'See My Students',
  },
  employee: {
    title: 'Welcome to the Team!',
    subtitle: 'Your portal is set up. Check your tasks, upcoming meetings, and announcements to get started.',
    cta: 'View My Tasks',
  },
  intern: {
    title: 'Welcome, Intern!',
    subtitle: 'Great things start here. Dive into your learning modules, log attendance, and make your mark.',
    cta: 'Start Learning',
  },
}

const quotes = [
  'The secret of getting ahead is getting started. — Mark Twain',
  'Excellence is not a destination but a continuous journey. — Brian Tracy',
  'The only way to do great work is to love what you do. — Steve Jobs',
  'Success is the sum of small efforts repeated day in and day out. — Robert Collier',
  'Opportunities don\'t happen, you create them. — Chris Grosser',
]

type Props = {
  name: string | null
  role: string
}

export default function WelcomeScreen({ name, role }: Props) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(true)
  const quote = quotes[Math.floor(Math.random() * quotes.length)]
  const msg = roleMessages[role] || roleMessages.admin

  useEffect(() => {
    const key = `sug_welcomed_${role}`
    const hasSeenWelcome = localStorage.getItem(key)
    if (!hasSeenWelcome) {
      setDismissed(false)
      setVisible(true)
    }
  }, [role])

  function dismiss() {
    const key = `sug_welcomed_${role}`
    localStorage.setItem(key, '1')
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
    >
      <div className="bg-white w-full max-w-lg border-2 border-[#1A9AB5] shadow-[8px_8px_0px_rgba(26,154,181,0.3)] relative overflow-hidden">
        {/* Top gradient band */}
        <div className="h-2 bg-gradient-to-r from-[#82C93D] via-[#35C8E0] to-[#1A9AB5]" />

        <div className="p-8 sm:p-10">
          {/* Logo + sparkle */}
          <div className="flex items-center gap-3 mb-8">
            <Image src="/sug-new-log.svg" alt="Sug Creative" width={48} height={48} className="flex-shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1A9AB5]">SUG CREATIVE</p>
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-0.5">Portal Access Granted</p>
            </div>
            <Sparkles size={20} className="ml-auto text-[#82C93D] flex-shrink-0" />
          </div>

          {/* Greeting */}
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-foreground leading-tight mb-2">
            {name ? `Hey ${name.split(' ')[0]},` : 'Hey there,'}
          </h1>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#1A9AB5] leading-tight mb-5">
            {msg.title}
          </h2>

          <p className="text-sm text-foreground/60 font-medium leading-relaxed mb-8 border-l-4 border-[#35C8E0] pl-4">
            {msg.subtitle}
          </p>

          {/* Quote */}
          <div className="bg-[#F3F4F6] border border-black/8 px-4 py-3 mb-8 italic text-xs text-foreground/50 font-medium">
            &ldquo;{quote}&rdquo;
          </div>

          {/* CTA */}
          <button
            onClick={dismiss}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#1A9AB5] text-white font-black text-sm uppercase tracking-widest border-2 border-[#1A9AB5] hover:bg-white hover:text-[#1A9AB5] hover:shadow-[4px_4px_0px_rgba(26,154,181,0.4)] transition-all group active:translate-y-0.5 active:shadow-none"
          >
            {msg.cta}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  )
}
