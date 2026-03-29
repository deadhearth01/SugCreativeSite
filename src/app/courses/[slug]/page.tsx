import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  Clock, Award, Users, Calendar, ArrowRight, ArrowLeft, 
  CheckCircle2, Sparkles, GraduationCap, BookOpen, Target,
  Briefcase, Play
} from "lucide-react";

// Color theme mapping
const colorThemes: Record<string, { bg: string; accent: string; gradient: string; border: string; light: string }> = {
  violet: {
    bg: "bg-violet-100",
    light: "bg-violet-50",
    accent: "text-violet-600",
    gradient: "from-violet-500 to-purple-600",
    border: "border-violet-300",
  },
  blue: {
    bg: "bg-blue-100",
    light: "bg-blue-50",
    accent: "text-blue-600",
    gradient: "from-blue-500 to-cyan-600",
    border: "border-blue-300",
  },
  green: {
    bg: "bg-green-100",
    light: "bg-green-50",
    accent: "text-green-600",
    gradient: "from-green-500 to-emerald-600",
    border: "border-green-300",
  },
  gold: {
    bg: "bg-amber-100",
    light: "bg-amber-50",
    accent: "text-amber-600",
    gradient: "from-amber-500 to-orange-600",
    border: "border-amber-300",
  },
  cyan: {
    bg: "bg-cyan-100",
    light: "bg-cyan-50",
    accent: "text-cyan-600",
    gradient: "from-cyan-500 to-blue-600",
    border: "border-cyan-300",
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("title, description")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!course) {
    return { title: "Course Not Found | Sug Creative" };
  }

  return {
    title: `${course.title} | Sug Creative`,
    description: course.description,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!course) {
    notFound();
  }

  const theme = colorThemes[course.color_theme || "cyan"];
  const highlights = (course.highlights as string[]) || [];
  const techStack = course.tech_stack || [];
  const syllabus = course.syllabus as { modules?: { title: string; topics: string[] }[] } | null;

  const perks = [
    { icon: Play, label: "Live Interactive Sessions" },
    { icon: Clock, label: course.duration_text || "3-Month Program" },
    { icon: Users, label: "Top MNC Mentors" },
    { icon: Briefcase, label: "Placement Support" },
    { icon: Award, label: "2 Certifications" },
    { icon: GraduationCap, label: "Real Projects" },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className={`relative py-16 ${theme.light} border-b-2 border-black overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="container mx-auto px-4 relative">
          {/* Back Link */}
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-bold mb-8 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            All Courses
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Course Info */}
            <div>
              {course.is_featured && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] text-white text-sm font-bold mb-6 border-2 border-black">
                  <Sparkles className="w-4 h-4" />
                  Featured Program
                </div>
              )}

              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                {course.title}
              </h1>

              <p className="text-lg text-gray-600 mb-6">
                {course.description}
              </p>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {techStack.map((tech: string, i: number) => (
                  <span
                    key={i}
                    className={`px-3 py-1 text-sm font-bold ${theme.bg} ${theme.accent} border ${theme.border}`}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-5xl font-black">
                  ₹{(course.offer_price || course.price)?.toLocaleString()}
                </span>
                {course.original_price && course.original_price > (course.offer_price || course.price) && (
                  <>
                    <span className="text-2xl text-gray-400 line-through">
                      ₹{course.original_price.toLocaleString()}
                    </span>
                    <span className={`px-2 py-1 ${theme.bg} ${theme.accent} text-sm font-bold border ${theme.border}`}>
                      {Math.round((1 - (course.offer_price || course.price) / course.original_price) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Batch Info */}
              {course.batch_start_date && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Next Batch: <strong>{new Date(course.batch_start_date).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</strong>
                  </span>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${theme.gradient} text-white font-bold text-lg border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all`}
                >
                  Enroll Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white font-bold text-lg border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  Request Callback
                </Link>
              </div>
            </div>

            {/* Right - Perks Card */}
            <div className="border-2 border-black bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)]">
              <div className={`p-4 ${theme.bg} border-b-2 border-black`}>
                <h3 className="font-bold text-lg">Program Highlights</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-gray-200">
                      <perk.icon className={`w-5 h-5 ${theme.accent}`} />
                      <span className="text-sm font-medium">{perk.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      {highlights.length > 0 && (
        <section className="py-16 bg-white border-b-2 border-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Target className={`w-6 h-6 ${theme.accent}`} />
                <h2 className="text-3xl font-black">What You'll Learn</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {highlights.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-4 ${theme.light} border-2 border-black`}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${theme.accent} flex-shrink-0 mt-0.5`} />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Syllabus */}
      {syllabus?.modules && syllabus.modules.length > 0 && (
        <section className="py-16 bg-gray-50 border-b-2 border-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <BookOpen className={`w-6 h-6 ${theme.accent}`} />
                <h2 className="text-3xl font-black">Course Syllabus</h2>
              </div>
              <div className="space-y-4">
                {syllabus.modules.map((module, i) => (
                  <details
                    key={i}
                    className="group bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer font-bold hover:bg-gray-50">
                      <span className="flex items-center gap-3">
                        <span className={`w-8 h-8 flex items-center justify-center ${theme.bg} ${theme.accent} border ${theme.border} text-sm font-bold`}>
                          {i + 1}
                        </span>
                        {module.title}
                      </span>
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="p-4 pt-0 border-t border-gray-200">
                      <ul className="space-y-2">
                        {module.topics.map((topic, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${theme.gradient}`} />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why This Program */}
      <section className="py-16 bg-white border-b-2 border-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-12">Why Choose This Program?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "🎓", title: "Industry Curriculum", desc: "Designed by professionals from top MNCs" },
                { icon: "💻", title: "Hands-on Projects", desc: "Build real-world applications from scratch" },
                { icon: "🎯", title: "Live Sessions", desc: "Interactive classes with Q&A support" },
                { icon: "📜", title: "Dual Certification", desc: "Get both completion & internship certificates" },
                { icon: "💼", title: "Placement Support", desc: "Resume reviews & mock interviews" },
                { icon: "🤝", title: "1:1 Mentorship", desc: "Personal guidance throughout the program" },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 bg-gradient-to-r ${theme.gradient}`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to Start Your {course.title.replace(" Internship", "")} Journey?
          </h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            Join our next batch and get the skills, certifications, and placement support you need to launch your career.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold text-lg border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Enroll Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white font-bold text-lg border-2 border-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              View All Courses
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
