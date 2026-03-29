import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Sparkles, Clock, Award, Users, Calendar, ArrowRight, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Courses | Sug Creative",
  description: "Explore our industry-focused internship programs in DevOps, Cyber Security, IoT & Embedded Systems, and Full Stack Development. Get trained by MNC mentors with placement support.",
};

// Color theme mapping
const colorThemes: Record<string, { bg: string; accent: string; gradient: string; border: string }> = {
  violet: {
    bg: "bg-violet-50",
    accent: "text-violet-600",
    gradient: "from-violet-500 to-purple-600",
    border: "border-violet-300",
  },
  blue: {
    bg: "bg-blue-50",
    accent: "text-blue-600",
    gradient: "from-blue-500 to-cyan-600",
    border: "border-blue-300",
  },
  green: {
    bg: "bg-green-50",
    accent: "text-green-600",
    gradient: "from-green-500 to-emerald-600",
    border: "border-green-300",
  },
  gold: {
    bg: "bg-amber-50",
    accent: "text-amber-600",
    gradient: "from-amber-500 to-orange-600",
    border: "border-amber-300",
  },
  cyan: {
    bg: "bg-cyan-50",
    accent: "text-cyan-600",
    gradient: "from-cyan-500 to-blue-600",
    border: "border-cyan-300",
  },
};

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "active")
    .eq("category", "edu_tech")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-[#82C93D]/10 via-white to-[#35C8E0]/10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-[#82C93D]/20 mb-6">
              <GraduationCap className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-widest">Career Programs</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Launch Your <span className="bg-gradient-to-r from-[#82C93D] to-[#35C8E0] bg-clip-text text-transparent">Tech Career</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Industry-focused internship programs designed by MNC mentors. Get real-world experience, certifications, and placement support.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Clock className="w-4 h-4 text-[#35C8E0]" />
                <span className="font-bold">3-Month Programs</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Award className="w-4 h-4 text-[#82C93D]" />
                <span className="font-bold">2 Certifications</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Users className="w-4 h-4 text-violet-600" />
                <span className="font-bold">MNC Mentors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {courses?.map((course) => {
              const theme = colorThemes[course.color_theme || "cyan"];
              const highlights = course.highlights as string[] || [];
              const techStack = course.tech_stack || [];

              return (
                <div
                  key={course.id}
                  className={`relative border-2 border-black bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1`}
                >
                  {/* Featured Badge */}
                  {course.is_featured && (
                    <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] text-white text-xs font-bold uppercase border-2 border-black">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      Featured
                    </div>
                  )}

                  {/* Header */}
                  <div className={`p-6 ${theme.bg} border-b-2 border-black`}>
                    <h2 className="text-2xl font-black tracking-tight mb-2">{course.title}</h2>
                    <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                  </div>

                  {/* Tech Stack */}
                  <div className="p-6 border-b-2 border-black">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Technologies</p>
                    <div className="flex flex-wrap gap-2">
                      {techStack.slice(0, 6).map((tech: string, i: number) => (
                        <span
                          key={i}
                          className={`px-2 py-1 text-xs font-bold ${theme.bg} ${theme.accent} border ${theme.border}`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="p-6 border-b-2 border-black">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">What You'll Learn</p>
                    <ul className="space-y-2">
                      {highlights.slice(0, 4).map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className={`w-1.5 h-1.5 mt-2 rounded-full bg-gradient-to-r ${theme.gradient}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black">₹{course.offer_price?.toLocaleString() || course.price?.toLocaleString()}</span>
                        {course.original_price && course.original_price > (course.offer_price || course.price) && (
                          <span className="text-lg text-gray-400 line-through">₹{course.original_price.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{course.duration_text || "3 Months"}</span>
                        {course.batch_start_date && (
                          <>
                            <span>•</span>
                            <Calendar className="w-3 h-3" />
                            <span>Starts {new Date(course.batch_start_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/courses/${course.slug}`}
                      className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.gradient} text-white font-bold border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all`}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {(!courses || courses.length === 0) && (
            <div className="text-center py-20">
              <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold mb-2">No Courses Available</h3>
              <p className="text-gray-500">Check back soon for new programs!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-r from-[#82C93D]/10 to-[#35C8E0]/10 border-t-2 border-b-2 border-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-12">Why Choose Our Programs?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "🎯", title: "Live Sessions", desc: "Interactive classes with industry experts" },
                { icon: "💼", title: "Placement Support", desc: "Resume building & interview prep" },
                { icon: "📜", title: "2 Certifications", desc: "Industry-recognized certificates" },
                { icon: "🏆", title: "8+ Years Excellence", desc: "Proven track record of success" },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] text-center"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to Start Your Journey?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Join our next batch and transform your career with industry-relevant skills and mentorship.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] text-white font-bold text-lg border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Get in Touch
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
