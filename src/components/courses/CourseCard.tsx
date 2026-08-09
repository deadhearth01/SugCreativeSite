import Link from "next/link";
import Image from "next/image";
import { Sparkles, Clock, Calendar, ArrowRight } from "lucide-react";

export type CourseCardData = {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  color_theme?: string | null;
  tech_stack?: string[] | null;
  highlights?: string[] | null;
  price?: number | null;
  offer_price?: number | null;
  original_price?: number | null;
  duration_text?: string | null;
  batch_start_date?: string | null;
  is_featured?: boolean | null;
};

export const colorThemes: Record<
  string,
  { bg: string; accent: string; gradient: string; border: string }
> = {
  violet: { bg: "bg-violet-50", accent: "text-violet-600", gradient: "from-violet-500 to-purple-600", border: "border-violet-300" },
  blue: { bg: "bg-blue-50", accent: "text-blue-600", gradient: "from-blue-500 to-cyan-600", border: "border-blue-300" },
  green: { bg: "bg-green-50", accent: "text-green-600", gradient: "from-green-500 to-emerald-600", border: "border-green-300" },
  gold: { bg: "bg-amber-50", accent: "text-amber-600", gradient: "from-amber-500 to-orange-600", border: "border-amber-300" },
  cyan: { bg: "bg-cyan-50", accent: "text-cyan-600", gradient: "from-cyan-500 to-blue-600", border: "border-cyan-300" },
};

export default function CourseCard({ course }: { course: CourseCardData }) {
  const theme = colorThemes[course.color_theme || "cyan"] ?? colorThemes.cyan;
  const highlights = course.highlights ?? [];
  const techStack = course.tech_stack ?? [];

  return (
    <div className="relative rounded-3xl border border-gray-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {course.is_featured && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-gradient-to-r from-[#82C93D] to-[#35C8E0] text-white text-xs font-bold uppercase rounded-2xl shadow-lg">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Featured
        </div>
      )}

      {course.thumbnail_url && (
        <div className="relative h-48 border-b border-gray-100">
          <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" />
        </div>
      )}

      <div className={`p-6 ${theme.bg}`}>
        <h3 className="text-2xl font-black tracking-tight mb-2">{course.title}</h3>
        {course.description && (
          <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
        )}
      </div>

      {techStack.length > 0 && (
        <div className="p-6 border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Technologies</p>
          <div className="flex flex-wrap gap-2">
            {techStack.slice(0, 6).map((tech, i) => (
              <span
                key={i}
                className={`px-3 py-1 text-xs font-bold rounded-xl ${theme.bg} ${theme.accent} border ${theme.border}`}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {highlights.length > 0 && (
        <div className="p-6 border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">{"What You'll Learn"}</p>
          <ul className="space-y-2">
            {highlights.slice(0, 4).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={`w-1.5 h-1.5 mt-2 rounded-full bg-gradient-to-r ${theme.gradient} shrink-0`} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-6 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black">
              {"₹"}
              {(course.offer_price ?? course.price ?? 0).toLocaleString()}
            </span>
            {course.original_price != null &&
              course.original_price > (course.offer_price ?? course.price ?? 0) && (
                <span className="text-lg text-gray-400 line-through">
                  {"₹"}
                  {course.original_price.toLocaleString()}
                </span>
              )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{course.duration_text || "3 Months"}</span>
            {course.batch_start_date && (
              <>
                <span>{"•"}</span>
                <Calendar className="w-3 h-3" />
                <span>
                  Starts{" "}
                  {new Date(course.batch_start_date).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
        </div>
        <Link
          href={`/courses/${course.slug}`}
          className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.gradient} text-white font-bold rounded-xl shadow-lg hover:shadow-md hover:scale-[0.98] transition-all shrink-0`}
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
