import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import HomeHeader from "@/components/layout/HomeHeader";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Study App",
  description: "학습하기 · 랜덤학습 · 문제풀이 선택 화면",
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
};

export default function HomeGroupLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 text-slate-900 antialiased">
        {/* 항상 상단에 붙어있는 헤더 */}
        <HomeHeader />

        {/* 헤더 높이만큼 위에 여백을 줘서 겹치지 않게 */}
        <main className="mx-auto max-w-5xl px-4 pt-20 md:pt-24 pb-10 md:pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}
