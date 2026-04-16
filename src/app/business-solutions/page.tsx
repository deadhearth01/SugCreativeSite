'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  ArrowRight,
  Palette,
  Globe,
  Code2,
  Smartphone,
  Megaphone,
  Settings,
  CheckCircle2,
  Users,
  Shield,
  Clock,
  TrendingUp,
  Search,
  Lightbulb,
  Rocket,
  BarChart3,
  Heart,
  GraduationCap,
  Building2,
  ShoppingCart,
  Home,
  Truck,
  Film,
  Cloud,
  Zap,
  Target,
  Quote,
  Star,
  Layers,
  Database,
  Monitor,
  Figma,
  Workflow,
  BadgeCheck,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { Button } from '@/components/ui/button'

/* ──────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────── */

const services = [
  {
    icon: Palette,
    title: 'UI/UX Design',
    desc: 'Craft intuitive, user-centered experiences that delight customers and drive conversions through research-backed design.',
    color: 'bg-purple-500',
    shadow: 'shadow-[8px_8px_0px_rgba(139,92,246,1)]',
    features: ['User Research & Personas', 'Wireframing & Prototyping', 'Design Systems & Tokens', 'Usability Testing & Iteration', 'Accessibility Compliance'],
  },
  {
    icon: Globe,
    title: 'Web Design',
    desc: 'Pixel-perfect, responsive websites that capture your brand identity and convert visitors into loyal customers.',
    color: 'bg-blue-500',
    shadow: 'shadow-[8px_8px_0px_rgba(59,130,246,1)]',
    features: ['Custom Website Design', 'Landing Page Optimization', 'Responsive & Mobile-First', 'CMS Integration (WordPress)', 'Brand Identity & Style Guides'],
  },
  {
    icon: Code2,
    title: 'Web Development',
    desc: 'Scalable, performant full-stack applications built with cutting-edge frameworks and battle-tested architecture.',
    color: 'bg-[#1A9AB5]',
    shadow: 'shadow-[8px_8px_0px_rgba(26,154,181,1)]',
    features: ['React / Next.js Applications', 'Node.js & Python Backends', 'REST & GraphQL APIs', 'Database Design & Optimization', 'Cloud Deployment (AWS/GCP)'],
  },
  {
    icon: Smartphone,
    title: 'App Development',
    desc: 'Native and cross-platform mobile apps that deliver seamless experiences on every device, from concept to App Store.',
    color: 'bg-green-500',
    shadow: 'shadow-[8px_8px_0px_rgba(34,197,94,1)]',
    features: ['iOS & Android Native', 'React Native & Flutter', 'Cross-Platform Strategy', 'App Store Optimization', 'Push Notifications & Analytics'],
  },
  {
    icon: Megaphone,
    title: 'Digital Marketing',
    desc: 'Data-driven marketing strategies that put your brand in front of the right audience and generate measurable ROI.',
    color: 'bg-amber-500',
    shadow: 'shadow-[8px_8px_0px_rgba(245,158,11,1)]',
    features: ['SEO & Content Strategy', 'Google Ads & SEM', 'Social Media Marketing', 'Email Campaign Automation', 'Analytics & Conversion Tracking'],
  },
  {
    icon: Settings,
    title: 'IT Consulting',
    desc: 'Strategic technology advisory that aligns your IT infrastructure with business objectives for sustainable growth.',
    color: 'bg-rose-500',
    shadow: 'shadow-[8px_8px_0px_rgba(244,63,94,1)]',
    features: ['Digital Transformation Roadmaps', 'Cloud Migration Strategy', 'Cybersecurity Audits', 'Infrastructure Optimization', 'Technology Stack Assessment'],
  },
]

const whyUs = [
  { icon: BadgeCheck, title: 'Proven Track Record', desc: '200+ successful projects delivered across 50+ industries.' },
  { icon: Users, title: 'Dedicated Teams', desc: 'A handpicked team assigned exclusively to your project from day one.' },
  { icon: BarChart3, title: 'Transparent Pricing', desc: 'No hidden fees. Clear milestones, detailed invoicing, and open communication.' },
  { icon: Workflow, title: 'Agile Methodology', desc: 'Iterative sprints, rapid feedback loops, and continuous delivery.' },
  { icon: Clock, title: '24/7 Support', desc: 'Round-the-clock assistance so your business never misses a beat.' },
]

