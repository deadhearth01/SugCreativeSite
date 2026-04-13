'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, TrendingUp, GraduationCap, Award, Users, Clock, Play, Briefcase, Calendar, Star, Quote, Building2, Shield, Cpu, Globe, Server, Code2, Palette, Settings, Zap, Target, Rocket, BadgeCheck, ArrowRight } from 'lucide-react'
import RotatingText from '@/components/RotatingText'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { DomeGallery } from '@/components/DomeGallery'
import { Button } from '@/components/ui/button'
import { NumberTicker } from '@/components/ui/number-ticker'
import { LogoLoop } from '@/components/LogoLoop'

const GridMotionHero = dynamic(() => import('@/components/GridMotionHero'), { ssr: false })

// Company logos for placement showcase
const placementImages = Array.from({ length: 50 }, (_, i) => ({
  src: `/placements/placement_${i + 1}.jpg`,
  alt: `SUG member placed at top company`
}))

const companyLogos = [
  { src: '/companyPlacementLogo/google.png', alt: 'Google' },
  { src: '/companyPlacementLogo/bosch.png', alt: 'Bosch' },
  { src: '/companyPlacementLogo/accenture.png', alt: 'Accenture' },
  { src: '/companyPlacementLogo/tcs.png', alt: 'TCS' },
  { src: '/companyPlacementLogo/capgemini.png', alt: 'Capgemini' },
  { src: '/companyPlacementLogo/verizon.png', alt: 'Verizon' },
  { src: '/companyPlacementLogo/watchGuard.png', alt: 'WatchGuard' },
  { src: '/companyPlacementLogo/coforge.png', alt: 'Coforge' },
  { src: '/companyPlacementLogo/icic.png', alt: 'ICICI' },
  { src: '/companyPlacementLogo/muSigma.png', alt: 'Mu Sigma' },
  { src: '/companyPlacementLogo/vi.png', alt: 'Vi' },
]

// Placement companies where SUGians got placed
const placementCompanies = [
  { name: 'Google', logo: '/CompanyLogos/google.svg' },
  { name: 'Bosch', logo: '/CompanyLogos/bosch.svg' },
  { name: 'Accenture', logo: '/CompanyLogos/accenture.svg' },
  { name: 'TCS', logo: '/CompanyLogos/tcs.svg' },
  { name: 'Capgemini', logo: '/CompanyLogos/capgemini.svg' },
  { name: 'Verizon', logo: '/CompanyLogos/verizon.svg' },
  { name: 'WatchGuard', logo: '/CompanyLogos/watchguard.svg' },
  { name: 'Coforge', logo: '/CompanyLogos/coforge.svg' },
]

// Collaborations
const collaborations = [
  { name: 'GMUN', logo: '/CompanyLogos/gmun.svg' },
  { name: 'IETE', logo: '/CompanyLogos/iete.svg' },
  { name: 'IEEE', logo: '/CompanyLogos/ieee.svg' },
  { name: 'Toastmasters', logo: '/CompanyLogos/toastmasters.svg' },
  { name: 'Teks Academy', logo: '/CompanyLogos/teks.svg' },
  { name: 'GITAM', logo: '/CompanyLogos/gitam.svg' },
  { name: 'GTech', logo: '/CompanyLogos/gtech.svg' },
]

// Success stories / Testimonials
// Success stories / Testimonials
const testimonials = [
  {
    name: 'Tanvi Bansal',
    company: 'WatchGuard',
    domain: 'IoT',
    quote: "Sug Creative's IoT domain training was exactly what I needed to enhance my skills and land a job at WatchGuard. The learning materials were spot-on, and the trainers helped me prepare for every interview.",
    image: '/placements/placement_1.jpg',
  },
  {
    name: 'Shyam',
    company: 'Bosch',
    domain: 'IoT',
    quote: "Thanks to Sug Creative's domain training, I gained the expertise in IoT that helped me get placed at Bosch. The course covered everything I needed to know, and the mentors were incredibly supportive.",
    image: '/placements/placement_2.jpg',
  },
  {
    name: 'Anusha',
    company: 'Google',
    domain: 'Full Stack',
    quote: "I thank Sug Creative for the training I received. It gave me the practical skills and confidence needed to land a job at Google. The instructors were knowledgeable and always available.",
    image: '/placements/placement_3.jpg',
  },
  {
    name: 'Pradeep',
    company: 'Accenture',
    domain: 'ML Engineer',
    quote: "Sug Creative's Placement Prep gave me the edge I needed to land a role as a Machine Learning Engineer at Accenture. The hands-on training helped me become job-ready and confident.",
    image: '/placements/placement_4.jpg',
  },
  {
    name: 'Chandrasekhar',
    company: 'TCS',
    domain: 'Web Design',
    quote: "The Web Designing Course provided by Sug Creative was a game-changer for my career. The detailed curriculum and hands-on experience helped me secure a role at TCS.",
    image: '/placements/placement_5.jpg',
  },
  {
    name: 'Ruchita Patil',
    company: 'Capgemini',
    domain: 'UX Design',
    quote: "The practical approach to learning UX design helped me develop a strong portfolio and secure a role at Capgemini. I'm thrilled with my new career!",
    image: '/placements/placement_6.jpg',
  },
]

