"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

type Status = "default" | "correct" | "wrong";

export default function InlineAnswerInput({
  answer,
  resetSignal,
  delay = 500, // 타이핑 멈춘 뒤 채점 딜레이(ms)
  minWidthPx = 56, // 최소 폭(px) – 너무 작아지지 않도록
  padPx = 20, // 내부 여유 공간(px) – 아이콘/패딩 고려
  autoFillTrigger = "?", // 이 문자를 입력하면 자동 완성
}: {
  answer: string;
  resetSignal?: number;
  delay?: number;
  minWidthPx?: number;
  padPx?: number;
  autoFillTrigger?: string;
}) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("default");
  const [showAnswer, setShowAnswer] = useState(false);
  const [inputWidth, setInputWidth] = useState<number>(minWidthPx);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mirrorRef = useRef<HTMLSpanElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 공백 무시 비교(한글 NFC 정규화)
  const normalize = (s: string) =>
    s.normalize("NFC").replace(/\s+/g, "").trim();

  // ===== 1) 폭 자동 계산 (value/answer 기준 실제 픽셀) =====
  const recalcWidth = () => {
    if (!mirrorRef.current) return;
    // 측정 대상 텍스트: 입력이 있으면 입력, 없으면 정답(빈칸 시 길이 확보)
    const target = (value || answer || "").toString();

    // mirror span에 텍스트 넣고 width 측정
    mirrorRef.current.textContent = target + "  "; // 살짝 여유
    const w = mirrorRef.current.getBoundingClientRect().width;

    // 아이콘/패딩 고려해서 여유 padPx 추가, 최소 폭 보장
    const next = Math.max(minWidthPx, Math.ceil(w + padPx));
    setInputWidth(next);
  };

  useLayoutEffect(() => {
    recalcWidth();
  }, [value, answer]);
  useEffect(() => {
    // 폰트가 로드되었을 때도 다시 계산 (웹폰트 사용 시)
    const i = setTimeout(recalcWidth, 0);
    return () => clearTimeout(i);
  }, []);

  // ===== 2) 지연 채점 / 엔터 즉시 채점 =====
  const scheduleJudge = (text: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const ok = normalize(text) === normalize(answer || "");
      setStatus(ok ? "correct" : "wrong");
    }, delay);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[\r\n]/g, "");
    setStatus("default");

    // 3) '?' 입력 시 자동 완성
    if (raw.endsWith(autoFillTrigger)) {
      const filled = answer ?? "";
      setValue(filled);
      setStatus("correct");
      setShowAnswer(false);
      // 포커스 유지 및 커서 이동
      requestAnimationFrame(() => {
        inputRef.current?.setSelectionRange(filled.length, filled.length);
      });
      return;
    }

    setValue(raw);
    scheduleJudge(raw);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const ok = normalize(value) === normalize(answer || "");
      setStatus(ok ? "correct" : "wrong");
    }
  };

  // 마운트 해제 시 타이머 정리
  useEffect(
    () => () => timeoutRef.current && clearTimeout(timeoutRef.current),
    []
  );

  // resetSignal 바뀌면 초기화
  useEffect(() => {
    setValue("");
    setStatus("default");
    setShowAnswer(false);
  }, [resetSignal]);

  // 스타일 프리셋
  const base =
    "w-full pr-7 rounded-md border bg-white/90 outline-none transition-colors " +
    "text-[0.92em] leading-snug font-medium placeholder:text-slate-400 " +
    "focus:ring-2 focus:ring-sky-200 focus:border-sky-400";

  const borderBy =
    status === "default"
      ? "border-slate-300"
      : status === "correct"
      ? "border-emerald-500"
      : "border-rose-500";

  const glowBy =
    status === "default"
      ? "shadow-[inset_0_0_0_0_rgba(0,0,0,0)]"
      : status === "correct"
      ? "shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
      : "shadow-[0_0_0_3px_rgba(244,63,94,0.12)]";

  return (
    <>
      {/* 폭 측정을 위한 미러(span). 화면에는 보이지 않음 */}
      <span
        ref={mirrorRef}
        className="invisible absolute top-0 left-0 -z-10 whitespace-pre font-medium text-[0.92em]"
        style={{
          // input과 가능한 동일한 글꼴/자간이 되도록
          fontFamily: "inherit",
          letterSpacing: "inherit",
          padding: "0px 0.5rem",
        }}
      />
      <span
        className={`relative inline-block align-baseline ${glowBy}`}
        style={{ width: inputWidth, minWidth: minWidthPx }}
      >
        <input
          ref={inputRef}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          inputMode="text"
          autoComplete="off"
          aria-label="정답 입력"
          className={`${base} ${borderBy} px-2 py-1`}
          placeholder="" /* 비워두면 '빈칸'처럼 보임 */
          style={{ width: "100%" }}
        />

        {/* 정답 보기 토글 */}
        <button
          type="button"
          aria-label={showAnswer ? "정답 숨기기" : "정답 보기"}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          onClick={() => setShowAnswer((p) => !p)}
        >
          {showAnswer ? (
            <FaRegEyeSlash className="h-3.5 w-3.5" />
          ) : (
            <FaRegEye className="h-3.5 w-3.5" />
          )}
        </button>

        {/* 정답 풍선 */}
        {showAnswer && (
          <div
            className="absolute left-0 top-full z-20 mt-1 rounded-md border border-slate-200 bg-white/95 px-2 py-1 
                       text-[0.9em] text-slate-700 shadow-sm"
          >
            {answer}
          </div>
        )}
      </span>
    </>
  );
}
