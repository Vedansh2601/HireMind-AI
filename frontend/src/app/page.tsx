import Link from "next/link";
import { IconCheck, IconUploadCloud, IconBolt } from "./components/icons";

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div
        className="text-xs text-[#e2a33d] mb-4 tracking-widest uppercase"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        For job seekers
      </div>

      <h1
        className="text-5xl leading-tight mb-5 max-w-xl"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
      >
        Apply in minutes. No account, no hassle.
      </h1>

      <p className="text-[#8b96a3] text-base max-w-md mb-7 leading-relaxed">
        Upload your resume, fill in a few details, and you're done. No sign-up,
        no twenty-question forms — just a fast way to get your application in
        front of the right people.
      </p>

      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-10 text-sm text-[#8b96a3]">
        <span className="inline-flex items-center gap-1.5">
          <IconCheck size={13} className="text-[#5fbe8a]" /> No account needed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <IconUploadCloud size={14} className="text-[#5fbe8a]" /> Just upload a PDF resume
        </span>
        <span className="inline-flex items-center gap-1.5">
          <IconBolt size={13} className="text-[#5fbe8a]" /> Takes under a minute
        </span>
      </div>

      {/* signature scanning divider */}
      <div className="relative h-px w-full max-w-xl bg-[#2b3340] mb-14 overflow-hidden rounded-full">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-[#e2a33d] to-transparent animate-[scan_3.5s_ease-in-out_infinite]" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/jobs"
          className="hm-fade-in group border border-[#e2a33d]/40 bg-[#171c24] rounded-2xl p-6 hover:border-[#e2a33d] hover:-translate-y-0.5 transition-all" style={{ boxShadow: "0 12px 28px -14px rgba(0,0,0,0.6)" }}
        >
          <div
            className="text-xs text-[#e2a33d] mb-3 tracking-widest uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Job seekers
          </div>
          <div className="font-medium mb-1" style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
            Browse open roles
          </div>
          <p className="text-sm text-[#8b96a3] mb-4">
            See what's open right now and apply directly — no account required.
          </p>
          <div className="text-sm text-[#e2a33d] font-medium group-hover:translate-x-0.5 transition-transform inline-block">
            Browse open roles →
          </div>
        </Link>

        <Link
          href="/dashboard"
          className="hm-fade-in group border border-[#2b3340] bg-[#171c24] rounded-2xl p-6 hover:border-[#3a4452] hover:-translate-y-0.5 transition-all" style={{ boxShadow: "0 12px 28px -14px rgba(0,0,0,0.6)", animationDelay: "80ms" }}
        >
          <div
            className="text-xs text-[#8b96a3] mb-3 tracking-widest uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Recruiters
          </div>
          <div className="font-medium mb-1" style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
            Hiring for a role?
          </div>
          <p className="text-sm text-[#8b96a3] mb-4">
            Post jobs, close applications, and let AI screen every candidate.
          </p>
          <div className="text-sm text-[#8b96a3] font-medium group-hover:translate-x-0.5 transition-transform inline-block">
            Recruiter sign in →
          </div>
        </Link>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(400%); }
          100% { transform: translateX(-100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[scan_3\\.5s_ease-in-out_infinite\\] { animation: none; }
        }
      `}</style>
    </div>
  );
}
