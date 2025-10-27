"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useReveal } from "./RevealContext";

export default function RevealControls() {
  const { ratio, setRatio, reset } = useReveal();

  // 공통: 드래그 중에는 전역 ratio 변경 안 함 → 손을 뗐을 때 commit
  const [localRatio, setLocalRatio] = useState(ratio);
  const draggingRef = useRef(false);
  const commitTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!draggingRef.current) setLocalRatio(ratio);
  }, [ratio]);

  const commit = useCallback(
    (v: number) => {
      if (commitTimer.current) window.clearTimeout(commitTimer.current);
      commitTimer.current = window.setTimeout(() => setRatio(v), 50);
    },
    [setRatio]
  );

  const onPointerDown = () => (draggingRef.current = true);
  const onPointerUp = () => {
    draggingRef.current = false;
    commit(localRatio);
  };

  useEffect(() => {
    const up = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        commit(localRatio);
      }
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("touchend", up);
      if (commitTimer.current) window.clearTimeout(commitTimer.current);
    };
  }, [localRatio, commit]);

  // ===== 모바일 전용: FAB + 바텀시트 =====
  const [open, setOpen] = useState(false);

  // 스크롤 시작하면 시트 닫기(거슬림 최소화)
  useEffect(() => {
    const onScroll = () => setOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // iOS safe-area 대응 padding
  const safePB = { paddingBottom: "max(1rem, env(safe-area-inset-bottom))" };

  return (
    <>
      {/* 데스크탑: 기존 카드 유지 */}
      <div className="fixed bottom-5 right-5 z-50 hidden md:block">
        <div className="w-64 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-lg backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">
              공개 비율
            </span>
            <span className="text-xs text-slate-500">
              {Math.round(localRatio * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(localRatio * 100)}
            onChange={(e) => setLocalRatio(Number(e.target.value) / 100)}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onKeyUp={(e) => {
              if (["Enter", " ", "ArrowLeft", "ArrowRight"].includes(e.key))
                commit(localRatio);
            }}
            className="w-full accent-sky-600"
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              낮출수록 빈칸이 늘어요.
            </p>
            <button
              type="button"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm transition hover:shadow"
              title="공개/비공개 배치 다시 섞기"
            >
              리셋
            </button>
          </div>
        </div>
      </div>

      {/* 모바일: FAB */}
      <button
        type="button"
        aria-label="공개 비율 조절"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full
                   bg-sky-600 text-white shadow-lg md:hidden"
      >
        {/* 슬라이더 아이콘 비슷한 간단한 SVG */}
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M21 7H7M17 7v10M3 17h14M7 17V7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 모바일: 바텀시트 + 백드롭 */}
      {/* 백드롭 */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity md:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />
      {/* 시트 */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-50 md:hidden transition-transform duration-200 will-change-transform
                    rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl`}
        style={{
          transform: open ? "translateY(0%)" : "translateY(110%)",
          ...safePB,
        }}
      >
        <div className="mx-auto w-full max-w-md px-4 pt-3">
          {/* 그립 */}
          <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-slate-300" />
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">
              공개 비율
            </span>
            <span className="text-xs text-slate-500">
              {Math.round(localRatio * 100)}%
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(localRatio * 100)}
            onChange={(e) => setLocalRatio(Number(e.target.value) / 100)}
            onPointerDown={onPointerDown}
            onPointerUp={() => {
              onPointerUp();
              /* 커밋 후 자동 닫기 */ setTimeout(() => setOpen(false), 80);
            }}
            className="w-full accent-sky-600"
          />

          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              낮출수록 빈칸이 늘어요.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm transition hover:shadow"
              >
                리셋
              </button>
              <button
                type="button"
                onClick={() => {
                  commit(localRatio);
                  setOpen(false);
                }}
                className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
              >
                적용
              </button>
            </div>
          </div>

          <div className="h-2" />
        </div>
      </div>
    </>
  );
}