const processSteps = [
  { num: '01', title: 'Discovery', desc: 'We deep-dive into your business, audience, and goals through stakeholder interviews and competitive analysis.', icon: Search },
  { num: '02', title: 'Strategy', desc: 'A detailed roadmap with milestones, tech recommendations, and a clear timeline tailored to your budget.', icon: Lightbulb },
  { num: '03', title: 'Execution', desc: 'Agile development with weekly demos, rigorous QA, and transparent progress reports every step of the way.', icon: Rocket },
  { num: '04', title: 'Growth', desc: 'Post-launch optimization, analytics dashboards, and ongoing support to scale your product confidently.', icon: TrendingUp },
]

const industries = [
  { icon: Heart, title: 'Healthcare', desc: 'HIPAA-compliant portals, telemedicine platforms, and patient management systems.' },
  { icon: BarChart3, title: 'Finance', desc: 'Secure fintech apps, trading platforms, and regulatory-compliant banking solutions.' },
  { icon: GraduationCap, title: 'Education', desc: 'LMS platforms, virtual classrooms, and student engagement tools.' },
  { icon: ShoppingCart, title: 'E-commerce', desc: 'High-converting storefronts, inventory systems, and payment integrations.' },
  { icon: Home, title: 'Real Estate', desc: 'Property listing platforms, virtual tours, and CRM solutions.' },
  { icon: Truck, title: 'Logistics', desc: 'Fleet management, route optimization, and supply chain dashboards.' },
  { icon: Film, title: 'Media', desc: 'Content platforms, streaming solutions, and audience analytics.' },
  { icon: Cloud, title: 'SaaS', desc: 'Multi-tenant architectures, subscription billing, and scalable infrastructure.' },
]

const pricingTiers = [
  {
    name: 'Starter',
    tagline: 'For startups & small businesses',
    accent: 'border-[#82C93D]',
    shadow: 'shadow-[8px_8px_0px_rgba(130,201,61,1)]',
    badge: 'bg-[#82C93D]',
    features: [
      'Up to 5 pages / screens',
      'Responsive design',
      'Basic SEO setup',
      'CMS integration',
      '30-day post-launch support',
      'Hosting setup & deployment',
    ],
  },
  {
    name: 'Growth',
    tagline: 'For scaling businesses',
    accent: 'border-[#1A9AB5]',
    shadow: 'shadow-[8px_8px_0px_rgba(26,154,181,1)]',
    badge: 'bg-[#1A9AB5]',
    popular: true,
    features: [
      'Up to 15 pages / screens',
      'Custom UI/UX design',
      'Advanced SEO & analytics',
      'API integrations',
      'Performance optimization',
      '90-day post-launch support',
      'Dedicated project manager',
      'Monthly strategy calls',
    ],
  },
  {
    name: 'Enterprise',
    tagline: 'For large organizations',
    accent: 'border-primary-dark',
    shadow: 'shadow-[8px_8px_0px_rgba(0,0,0,1)]',
    badge: 'bg-primary-dark',
    features: [
      'Unlimited pages / screens',
      'Full-stack development',
      'Cloud architecture & DevOps',
      'Security audits & compliance',
      'Dedicated engineering team',
      '24/7 priority support',
      'Custom SLA agreements',
      'Quarterly business reviews',
      'White-label solutions',
    ],
  },
]

const caseStudies = [
  {
    metric: '3x',
    label: 'Revenue Growth',
    desc: 'Helped a D2C brand triple their online revenue in 8 months through a redesigned e-commerce experience and targeted ad campaigns.',
    color: 'bg-[#82C93D]',
  },
  {
    metric: '400%',
    label: 'Traffic Increase',
    desc: 'Achieved a 4x increase in organic traffic for a SaaS startup with a comprehensive SEO overhaul and content marketing strategy.',
    color: 'bg-[#1A9AB5]',
  },
  {
    metric: '60%',
    label: 'Cost Reduction',
    desc: 'Reduced operational costs by 60% for a logistics company through cloud migration and workflow automation.',
    color: 'bg-purple-500',
  },
]

