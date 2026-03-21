'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Clock, User, Tag, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedSection from '@/components/AnimatedSection'

gsap.registerPlugin(ScrollTrigger)

const blogPosts = [
  {
    title: '10 Strategies to Scale Your Business in 2026',
    excerpt: 'Discover the key strategies that successful businesses are using to scale rapidly in the current market landscape and beyond.',
    category: 'Business Insights',
    author: 'Sujith Kumar',
    date: 'Feb 20, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    featured: true,
  },
  {
    title: 'The Complete Guide to Career Switching in Tech',
    excerpt: 'Everything you need to know about transitioning into the tech industry, from skills to strategies.',
    category: 'Career Tips',
    author: 'Vikram Desai',
    date: 'Feb 15, 2026',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=500&fit=crop',
  },
  {
    title: 'How to Validate Your Startup Idea Before Building',
    excerpt: 'A step-by-step framework for testing your startup concept without writing a single line of code.',
    category: 'Startup Guidance',
    author: 'Meera Nair',
    date: 'Feb 10, 2026',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=500&fit=crop',
  },
  {
    title: 'Building a Personal Brand on LinkedIn',
    excerpt: 'Learn how to build an authentic personal brand that attracts opportunities and opens doors.',
    category: 'Career Tips',
    author: 'Ananya Rao',
    date: 'Feb 5, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=500&fit=crop',
  },
  {
    title: 'Digital Marketing Trends Every Business Should Know',
    excerpt: 'The landscape of digital marketing is evolving rapidly. Here are the trends that matter for 2026.',
    category: 'Business Insights',
    author: 'Preethi Menon',
    date: 'Jan 28, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=500&fit=crop',
  },
  {
    title: 'Fundraising 101: From Seed to Series A',
    excerpt: 'A founder\'s guide to navigating the fundraising journey, from building your pitch to closing the round.',
    category: 'Startup Guidance',
    author: 'Meera Nair',
    date: 'Jan 20, 2026',
    readTime: '15 min read',
    image: 'https://images.unsplash.com/photo-1553729459-abe7fe5a8b81?w=800&h=500&fit=crop',
  },
  {
    title: 'Resume Mistakes That Are Costing You Interviews',
    excerpt: 'Common resume errors that professionals make and how to fix them for better results in your job search.',
    category: 'Career Tips',
    author: 'Vikram Desai',
    date: 'Jan 15, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=500&fit=crop',
  },
  {
    title: 'The Power of Strategic Partnerships for Growth',
    excerpt: 'How forming the right partnerships can accelerate your business growth exponentially.',
    category: 'Business Insights',
    author: 'Sujith Kumar',
    date: 'Jan 10, 2026',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop',
  },
  {
    title: 'Product-Market Fit: How to Know You\'ve Found It',
    excerpt: 'The definitive guide to recognizing and achieving product-market fit for your startup.',
    category: 'Startup Guidance',
    author: 'Rahul Joshi',
    date: 'Jan 5, 2026',
    readTime: '11 min read',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=500&fit=crop',
  },
]

const categories = ['All', 'Career Tips', 'Startup Guidance', 'Business Insights']

const categoryColors: Record<string, string> = {
  'Business Insights': 'bg-primary-dark text-white border-primary-dark',
  'Career Tips': 'bg-[#4DA8DB] text-white border-[#4DA8DB]',
  'Startup Guidance': 'bg-white text-primary-dark border-primary-dark',
}

