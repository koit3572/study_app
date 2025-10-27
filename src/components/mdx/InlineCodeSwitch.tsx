"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReveal } from "./RevealContext";
import InlineAnswerInput from "./InlineAnswerInput";

export type CodeProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
  children?: React.ReactNode;
};
export default function InlineCodeSwitch(props: CodeProps) {
  const { children, className, ...rest } = props;

  // 1) 훅은 항상 같은 순서로 호출되어야 함
  const { shouldHide, nextIndex, resetSignal } = useReveal(); // 항상 호출
  const [mounted, setMounted] = useState(false);
  const indexRef = useRef<number | null>(null);

  // 2) 공통 파생값 (훅 호출 뒤에 계산해도 OK)
  const isBlock = !!(className && /language-/.test(className));
  const text = Array.isArray(children)
    ? children.join("")
    : String(children ?? "");

  // 3) 마운트 상태 토글
  useEffect(() => setMounted(true), []);

  // 4) 인라인 코드에 한해 "출현 순서 인덱스"를 한 번만 할당
  if (!isBlock && indexRef.current === null) {
    indexRef.current = nextIndex();
  }

  // 5) 코드블록은 그대로(SSR/CSR 동일)
  if (isBlock) {
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  }

  // 6) 마운트 전에는 서버와 동일하게 일반 <code> 렌더 → hydration mismatch 방지
  if (!mounted) {
    return (
      <code
        {...rest}
        className="rounded-md bg-slate-100 px-1.5 py-[2px] text-[.92em] font-medium text-slate-800"
      >
        {text}
      </code>
    );
  }

  // 7) 마운트 후에만 숨김/공개 판단
  const idx = indexRef.current ?? 0;
  const hide = shouldHide(text, idx);

  if (hide) {
    return <InlineAnswerInput answer={text} resetSignal={resetSignal} />;
  }

  return (
    <code
      {...rest}
      className="rounded-md bg-slate-100 px-1.5 py-[2px] text-[.92em] font-medium text-slate-800"
    >
      {text}
    </code>
  );
}