const clientTestimonials = [
  {
    quote: 'Sug Creative completely transformed our digital presence. Their strategic approach helped us scale 3x in just 8 months. The ROI on their consulting was phenomenal.',
    name: 'Priya Sharma',
    role: 'CEO',
    company: 'TechVentures India',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: 'We engaged Sug Creative for our digital transformation journey. Their team delivered beyond expectations — on time, on budget, and with exceptional quality.',
    name: 'Kavitha Menon',
    role: 'CTO',
    company: 'FinServ Corp',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: 'The brand strategy and web development work they did for us was transformative. Our brand recall improved by 400% and we saw a direct impact on customer acquisition.',
    name: 'Rajesh Kumar',
    role: 'Marketing Director',
    company: 'StyleBox',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
  },
]

const techStack = [
  'React', 'Next.js', 'Node.js', 'Python', 'TypeScript',
  'AWS', 'Google Cloud', 'Flutter', 'React Native', 'Figma',
  'WordPress', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes',
  'TailwindCSS', 'GraphQL', 'Redis',
]

/* ──────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────── */

export default function BusinessSolutionsPage() {
  return (
    <main className="min-h-screen bg-[#F0F2E8]">
      <Navbar />

      {/* ═══════════════════════════════════════
          1. HERO SECTION
          ═══════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 bg-[#F0F2E8] overflow-hidden border-b-2 border-black/10">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(#82C93D 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="container-wide relative z-10 px-6 sm:px-10 lg:px-16">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-block bg-primary/20 text-primary-dark font-black text-[10px] uppercase tracking-widest px-4 py-1.5 mb-6 rounded-full border-2 border-primary">
              Enterprise-Grade Solutions
            </div>

            <h1 className="font-heading font-black text-primary-dark tracking-tight text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6">
              Business Solutions <br />
              That <span className="text-[#82C93D]">Drive Growth</span>
            </h1>

            <p className="text-primary-dark/60 text-lg md:text-xl font-bold leading-relaxed mb-10 max-w-2xl mx-auto">
              From startups to Fortune 500 enterprises, we partner with ambitious organizations to design, build, and scale digital products that deliver measurable results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary-dark text-white font-black text-sm uppercase tracking-widest rounded-3xl px-10 h-16 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all border-2 border-black"
              >
                <Link href="/contact">
                  Start Your Project <ArrowUpRight size={20} className="ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-primary-dark text-primary-dark hover:bg-primary-dark/5 font-black text-sm uppercase tracking-widest rounded-3xl px-10 h-16 transition-all"
              >
                <Link href="#services">View Our Services</Link>
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { value: '200+', label: 'Clients Served' },
                { value: '8+', label: 'Years of Experience' },
                { value: '50+', label: 'Industries Covered' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white border-2 border-black rounded-3xl p-6 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                >
                  <div className="text-3xl md:text-4xl font-black text-primary-dark mb-1">{stat.value}</div>
                  <div className="text-xs font-bold text-primary-dark/50 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          2. SERVICES OVERVIEW GRID
          ═══════════════════════════════════════ */}
      <section id="services" className="py-24 md:py-32 bg-white border-b-2 border-black/10">
        <div className="container-wide">
          <AnimatedSection>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                What We Do
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight mb-4">
                Comprehensive Digital Services
              </h2>
              <p className="text-primary-dark/60 text-lg font-bold">
                End-to-end capabilities to take your idea from napkin sketch to market-leading product.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <AnimatedSection key={service.title} delay={i * 0.08}>
                <div
                  className={`p-8 border-2 border-black rounded-3xl ${service.shadow} bg-white h-full hover:-translate-y-2 transition-all duration-300 flex flex-col`}
                >
                  <div
                    className={`w-16 h-16 ${service.color} text-white rounded-2xl flex items-center justify-center border-2 border-black mb-6`}
                  >
                    <service.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-primary-dark mb-3">{service.title}</h3>
                  <p className="text-primary-dark/70 font-medium leading-relaxed mb-6">{service.desc}</p>
                  <ul className="space-y-2 mt-auto">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm font-bold text-primary-dark/80">
                        <CheckCircle2 size={16} className="text-[#82C93D] flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          3. WHY CHOOSE US
          ═══════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[#F0F2E8] border-b-2 border-black/10">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image placeholder */}
            <AnimatedSection>
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl border-2 border-black shadow-[12px_12px_0px_rgba(130,201,61,1)] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                    alt="Team collaborating on a project"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-6 -right-6 bg-primary-dark text-white rounded-3xl border-2 border-black p-5 shadow-[6px_6px_0px_rgba(130,201,61,1)]">
                  <div className="text-3xl font-black">8+</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/70">Years</div>
                </div>
              </div>
            </AnimatedSection>

            {/* USP List */}
            <AnimatedSection delay={0.15}>
              <div>
                <div className="inline-block bg-[#82C93D] text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black">
                  Why Us
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight leading-tight mb-8">
                  Why Businesses <br />
                  <span className="text-primary">Choose Us</span>
                </h2>

                <div className="space-y-6">
                  {whyUs.map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white border-2 border-black rounded-2xl flex items-center justify-center text-primary flex-shrink-0 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                        <item.icon size={22} />
                      </div>
                      <div>
                        <h4 className="font-black text-primary-dark text-lg mb-1">{item.title}</h4>
                        <p className="text-primary-dark/60 font-medium text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          4. OUR PROCESS
          ═══════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-primary-dark border-b-2 border-black relative overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container-wide relative z-10">
          <AnimatedSection>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <div className="inline-block bg-[#82C93D] text-primary-dark font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black">
                How We Work
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight mb-4">
                Our Proven Process
              </h2>
              <p className="text-white/60 text-lg font-bold">
                A battle-tested framework that turns complex problems into elegant, scalable solutions.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, i) => (
              <AnimatedSection key={step.title} delay={i * 0.1}>
                <div className="relative bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-3xl p-8 h-full hover:bg-white/10 transition-colors duration-300 group">
                  {/* Number */}
                  <div className="text-6xl font-black text-white/[0.06] absolute top-4 right-6 leading-none select-none group-hover:text-[#82C93D]/20 transition-colors">
                    {step.num}
                  </div>

                  <div className="w-14 h-14 bg-[#82C93D] text-primary-dark rounded-2xl flex items-center justify-center border-2 border-black mb-6">
                    <step.icon size={28} />
                  </div>

                  <h3 className="text-xl font-black text-white mb-3">{step.title}</h3>
                  <p className="text-white/60 font-medium text-sm leading-relaxed">{step.desc}</p>

                  {/* Connector arrow (except last) */}
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                      <ArrowRight size={24} className="text-[#82C93D]/50" />
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          5. INDUSTRY SOLUTIONS
          ═══════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-white border-b-2 border-black/10">
        <div className="container-wide">
          <AnimatedSection>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                Industries We Serve
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight mb-4">
                Solutions For Every Industry
              </h2>
              <p className="text-primary-dark/60 text-lg font-bold">
                Domain expertise across verticals means we speak your language from day one.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {industries.map((ind, i) => (
              <AnimatedSection key={ind.title} delay={i * 0.06}>
                <div className="bg-gray-50 border-2 border-black/10 rounded-3xl p-6 text-center hover:border-primary hover:shadow-[6px_6px_0px_rgba(26,154,181,1)] hover:-translate-y-1 transition-all duration-300 h-full group">
                  <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-primary/20 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                    <ind.icon size={28} />
                  </div>
                  <h4 className="font-black text-primary-dark text-sm uppercase tracking-wider mb-2">{ind.title}</h4>
                  <p className="text-primary-dark/50 font-medium text-xs leading-relaxed">{ind.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          6. PRICING TIERS
          ═══════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[#F0F2E8] border-b-2 border-black/10">
        <div className="container-wide">
          <AnimatedSection>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <div className="inline-block bg-primary-dark text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(130,201,61,1)] border-2 border-black">
                Pricing
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight mb-4">
                Plans That Scale With You
              </h2>
              <p className="text-primary-dark/60 text-lg font-bold">
                Flexible engagement models to match your stage, scope, and budget.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <AnimatedSection key={tier.name} delay={i * 0.1}>
                <div
                  className={`relative bg-white border-2 ${tier.accent} rounded-3xl ${tier.shadow} p-8 h-full flex flex-col hover:-translate-y-2 transition-all duration-300`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1A9AB5] text-white font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full border-2 border-black">
                      Most Popular
                    </div>
                  )}

                  <div className={`inline-block ${tier.badge} text-white font-black text-xs uppercase tracking-widest px-3 py-1.5 rounded-xl mb-4 self-start`}>
                    {tier.name}
                  </div>

                  <p className="text-primary-dark/60 font-bold text-sm mb-6">{tier.tagline}</p>

                  <div className="text-3xl font-black text-primary-dark mb-6">
                    Contact for Pricing
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm font-bold text-primary-dark/80">
                        <CheckCircle2 size={16} className="text-[#82C93D] flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`w-full font-black text-sm uppercase tracking-widest rounded-2xl h-14 border-2 border-black transition-all ${
                      tier.popular
                        ? 'bg-[#1A9AB5] hover:bg-primary-dark text-white shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                        : 'bg-white hover:bg-gray-50 text-primary-dark'
                    }`}
                  >
                    <Link href="/contact">
                      Get Started <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </Button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          7. CASE STUDIES / RESULTS
          ═══════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-white border-b-2 border-black/10">
        <div className="container-wide">
          <AnimatedSection>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <div className="inline-block bg-[#82C93D] text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black">
                Results That Matter
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight mb-4">
                Proven Impact, Real Numbers
              </h2>
              <p className="text-primary-dark/60 text-lg font-bold">
                We measure success by the growth we create for our clients.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {caseStudies.map((study, i) => (
              <AnimatedSection key={study.label} delay={i * 0.1}>
                <div className="bg-gray-50 border-2 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 h-full hover:-translate-y-2 transition-all duration-300">
                  <div
                    className={`inline-block ${study.color} text-white font-black text-4xl md:text-5xl px-6 py-3 rounded-2xl border-2 border-black mb-6`}
                  >
                    {study.metric}
                  </div>
                  <h3 className="text-xl font-black text-primary-dark mb-3">{study.label}</h3>
                  <p className="text-primary-dark/60 font-medium leading-relaxed text-sm">{study.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          8. CLIENT TESTIMONIALS
          ═══════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[#F0F2E8] border-b-2 border-black/10">
        <div className="container-wide">
          <AnimatedSection>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <div className="inline-block bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                Client Testimonials
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight mb-4">
                Trusted By Industry Leaders
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {clientTestimonials.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 0.1}>
                <div className="bg-white border-2 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 h-full flex flex-col hover:-translate-y-1 transition-all duration-300">
                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} className="fill-[#82C93D] text-[#82C93D]" />
                    ))}
                  </div>

                  <Quote size={28} className="text-primary-dark/10 mb-3" />

                  <p className="text-primary-dark font-bold leading-relaxed mb-8 flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-4 pt-6 border-t-2 border-primary-dark/10">
                    <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden">
                      <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-black text-primary-dark text-sm">{t.name}</p>
                      <p className="text-primary-dark/50 text-xs font-bold">
                        {t.role}, {t.company}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          9. TECHNOLOGY STACK
          ═══════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-white border-b-2 border-black/10">
        <div className="container-wide">
          <AnimatedSection>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <div className="inline-block bg-primary-dark text-white font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-3xl shadow-[4px_4px_0px_rgba(130,201,61,1)] border-2 border-black">
                <Layers size={14} className="inline mr-2" />
                Tech Stack
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-dark tracking-tight mb-4">
                Built With The Best
              </h2>
              <p className="text-primary-dark/60 text-lg font-bold">
                We leverage industry-leading technologies to deliver robust, scalable solutions.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {techStack.map((tech) => (
                <div
                  key={tech}
                  className="bg-gray-50 border-2 border-black/10 rounded-2xl px-6 py-3 font-black text-primary-dark text-sm uppercase tracking-wider hover:border-primary hover:bg-primary/5 hover:shadow-[4px_4px_0px_rgba(26,154,181,1)] hover:-translate-y-1 transition-all duration-300 cursor-default"
                >
                  {tech}
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          10. FINAL CTA
          ═══════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[#1A9AB5] relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container-wide relative z-10 text-center">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white tracking-tight leading-tight mb-6">
              Ready to Transform <br />
              <span className="text-[#82C93D]">Your Business?</span>
            </h2>
            <p className="text-white/70 text-lg md:text-xl font-bold max-w-2xl mx-auto mb-10">
              Let&apos;s discuss how we can help you achieve your business goals. Book a free strategy call with our team today.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-[#82C93D] hover:bg-white hover:text-primary-dark text-primary-dark font-black text-sm uppercase tracking-widest rounded-3xl px-12 h-16 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all border-2 border-black"
              >
                <Link href="/contact">
                  Start Your Project <ArrowUpRight size={20} className="ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-dark font-black text-sm uppercase tracking-widest rounded-3xl px-12 h-16 transition-all"
              >
                <Link href="/contact">Book a Strategy Call</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </main>
  )
}