// Courses data - matching poster exactly with professional icons
const courses = [
  {
    title: 'DevOps Program',
    desc: 'Master CI/CD pipelines, container orchestration with Docker & Kubernetes, cloud automation & DevSecOps practices.',
    href: '/courses/devops',
    image: '/Career-Programs/devops.png',
    color: 'violet',
    tech: ['Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'AWS / GCP', 'GitOps'],
    Icon: Server,
  },
  {
    title: 'Cyber Security Program',
    desc: 'Deep-dive into ethical hacking, penetration testing, network security, VAPT & threat intelligence with live CTF labs.',
    href: '/courses/cyber-security',
    image: '/Career-Programs/cyberSecurity.png',
    color: 'blue',
    tech: ['Kali Linux', 'Metasploit', 'Wireshark', 'Burp Suite', 'SIEM', 'VAPT'],
    Icon: Shield,
  },
  {
    title: 'IoT & Embedded Systems',
    desc: 'Go from circuit to cloud — learn embedded C, RTOS, microcontroller programming & build complete smart IoT solutions.',
    href: '/courses/iot-embedded',
    image: '/Career-Programs/embeddedSystem.png',
    color: 'green',
    tech: ['Arduino', 'Raspberry Pi', 'Embedded C', 'RTOS', 'MQTT', 'AWS IoT'],
    Icon: Cpu,
  },
  {
    title: 'Full Stack Dev Program',
    desc: 'Build production-ready web apps end-to-end — master React, Node.js, REST APIs, databases & cloud deployment.',
    href: '/courses/fullstack-dev',
    image: '/Career-Programs/FullStack-Dev.png',
    color: 'gold',
    tech: ['React.js', 'Node.js', 'MongoDB', 'PostgreSQL', 'REST APIs', 'Vercel/AWS'],
    Icon: Globe,
  }
]

// Business services
const businessServices = [
  { Icon: Globe, title: 'Web Development', desc: 'Custom websites & web applications' },
  { Icon: Palette, title: 'UI/UX Design', desc: 'User-centered design solutions' },
  { Icon: Code2, title: 'Software Development', desc: 'Scalable enterprise software' },
  { Icon: Settings, title: 'IT Consulting', desc: 'Digital transformation strategy' },
]

const courseColors: Record<string, { bg: string; accent: string; shadow: string; gradient: string }> = {
  violet: { bg: 'bg-violet-500', accent: 'text-violet-500', shadow: 'shadow-[8px_8px_0px_rgba(139,92,246,1)]', gradient: 'from-violet-500 to-purple-600' },
  blue: { bg: 'bg-blue-500', accent: 'text-blue-500', shadow: 'shadow-[8px_8px_0px_rgba(59,130,246,1)]', gradient: 'from-blue-500 to-cyan-600' },
  green: { bg: 'bg-green-500', accent: 'text-green-500', shadow: 'shadow-[8px_8px_0px_rgba(34,197,94,1)]', gradient: 'from-green-500 to-emerald-600' },
  gold: { bg: 'bg-amber-500', accent: 'text-amber-500', shadow: 'shadow-[8px_8px_0px_rgba(245,158,11,1)]', gradient: 'from-amber-500 to-orange-600' },
}

export default function HomePage() {

  return (
    <>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="min-h-screen flex bg-white overflow-hidden pb-24 md:pb-32">

        {/* ── Left: content column ── */}
        <div className="relative z-10 w-full lg:w-[45%] flex flex-col justify-end px-6 sm:px-10 lg:pl-16 lg:pr-8 pt-24 pb-20 lg:pt-24 lg:pb-24 flex-shrink-0">

          {/* Headline — static + rotating word + static */}
          <h1 className="font-heading font-black text-primary-dark tracking-tight mb-6">

            {/* Line 1 — small preface */}
            <span className="block text-lg sm:text-xl lg:text-2xl text-primary-dark/40 font-bold uppercase tracking-[0.2em] mb-3">
              Turn Your
            </span>

            {/* Line 2 — rotating word */}
            <span className="block text-5xl sm:text-6xl lg:text-7xl leading-[1.0] mb-2" style={{ overflow: 'clip' }}>
              <RotatingText
                texts={['Degree.', 'Skills.', 'Potential.', 'Ambition.']}
                mainClassName="text-primary"
                splitBy="characters"
                staggerDuration={0.025}
                staggerFrom="first"
                rotationInterval={2500}
                transition={{ type: 'spring', damping: 22, stiffness: 220 }}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-110%', opacity: 0 }}
              />
            </span>

            {/* Line 3 — outcome */}
            <span className="block text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
              Into a Career.
            </span>
          </h1>

          {/* Sub */}
          <p className="text-base lg:text-lg text-primary-dark/55 leading-relaxed mb-10 max-w-sm">
            Expert-led programs, industry mentors, and dedicated placement support — everything you need to land your first role at a top MNC.
          </p>

          {/* Trust stats — 2×2 grid */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-5 mb-10 max-w-xs">
            {[
              { value: '550+', label: 'Placed' },
              { value: '50+',  label: 'MNC Partners' },
              { value: '8+',   label: 'Years' },
              { value: '98%',  label: 'Success Rate' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-black text-primary-dark leading-none">{value}</div>
                <div className="text-xs text-primary-dark/45 font-semibold mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="bg-primary-dark hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-2xl px-8 h-14 shadow-[4px_4px_0px_rgba(130,201,61,1)] hover:shadow-[6px_6px_0px_rgba(130,201,61,1)] hover:-translate-y-0.5 transition-all group">
              <Link href="/courses" className="flex items-center gap-2">
                Explore Programs
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-primary-dark/20 text-primary-dark hover:border-primary-dark hover:bg-primary-dark/5 font-bold text-sm uppercase tracking-widest rounded-2xl px-8 h-14 transition-all">
              <Link href="/contact">Free Career Counselling</Link>
            </Button>
          </div>
        </div>

        {/* ── Right: GridMotion column — strictly contained, hidden on mobile ── */}
        <div className="hidden lg:block flex-1 relative overflow-hidden">
          <GridMotionHero />
        </div>

      </section>

      {/* ═══ PLACEMENT SUCCESS - Social Proof Bar ═══ */}
      <section className="pt-24 md:pt-36 bg-white overflow-hidden">

        {/* Heading + stats */}
        <div className="container-wide">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16 md:mb-20">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} size={15} className="fill-[#82C93D] text-[#82C93D]" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-primary-dark/50">550+ Success Stories</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black text-primary-dark leading-[1.1]">
                  Our SUGians Are Placed At<br />
                  <span className="text-primary">Top Industry Leaders</span>
                </h2>
              </div>
              <div className="flex items-center gap-12 pb-2">
                <div>
                  <div className="text-4xl md:text-5xl font-black text-[#82C93D] leading-none">98%</div>
                  <div className="text-xs font-bold text-primary-dark/45 uppercase tracking-wider mt-2">Placement Rate</div>
                </div>
                <div className="w-px h-14 bg-primary-dark/10 hidden md:block" />
                <div className="hidden md:block">
                  <div className="text-4xl md:text-5xl font-black text-primary leading-none">50+</div>
                  <div className="text-xs font-bold text-primary-dark/45 uppercase tracking-wider mt-2">Hiring Partners</div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Edge-to-edge Logo Scroll — generous vertical padding */}
        <div className="w-screen relative left-1/2 -translate-x-1/2 py-10 border-t border-primary-dark/6">
          <LogoLoop
            logos={companyLogos}
            speed={55}
            direction="left"
            logoHeight={48}
            gap={120}
            pauseOnHover
            scaleOnHover
            fadeOut
            fadeOutColor="#ffffff"
            ariaLabel="Companies where our students are placed"
          />
        </div>

      </section>

      {/* ═══ INTERNSHIP PROGRAMS ═══ */}
      <section className="py-24 md:py-32 bg-gray-50 border-b-2 border-black/10">
        <div className="container-wide">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block bg-[#82C93D] text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
              <GraduationCap size={14} className="inline mr-2" />
              Career Programs
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight leading-tight mb-4">
              Industry-Focused Programs<br />With Placement Support
            </h2>
            <p className="text-primary-dark/70 text-lg font-bold">
              3-month intensive programs designed by MNC mentors. Get certified, build real projects, and launch your career.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {courses.map((course, index) => {
              const colors = courseColors[course.color]
              const IconComponent = course.Icon
              return (
                <AnimatedSection key={course.title} delay={index * 0.1}>
                  <Link href={course.href} className={`group block relative h-[560px] border-2 border-primary-dark rounded-3xl overflow-hidden ${colors.shadow} transition-all duration-500 hover:-translate-y-2 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] bg-white focus:outline-none`}>
                    
                    {/* Background Image - MUST BE BASE LAYER */}
                    <div className="absolute inset-0 z-0">
                      <Image src={course.image} alt={course.title} fill className="object-cover" />
                    </div>

                    {/* Colored overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-80 mix-blend-multiply z-10 pointer-events-none`} />
                    
                    {/* Dark gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/80 to-transparent z-20 pointer-events-none" />

                    {/* Icon & Duration Badge */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-30 pointer-events-none">
                      <div className={`w-14 h-14 ${colors.bg} rounded-2xl border-2 border-black flex items-center justify-center text-white`}>
                        <IconComponent size={28} />
                      </div>
                      <div className="bg-white text-primary-dark font-black text-[10px] uppercase rounded-2xl tracking-widest px-3 py-1.5 border-2 border-black text-center">
                        3 Months
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end z-30 pointer-events-none">
                      {/* Tech Stack - all 6 pills */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {course.tech.map((t) => (
                          <span key={t} className="bg-white/20 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 border border-white/30">
                            {t}
                          </span>
                        ))}
                      </div>
                      
                      <h3 className="text-xl font-heading font-black text-white mb-2 tracking-tight group-hover:text-[#82C93D] transition-colors duration-300 leading-tight">
                        {course.title}
                      </h3>
                      <p className="text-white/80 font-bold text-sm leading-relaxed mb-4 line-clamp-2">
                        {course.desc}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#82C93D] font-bold text-sm group-hover:gap-4 transition-all">
                          View Details <ArrowUpRight size={16} />
                        </div>
                        <div className="text-[10px] text-white/60 font-bold flex items-center gap-1">
                          <Calendar size={10} />
                          Apr 20
                        </div>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              )
            })}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-primary hover:bg-primary-dark text-white font-black text-sm uppercase tracking-widest rounded-3xl border-2 border-primary-dark px-10 h-14 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
              <Link href="/courses" className="flex items-center gap-3">
                View All Programs <ArrowUpRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ BUSINESS SOLUTIONS SECTION ═══ */}
      <section className="py-24 md:py-32 bg-white border-b-2 border-black/10">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                <Zap size={14} className="inline mr-2" />
                Business Solutions
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight leading-tight mb-6">
                We Also Excel In<br /><span className="text-primary">Digital Transformation</span>
              </h2>
              <p className="text-primary-dark/70 text-lg font-medium leading-relaxed mb-8">
                Beyond education, we help businesses thrive with cutting-edge technology solutions. From web development to IT consulting, we've partnered with <strong className="text-primary-dark">200+ businesses</strong> across industries.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {businessServices.map((service) => (
                  <div key={service.title} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-black/8 hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                      <service.Icon size={20} />
                    </div>
                    <div>
                      <div className="font-black text-primary-dark text-sm">{service.title}</div>
                      <div className="text-xs text-primary-dark/60">{service.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild size="lg" className="bg-primary-dark hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-3xl border-2 border-primary-dark px-8 h-14 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                <Link href="/services" className="flex items-center gap-3">
                  Explore Services <ArrowUpRight size={18} />
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-dark rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0px_rgba(130,201,61,1)]">
                  <div className="text-4xl font-black text-white mb-1">
                    <NumberTicker value={200} />+
                  </div>
                  <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Business Clients</div>
                </div>
                <div className="bg-[#82C93D] rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0px_rgba(26,154,181,1)]">
                  <div className="text-4xl font-black text-white mb-1">
                    <NumberTicker value={8} />+
                  </div>
                  <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Years Experience</div>
                </div>
                <div className="col-span-2 bg-gray-50 rounded-3xl border-2 border-black/10 p-6 shadow-[4px_4px_0px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <div className="font-black text-primary-dark">End-to-End Solutions</div>
                      <div className="text-sm text-primary-dark/60">From concept to deployment</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Startups', 'SMEs', 'Enterprises', 'NGOs'].map((type) => (
                      <span key={type} className="text-xs font-bold px-3 py-1.5 bg-white rounded-full border border-black/10 text-primary-dark/70">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PLACEMENT SUCCESS STORIES ═══ */}
      <section className="py-24 md:py-32 bg-primary-dark border-b-2 border-black overflow-hidden relative">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="container-wide relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block bg-[#82C93D] text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black">
              <Star size={14} className="inline mr-2" />
              Success Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight leading-tight mb-4">
              Hear From Our<br />Placed SUGians
            </h2>
            <p className="text-white/70 text-lg font-bold">
              Real stories from real students who launched their tech careers with us.
            </p>
          </div>

          {/* Dome Gallery placement scroll */}
          {/* Edge-to-edge Dome Gallery Container - spans full viewport width */}
          <div className="relative w-screen left-1/2 -translate-x-1/2 h-[500px] md:h-[600px] lg:h-[700px]">
            <DomeGallery
              images={placementImages}
              fit={0.9}
              minRadius={500}
              maxVerticalRotationDeg={8}
              segments={10}
              dragDampening={1.8}
              grayscale={false}
              overlayBlurColor="#1A9AB5"
              imageBorderRadius="12px"
              openedImageBorderRadius="20px"
              openedImageWidth="280px"
              openedImageHeight="360px"
            />
          </div>
          
          <div className="text-center mt-12">
            <Link href="/testimonials">
              <Button size="lg" className="bg-[#82C93D] hover:bg-[#82C93D]/90 text-white rounded-full px-8 py-6 text-lg font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black transition-all hover:translate-y-1 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                View All Success Stories <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ PROGRAM HIGHLIGHTS ═══ */}
      <section className="py-24 md:py-32 bg-white border-b-2 border-black/10">
        <div className="container-wide">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
              Why Choose Us
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight leading-tight">
              Everything You Need to<br />Launch Your Career
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Play size={32} />, title: 'Live Sessions', desc: 'Interactive classes with industry experts, not just recorded videos.' },
              { icon: <Users size={32} />, title: 'MNC Mentors', desc: 'Learn from professionals working at Google, Microsoft, Amazon & more.' },
              { icon: <Award size={32} />, title: '2 Certifications', desc: 'Get both course completion and internship certificates.' },
              { icon: <Briefcase size={32} />, title: 'Placement Support', desc: 'Resume reviews, mock interviews & job referrals included.' },
              { icon: <Clock size={32} />, title: '3-Month Intensive', desc: 'Focused learning with hands-on projects every week.' },
              { icon: <CheckCircle2 size={32} />, title: 'Real Projects', desc: 'Build production-grade applications for your portfolio.' },
              { icon: <TrendingUp size={32} />, title: '98% Success Rate', desc: 'Most of our students land jobs within 3 months of completion.' },
              { icon: <Calendar size={32} />, title: 'Flexible Batches', desc: 'Weekend and weekday batches available.' },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.05}>
                <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all h-full">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary border-2 border-primary/20">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-black text-primary-dark mb-2">{item.title}</h3>
                  <p className="text-primary-dark/70 font-medium text-sm">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS SECTION ═══ */}
      <section className="py-20 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] border-y-2 border-black">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 3000, suffix: '+', label: 'Careers Transformed' },
              { value: 550, suffix: '+', label: 'SUGians Placed' },
              { value: 200, suffix: '+', label: 'Business Clients' },
              { value: 15, suffix: '+', label: 'Collaborations' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-3xl backdrop-blur-sm border-2 border-white/30 p-6">
                <div className="text-4xl md:text-5xl font-black text-white mb-2">
                  <NumberTicker value={stat.value} />{stat.suffix}
                </div>
                <div className="text-white/80 text-sm font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container-wide text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-primary-dark tracking-tight leading-tight mb-6">
            Ready to Launch Your<br /><span className="text-primary">Tech Career?</span>
          </h2>
          <p className="text-primary-dark/70 text-lg md:text-xl font-bold max-w-2xl mx-auto mb-10">
            Join our next batch and become part of the 550+ SUGians working at top MNCs. Limited seats available.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-primary-dark hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-3xl border-2 border-primary-dark px-12 h-16 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
              <Link href="/courses" className="flex items-center gap-3">
                Explore Courses <ArrowUpRight size={20} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-2 border-primary-dark text-primary-dark hover:bg-primary-dark hover:text-white font-black text-sm uppercase tracking-widest rounded-3xl px-12 h-16 shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
              <Link href="/contact">Talk to Counsellor</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