export default function BlogPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? blogPosts
    : blogPosts.filter(p => p.category === activeCategory)

  const featuredPost = filtered[0]
  const gridPosts = filtered.slice(1)

  useEffect(() => {
    if (heroRef.current) {
      gsap.set(heroRef.current.querySelectorAll('.hero-animate'), { y: 40, opacity: 0 })
      gsap.to(heroRef.current.querySelectorAll('.hero-animate'), {
        y: 0, opacity: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.4,
      })
    }
    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-20 bg-[#fdfbf9] border-b-2 border-black/10 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="container-wide relative z-10" ref={heroRef}>
          <div className="flex flex-col lg:flex-row items-end justify-between gap-10">
            <div className="max-w-3xl">
              <div className="hero-animate inline-flex items-center gap-3 bg-white text-primary font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-primary-dark">
                <div className="w-2 h-2 bg-green-500 rounded-none animate-pulse" />
                Blog & Insights
              </div>
              <h1 className="hero-animate text-5xl sm:text-6xl md:text-7xl font-heading font-black text-primary-dark leading-[1.05] tracking-tight mb-6">
                Insights to<br />
                <span className="text-[#4DA8DB]">Fuel Your Growth</span>
              </h1>
              <p className="hero-animate text-lg md:text-xl text-primary-dark/70 font-bold leading-relaxed border-l-4 border-primary pl-5">
                Expert articles, guides, and actionable tips on business strategy,
                career development, and startup building — written by practitioners.
              </p>
            </div>
            <div className="hero-animate shrink-0">
              <div className="text-right">
                <div className="text-5xl font-heading font-black text-primary-dark">{blogPosts.length}</div>
                <div className="text-xs font-black uppercase tracking-widest text-primary-dark/50">Articles Published</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CATEGORY FILTER ═══ */}
      <section className="bg-white border-b-2 border-black/10 sticky top-[68px] z-30">
        <div className="container-wide">
          <div className="flex gap-2 py-4 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap font-black text-xs uppercase tracking-widest px-6 py-3 border-2 rounded-none transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-primary-dark text-white border-primary-dark shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-primary-dark border-primary-dark/30 hover:border-primary-dark hover:shadow-[3px_3px_0px_rgba(0,0,0,0.5)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED POST ═══ */}
      {featuredPost && (
        <section className="py-16 md:py-24 bg-gray-50 border-b-2 border-black/10">
          <div className="container-wide">
            <AnimatedSection>
              <Link href="#" className="group block">
                <div className="flex flex-col lg:flex-row border-2 border-primary-dark rounded-none shadow-[12px_12px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[16px_16px_0px_rgba(0,0,0,1)] transition-all duration-300 overflow-hidden bg-white">
                  {/* Image */}
                  <div className="relative lg:w-[55%] h-64 lg:h-auto min-h-[380px] overflow-hidden border-b-2 lg:border-b-0 lg:border-r-2 border-primary-dark">
                    <Image
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-primary-dark/20 group-hover:opacity-0 transition-opacity" />
                    {/* Featured badge */}
                    <div className="absolute top-6 left-6 bg-primary-dark text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 border-2 border-white shadow-[3px_3px_0px_rgba(255,255,255,0.3)]">
                      Featured Article
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:w-[45%] p-10 md:p-12 flex flex-col justify-center">
                    <div className={`inline-block font-black text-[10px] uppercase tracking-widest px-4 py-2 mb-6 border-2 w-fit shadow-[3px_3px_0px_rgba(0,0,0,0.5)] ${categoryColors[featuredPost.category] || 'bg-primary-dark text-white'}`}>
                      {featuredPost.category}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-heading font-black text-primary-dark mb-4 leading-tight group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-primary-dark/70 font-bold leading-relaxed mb-6">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-primary-dark/50 mb-8 border-t-2 border-black/5 pt-5">
                      <span className="flex items-center gap-1.5"><User size={13} />{featuredPost.author}</span>
                      <span className="flex items-center gap-1.5"><Clock size={13} />{featuredPost.readTime}</span>
                      <span>{featuredPost.date}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest text-primary-dark border-b-2 border-primary-dark group-hover:text-[#4DA8DB] group-hover:border-[#4DA8DB] transition-colors w-fit pb-1">
                      Read Full Article <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ═══ BLOG GRID ═══ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-wide">
          {gridPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridPosts.map((post, i) => (
                <AnimatedSection key={post.title} delay={i * 0.08}>
                  <Link href="#" className="group block h-full">
                    <div className="border-2 border-primary-dark rounded-none shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] transition-all duration-300 overflow-hidden bg-white h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-52 overflow-hidden border-b-2 border-primary-dark shrink-0">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-primary-dark/20 group-hover:opacity-0 transition-opacity" />
                        {/* Category overlay */}
                        <div className="absolute top-4 left-4">
                          <span className={`inline-block font-black text-[10px] uppercase tracking-widest px-3 py-1.5 border-2 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] ${categoryColors[post.category] || 'bg-primary-dark text-white'}`}>
                            {post.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-lg font-heading font-black text-primary-dark mb-3 group-hover:text-primary transition-colors leading-tight flex-1">
                          {post.title}
                        </h3>
                        <p className="text-primary-dark/60 text-sm font-bold leading-relaxed mb-5">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs font-bold text-primary-dark/40 pt-4 border-t-2 border-black/5">
                          <span className="flex items-center gap-1.5"><User size={11} />{post.author}</span>
                          <span className="flex items-center gap-1.5"><Clock size={11} />{post.readTime}</span>
                        </div>
                      </div>

                      {/* Footer CTA */}
                      <div className="px-6 py-4 border-t-2 border-primary-dark/10 flex items-center justify-between bg-gray-50/80 group-hover:bg-primary-dark transition-colors duration-300">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary-dark/40 group-hover:text-white/50 transition-colors">{post.date}</span>
                        <ArrowUpRight size={16} className="text-primary-dark/30 group-hover:text-[#4DA8DB] transition-colors" />
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-primary-dark/30 font-black text-xl uppercase tracking-widest">No articles in this category yet</div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ NEWSLETTER ═══ */}
      <section className="py-24 bg-primary-dark relative overflow-hidden border-t-2 border-black">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="container-wide relative z-10">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
              <div className="max-w-xl">
                <div className="inline-block bg-white text-primary-dark font-black text-xs uppercase tracking-widest px-4 py-2 mb-6 rounded-none shadow-[4px_4px_0px_rgba(255,255,255,0.2)] border-2 border-white/30">
                  Stay Ahead
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-4 leading-tight">
                  Get Weekly<br /><span className="text-[#4DA8DB]">Growth Insights</span>
                </h2>
                <p className="text-white/50 font-bold">
                  Join 5,000+ professionals who get our weekly insights on business, career, and startups.
                </p>
              </div>
              <div className="w-full md:w-auto md:min-w-[420px]">
                <form className="flex" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-white/5 border-2 border-white/20 text-white placeholder:text-white/40 px-5 py-4 focus:outline-none focus:border-white focus:bg-white/10 transition-all rounded-none font-bold text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-white text-primary-dark px-6 py-4 border-2 border-white hover:bg-[#4DA8DB] hover:border-[#4DA8DB] hover:text-white transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-[4px_4px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                  >
                    Subscribe
                    <ArrowUpRight size={16} />
                  </button>
                </form>
                <p className="text-white/30 text-xs mt-3 font-bold">No spam. Unsubscribe anytime.</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </>
  )
}
