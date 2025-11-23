import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import Header from "@/components/layout/HomeHeader";
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
        {/* 스크롤 방향에 따라 나타나는 헤더 */}
        <Header />

        {/* 기존 내용 */}
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-20">{children}</div>
      </body>
    </html>
  );
}
