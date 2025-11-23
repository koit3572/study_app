"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomeHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:h-16">
        {/* 왼쪽: 홈 버튼 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-transparent bg-white/70 px-3 py-1 text-sm font-semibold text-slate-900 shadow-sm shadow-slate-200/60 transition hover:border-slate-200 hover:bg-slate-50/90 active:scale-[0.97]"
        >
          <span className="hidden sm:inline">Home</span>
          <span className="sm:hidden">홈</span>
        </Link>

        {/* 가운데: 간단한 타이틀 */}
        <div className="pointer-events-none absolute inset-x-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 text-xs font-medium text-slate-500 md:flex">
        
        </div>

        {/* 오른쪽: 메뉴 버튼 + 드롭다운 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm font-medium text-slate-800 shadow-sm shadow-slate-200/70 transition hover:bg-slate-50 active:scale-[0.97]"
          >
            <span className="hidden sm:inline">메뉴</span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-lg shadow-slate-200/70">
              <MenuItem href="/study" onClick={() => setOpen(false)}>
                <span className="mr-2 text-xs">📚</span>
                학습하기
              </MenuItem>
              <MenuItem href="/random" onClick={() => setOpen(false)}>
                <span className="mr-2 text-xs">🎲</span>
                랜덤학습
              </MenuItem>
              <MenuItem href="/quiz" onClick={() => setOpen(false)}>
                <span className="mr-2 text-xs">📝</span>
                문제풀이
              </MenuItem>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

type MenuItemProps = {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
};

function MenuItem({ href, children, onClick }: MenuItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center px-4 py-2 text-sm text-slate-800 transition hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}
