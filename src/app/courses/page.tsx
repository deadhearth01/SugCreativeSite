import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard, { type CourseCardData } from "@/components/courses/CourseCard";
import {
  Clock, Award, Users, ArrowRight, GraduationCap, Play, Briefcase,
  FileCheck2, Trophy, Layers, Rocket,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Courses | Sug Creative",
  description:
    "Explore our specialization career programs and short training internships in DevOps, Cyber Security, IoT & Embedded Systems, and Full Stack Development. Trained by MNC mentors with placement support.",
};

type Course = CourseCardData & { course_type?: string | null };

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "active")
    .eq("category", "edu_tech")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  const courses = (data ?? []) as Course[];
  // Rows created before course_type existed fall back to 'specialization'.
  const specialization = courses.filter(
    (c) => (c.course_type || "specialization") === "specialization"
  );
  const training = courses.filter((c) => c.course_type === "training");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-[#82C93D]/10 via-white to-[#35C8E0]/10 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-[#82C93D]/20 mb-6 shadow-sm">
                <GraduationCap className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-widest">Career Programs</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                Launch Your{" "}
                <span className="bg-gradient-to-r from-[#82C93D] to-[#35C8E0] bg-clip-text text-transparent">
                  Tech Career
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Industry-focused programs designed by MNC mentors. Get real-world experience,
                certifications, and placement support.
              </p>

              {/* Category anchors */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <a
                  href="#specialization"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] text-white font-bold rounded-2xl shadow-lg hover:scale-[0.98] transition-all"
                >
                  <Layers className="w-4 h-4" />
                  Specialization Courses
                </a>
                <a
                  href="#internships"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1A9AB5] font-bold rounded-2xl border-2 border-[#35C8E0] shadow-lg hover:scale-[0.98] transition-all"
                >
                  <Rocket className="w-4 h-4" />
                  Internships
                </a>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl border border-gray-200 shadow-md">
                  <Clock className="w-4 h-4 text-[#35C8E0]" />
                  <span className="font-bold">3-Month Programs</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl border border-gray-200 shadow-md">
                  <Award className="w-4 h-4 text-[#82C93D]" />
                  <span className="font-bold">2 Certifications</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl border border-gray-200 shadow-md">
                  <Users className="w-4 h-4 text-violet-600" />
                  <span className="font-bold">MNC Mentors</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Specialization Courses ── */}
        <section id="specialization" className="py-16 bg-white scroll-mt-24">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <Layers className="w-6 h-6 text-[#1A9AB5]" />
                <h2 className="text-3xl font-black tracking-tight">Specialization Courses</h2>
              </div>
              <p className="text-gray-600 mb-10 max-w-2xl">
                In-depth career programs that take you from fundamentals to job-ready, with live
                mentorship, certifications and placement support.
              </p>

              {specialization.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-8">
                  {specialization.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 rounded-3xl border border-dashed border-gray-200">
                  <GraduationCap className="w-14 h-14 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold mb-1">No specialization courses yet</h3>
                  <p className="text-gray-500 text-sm">Check back soon for new programs.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Internships (internship programs) ── */}
        <section
          id="internships"
          className="py-16 bg-gradient-to-br from-[#35C8E0]/5 via-white to-[#82C93D]/5 scroll-mt-24"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <Rocket className="w-6 h-6 text-[#82C93D]" />
                  <h2 className="text-3xl font-black tracking-tight">Internships</h2>
                </div>
                <Link
                  href="/internships"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#1A9AB5] font-bold text-sm rounded-xl border-2 border-[#35C8E0] hover:scale-[0.98] transition-all"
                >
                  View all internships
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-gray-600 mb-10 max-w-2xl">
                Short, hands-on internship programs built around live projects — the fastest way to
                turn classroom knowledge into real industry experience.
              </p>

              {training.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-8">
                  {training.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 rounded-3xl border border-dashed border-gray-200 bg-white/60">
                  <Rocket className="w-14 h-14 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold mb-1">No internships published yet</h3>
                  <p className="text-gray-500 text-sm mb-5">
                    Explore the internships page to see how these programs work.
                  </p>
                  <Link
                    href="/internships"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] text-white font-bold rounded-xl shadow-lg hover:scale-[0.98] transition-all"
                  >
                    Explore Internships
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section className="py-16 bg-gradient-to-r from-[#82C93D]/10 to-[#35C8E0]/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-black text-center mb-12">Why Choose Our Programs?</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { Icon: Play, title: "Live Sessions", desc: "Interactive classes with industry experts" },
                  { Icon: Briefcase, title: "Placement Support", desc: "Resume building & interview prep" },
                  { Icon: FileCheck2, title: "2 Certifications", desc: "Industry-recognized certificates" },
                  { Icon: Trophy, title: "8+ Years Excellence", desc: "Proven track record of success" },
                ].map((feature, i) => (
                  <div key={i} className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-[#82C93D]/20 to-[#35C8E0]/20 rounded-xl flex items-center justify-center">
                      <feature.Icon className="w-6 h-6 text-[#1A9AB5]" />
                    </div>
                    <h3 className="font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to Start Your Journey?</h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Join our next batch and transform your career with industry-relevant skills and mentorship.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-lg hover:scale-[0.98] transition-all"
            >
              Get in Touch
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
