"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

type Status = "default" | "correct" | "wrong";

export default function InlineAnswerInput({
  answer,
  resetSignal,
  delay = 500,
  minWidthPx = 56,
  padPx = 20,
  autoFillTrigger = "?",
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

  // ✅ 브라우저 타이머 타입
  const timeoutRef = useRef<number | null>(null);
  const mirrorRef = useRef<HTMLSpanElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const normalize = (s: string) =>
    s.normalize("NFC").replace(/\s+/g, "").trim();

  const recalcWidth = useCallback(() => {
    if (!mirrorRef.current) return;
    const target = (value || answer || "").toString();
    mirrorRef.current.textContent = target + "  ";
    const w = mirrorRef.current.getBoundingClientRect().width;
    setInputWidth(Math.max(minWidthPx, Math.ceil(w + padPx)));
  }, [value, answer, minWidthPx, padPx]);

  useLayoutEffect(() => {
    recalcWidth();
  }, [recalcWidth]);

  useEffect(() => {
    const id = window.setTimeout(recalcWidth, 0);
    return () => window.clearTimeout(id);
  }, [recalcWidth]);

  // ✅ cleanup은 블록으로 작성 (null 반환 금지)
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const scheduleJudge = (text: string) => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      const ok = normalize(text) === normalize(answer || "");
      setStatus(ok ? "correct" : "wrong");
    }, delay);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[\r\n]/g, "");
    setStatus("default");

    if (raw.endsWith(autoFillTrigger)) {
      const filled = answer ?? "";
      setValue(filled);
      setStatus("correct");
      setShowAnswer(false);
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
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      const ok = normalize(value) === normalize(answer || "");
      setStatus(ok ? "correct" : "wrong");
    }
  };

  useEffect(() => {
    setValue("");
    setStatus("default");
    setShowAnswer(false);
  }, [resetSignal]);

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
      <span
        ref={mirrorRef}
        className="invisible absolute top-0 left-0 -z-10 whitespace-pre font-medium text-[0.92em]"
        style={{
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
          placeholder=""
          style={{ width: "100%" }}
        />
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
        {showAnswer && (
          <div className="absolute left-0 top-full z-20 mt-1 rounded-md border border-slate-200 bg-white/95 px-2 py-1 text-[0.9em] text-slate-700 shadow-sm">
            {answer}
          </div>
        )}
      </span>
    </>
  );
}
