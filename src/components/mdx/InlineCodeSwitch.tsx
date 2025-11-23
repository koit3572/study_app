"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReveal } from "./RevealContext";
import InlineAnswerInput from "./InlineAnswerInput";

export type CodeProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
  children?: React.ReactNode;
  /** 인라인일 때도 코드 박스 스타일을 강제로 쓰고 싶으면 true */
  forceInlineCodeBox?: boolean;
};

export default function InlineCodeSwitch(props: CodeProps) {
  const { children, className, forceInlineCodeBox = false, ...rest } = props;

  // 1) 훅은 항상 같은 순서로 호출
  const { shouldHide, nextIndex, resetSignal } = useReveal();
  const [mounted, setMounted] = useState(false);
  const indexRef = useRef<number | null>(null);

  // 2) 공통 파생값
  const isBlock = !!(className && /language-/.test(className));
  const text = Array.isArray(children)
    ? children.join("")
    : String(children ?? "");

  // 3) 마운트 플래그
  useEffect(() => setMounted(true), []);

  // 4) 인라인 코드에만 출현 인덱스 부여(한 번만)
  if (!isBlock && indexRef.current === null) {
    indexRef.current = nextIndex();
  }

  // 5) 코드블록은 기존 동작 유지
  if (isBlock) {
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  }

  // ------ 인라인 코드 처리 (여기서부터는 백틱 박스 없앰) ------

  // 6) 마운트 전: 서버와 동일하게 평문 렌더 → hydration mismatch 방지
  if (!mounted) {
    return <>{text}</>;
  }

  // 7) 마운트 후: 숨김/공개 판단
  const idx = indexRef.current ?? 0;
  const hide = shouldHide(text, idx);

  if (hide) {
    return <InlineAnswerInput answer={text} resetSignal={resetSignal} />;
  }

  // 8) 평문 렌더(원하면 박스 강제 표시 옵션 제공)
  if (forceInlineCodeBox) {
    return (
      <code
        {...rest}
        className="rounded-md bg-slate-100 px-1.5 py-[2px] text-[.92em] font-medium text-slate-800"
      >
        {text}
      </code>
    );
  }

  // 기본: 그냥 텍스트(“`옥내` → 옥내”)
  return <>{text}</>;
}
