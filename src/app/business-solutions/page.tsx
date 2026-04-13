'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, TrendingUp, Lightbulb, CheckCircle2, Megaphone, Users, Award, Shield } from 'lucide-react'
import gsap from 'gsap'
import AnimatedSection from '@/components/AnimatedSection'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const businessServices = [
  {
    title: 'Enterprise Digital Transformation',
    desc: 'End-to-end modernization of legacy applications and complete shift to cloud strategies. Streamline your enterprise architecture.',
    icon: TrendingUp,
    color: 'bg-violet-500',
    shadow: 'shadow-[8px_8px_0px_rgba(139,92,246,1)]'
  },
  {
    title: 'Custom Product Development',
    desc: 'From initial prototype to production scale. We build secure, resilient software products mapped to your core business needs.',
    icon: Lightbulb,
    color: 'bg-blue-500',
    shadow: 'shadow-[8px_8px_0px_rgba(59,130,246,1)]'
  },
  {
    title: 'Data & Analytics',
    desc: 'Turn your historical operational data into predictable business advantages with advanced ML insights and reporting models.',
    icon: CheckCircle2,
    color: 'bg-green-500',
    shadow: 'shadow-[8px_8px_0px_rgba(34,197,94,1)]'
  },
  {
    title: 'Corporate Training & Upskilling',
    desc: 'Empower your workforce with expert-led corporate training programs in the latest frameworks, reducing onboarding overheads.',
    icon: Users,
    color: 'bg-amber-500',
    shadow: 'shadow-[8px_8px_0px_rgba(245,158,11,1)]'
  }
]

export default function BusinessSolutionsPage() {
  const heroRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (heroRef.current) {
      gsap.from(heroRef.current, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.2 })
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#F0F2E8] pt-28">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-[#F0F2E8] relative overflow-hidden border-b-2 border-black/10">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#82C93D 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="container-wide relative z-10 px-6 sm:px-10 lg:px-16 lg:flex lg:items-center lg:justify-between gap-12">
          
          <div className="lg:w-[55%] mb-12 lg:mb-0">
            <div className="inline-block bg-primary/20 text-primary-dark font-black text-[10px] uppercase tracking-widest px-4 py-1.5 mb-6 rounded-full border-2 border-primary">
              Scale Your Operations
            </div>
            
            <h1 ref={heroRef} className="font-heading font-black text-primary-dark tracking-tight text-5xl md:text-6xl lg:text-7xl leading-[1.0] mb-6">
              Powerful <span className="text-[#82C93D]">Solutions</span> <br />
              For Growing Need.
            </h1>
            
            <p className="text-primary-dark/60 text-lg md:text-xl font-bold leading-relaxed mb-8 max-w-xl">
              We partner with organizations to drive innovation, optimize workflows, and engineer robust digital products. Achieve sustainable growth with our bespoke technology solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary-dark text-white font-black text-sm uppercase tracking-widest rounded-3xl px-10 h-16 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                <Link href="/contact">Partner With Us <ArrowUpRight size={20} className="ml-2"/></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-primary-dark text-primary-dark hover:bg-primary-dark/5 font-black text-sm uppercase tracking-widest rounded-3xl px-10 h-16 transition-all">
                <Link href="#solutions">View Services</Link>
              </Button>
            </div>
          </div>
          
          <div className="lg:w-[45%] relative">
             <div className="aspect-[4/3] rounded-[3rem] border-2 border-primary-dark shadow-[12px_12px_0px_rgba(130,201,61,1)] overflow-hidden">
               <Image 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop" 
                  alt="Business Solutions" 
                  fill 
                  className="object-cover" 
               />
             </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section id="solutions" className="py-24 md:py-32 bg-white border-b-2 border-black/10">
        <div className="container-wide">
          <AnimatedSection>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                Our Services
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight mb-6">
                Tailored Strategies For Value
              </h2>
            </div>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-8">
            {businessServices.map((service, i) => (
               <AnimatedSection key={service.title} delay={i * 0.1}>
                 <div className={`p-10 border-2 border-black rounded-3xl ${service.shadow} bg-white h-full hover:-translate-y-2 transition-all duration-300`}>
                    <div className={`w-16 h-16 ${service.color} text-white rounded-2xl flex items-center justify-center border-2 border-black mb-6`}>
                      <service.icon size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-primary-dark mb-4">{service.title}</h3>
                    <p className="text-primary-dark/70 font-medium leading-relaxed">{service.desc}</p>
                 </div>
               </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials snippet for Business page */}
      <section className="py-24 md:py-32 bg-[#1A9AB5] overflow-hidden text-center relative border-b-2 border-black/10">
         <div className="container-wide relative z-10 text-white">
            <h3 className="text-3xl lg:text-5xl font-heading font-black mb-6">Built For Industry Leaders</h3>
            <p className="text-white/70 max-w-xl mx-auto font-medium text-lg mb-10 text-balance">
              From fast-paced startups to robust Fortune 500 enterprises, our business solutions scale to match your vision. Let's make an impact.
            </p>
            <Button asChild size="lg" className="bg-[#82C93D] hover:bg-white hover:text-primary-dark text-primary-dark font-black text-sm uppercase tracking-widest rounded-3xl px-12 h-16 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all border-2 border-black">
              <Link href="/contact">Book a Strategy Call <ArrowUpRight size={20} className="ml-2"/></Link>
            </Button>
         </div>
      </section>

      <Footer />
    </main>
  )
}
