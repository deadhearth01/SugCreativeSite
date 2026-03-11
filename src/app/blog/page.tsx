'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock, User, Tag } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const blogPosts = [
  {
    title: '10 Strategies to Scale Your Business in 2026',
    excerpt: 'Discover the key strategies that successful businesses are using to scale rapidly in the current market landscape.',
    category: 'Business Insights',
    author: 'Sujith Kumar',
    date: 'Feb 20, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1553729459-uj68e0ef7bf5?w=800&h=500&fit=crop',
  },
  {
    title: 'Resume Mistakes That Are Costing You Interviews',
    excerpt: 'Common resume errors that professionals make and how to fix them for better results.',
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

export default function BlogPage() {
  const heroRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (heroRef.current) {
      gsap.from(heroRef.current, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.3 })
    }
  }, [])

  return (
    <>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 bg-white">
        <div className="container-wide">
          <div className="max-w-4xl">
            <Badge variant="secondary" className="mb-4 rounded-sm bg-primary-ghost text-primary-bright font-semibold uppercase tracking-widest text-xs px-3 py-1">
              Blog & Resources
            </Badge>
            <h1 ref={heroRef} className="text-4xl md:text-5xl lg:text-[3.25rem] font-heading font-bold text-primary leading-tight mb-6">
              Insights to{' '}
              <span className="bg-gradient-to-r from-primary via-primary-light to-primary-bright bg-clip-text text-transparent">Fuel Your Growth</span>
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl leading-relaxed">
              Expert articles, guides, and actionable tips on business strategy, 
              career development, and startup building.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ CATEGORY FILTER ═══ */}
      <section className="bg-white border-b border-border sticky top-[72px] z-30">
        <div className="container-wide">
          <div className="flex gap-1 py-4 overflow-x-auto">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={cat === 'All' ? 'default' : 'ghost'}
                size="sm"
                className={`rounded-sm whitespace-nowrap text-sm font-medium ${
                  cat === 'All'
                    ? 'bg-primary text-white hover:bg-primary-deep'
                    : 'text-foreground-muted hover:bg-off-white hover:text-primary'
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED POST ═══ */}
      <section className="py-16 bg-off-white">
        <div className="container-wide">
          <AnimatedSection>
            <Card className="rounded-sm shadow-none border-border overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative h-64 lg:h-auto lg:min-h-[380px]">
                  <Image src={blogPosts[0].image} alt={blogPosts[0].title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
                <CardContent className="p-10 flex flex-col justify-center">
                  <Badge variant="secondary" className="rounded-sm bg-primary-ghost text-primary-bright font-semibold uppercase tracking-wider text-xs w-fit mb-3 px-3 py-1">
                    {blogPosts[0].category}
                  </Badge>
                  <h2 className="text-2xl lg:text-3xl font-heading font-bold text-primary mb-4">{blogPosts[0].title}</h2>
                  <p className="text-foreground-muted leading-relaxed mb-6">{blogPosts[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-foreground-subtle mb-6">
                    <span className="flex items-center gap-1"><User size={14} />{blogPosts[0].author}</span>
                    <span className="flex items-center gap-1"><Clock size={14} />{blogPosts[0].readTime}</span>
                    <span>{blogPosts[0].date}</span>
                  </div>
                  <Link href="#" className="inline-flex items-center gap-2 text-primary-bright font-semibold hover:gap-3 transition-all">
                    Read Article <ArrowRight size={16} />
                  </Link>
                </CardContent>
              </div>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ BLOG GRID ═══ */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post, i) => (
              <AnimatedSection key={post.title} delay={i * 0.08}>
                <Link href="#" className="block group">
                  <Card className="rounded-sm shadow-none border-border hover-lift h-full flex flex-col overflow-hidden card-shine">
                    <div className="relative h-48 overflow-hidden">
                      <Image src={post.image} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag size={12} className="text-primary-bright" />
                        <span className="text-xs font-semibold text-primary-bright">{post.category}</span>
                      </div>
                      <h3 className="text-lg font-heading font-bold text-primary mb-2 group-hover:text-primary-bright transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-foreground-muted text-sm leading-relaxed mb-4 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-foreground-subtle pt-4 border-t border-border-light">
                        <span>{post.author}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{post.readTime}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
