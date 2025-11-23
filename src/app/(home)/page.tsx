"use client"

import Link from "next/link";
import { JSX, useState } from "react";

// ---- Simple inline SVG icons (no extra deps) ----
function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M20 22H6.5A2.5 2.5 0 0 1 4 19.5V5.5A2.5 2.5 0 0 1 6.5 3H20z" />
    </svg>
  );
}
function ShuffleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M16 3h5v5" />
      <path d="M4 20l16-16" />
      <path d="M21 16v5h-5" />
      <path d="M15 15l6 6" />
      <path d="M3 9l6 6" />
    </svg>
  );
}
function QuizIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 9a3 3 0 1 1 3 3v1" />
      <path d="M12 17h.01" />
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}

// ---- Reusable Card ----
function SelectCard({
  href,
  title,
  description,
  Icon,
  accent,
}: {
  href: string;
  title: string;
  description: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  accent: string; // e.g. "from-sky-400 to-blue-500"
}) {
  const [, setHovered] = useState(false);

  return (
    <Link
      href={href}
      className="group relative block focus:outline-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow */}
      <div
        className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-br ${accent} opacity-0 blur-lg transition duration-300 group-hover:opacity-60`}
      />

      {/* Card */}
      <div className="relative h-full rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl md:p-7">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-md`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold leading-tight md:text-xl">
                {title}
              </h3>
              <span className="text-xs font-medium text-slate-400">
                ENTER ↗
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600 md:text-[15px]">
              {description}
            </p>
          </div>
        </div>

        {/* Subtle underline animation */}
        <span
          className={`pointer-events-none mt-5 block h-px w-0 bg-gradient-to-r ${accent} transition-all duration-500 group-hover:w-full`}
        />

        {/* CTA Pill */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-600 backdrop-blur-sm transition group-hover:border-transparent group-hover:bg-white">
          <span>시작하기</span>
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14" />
            <path d="M13 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main>
      {/* Header */}
      <section className="mb-10 md:mb-14">
        <div className="flex items-center gap-2 text-xs font-medium text-sky-700/80">
          <span className="inline-flex h-2 w-2 rounded-full bg-sky-400" />
          <span>Study App</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          무엇을 할까요?
        </h1>
        <p className="mt-2 max-w-prose text-slate-600 md:text-[15px]">
          학습 자료를 살펴보거나, 랜덤으로 골라 빠르게 학습하고, 준비된 문제로
          실력을 확인하세요.
        </p>
      </section>

      {/* Grid */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
        <SelectCard
          href="/study"
          title="학습하기"
          description="마크다운 노트/개념 정리부터 차근차근 학습해요."
          Icon={BookIcon}
          accent="from-sky-400 to-blue-500"
        />
        <SelectCard
          href="/random"
          title="랜덤학습"
          description="무작위로 한 주제를 선택해 짧게 집중 학습합니다."
          Icon={ShuffleIcon}
          accent="from-violet-400 to-fuchsia-500"
        />
        <SelectCard
          href="/quiz"
          title="문제풀이"
          description="퀴즈/기출/빈칸채우기로 이해도를 점검해요."
          Icon={QuizIcon}
          accent="from-emerald-400 to-teal-500"
        />
      </section>

      {/* Footer helper (optional tips) */}
      <p className="mt-10 text-center text-xs text-slate-400">
        단축키: <span className="font-medium text-slate-500">1</span> 학습하기 ·{" "}
        <span className="font-medium text-slate-500">2</span> 랜덤학습 ·{" "}
        <span className="font-medium text-slate-500">3</span> 문제풀이
      </p>
    </main>
  );
}
