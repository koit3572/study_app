"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type RevealCtx = {
  ratio: number; // 0~1 공개비율 (높을수록 더 많이 공개)
  setRatio: (v: number) => void;
  seed: number; // 리셋할 때마다 바뀌는 시드
  reset: () => void; // 배치 리셋
  resetSignal: number; // 입력칸들 초기화 트리거
  shouldHide: (text: string, index: number) => boolean; // 숨길지 결정
  nextIndex: () => number; // 인라인 코드 출현 순서
};

const Ctx = createContext<RevealCtx | null>(null);

// 간단한 해시 → 0..1
function hash01(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

export function RevealProvider({ children }: { children: React.ReactNode }) {
  const [ratio, setRatio] = useState(0.5);
  const [seed, setSeed] = useState(1);
  const [resetSignal, setResetSignal] = useState(0);
  const counterRef = useRef(0);

  const reset = () => {
    setSeed((s) => s + 1);
    setResetSignal((n) => n + 1);
    counterRef.current = 0;
  };

  const nextIndex = () => ++counterRef.current;

  const ctx = useMemo<RevealCtx>(() => {
    const shouldHide = (text: string, index: number) => {
      const rnd = hash01(`${seed}::${index}::${text}`);
      // ratio = 공개비율 → rnd > ratio 이면 숨김(빈칸)
      return rnd > ratio;
    };
    return { ratio, setRatio, seed, reset, resetSignal, shouldHide, nextIndex };
  }, [ratio, seed, resetSignal]);

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

export function useReveal() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useReveal must be used within RevealProvider");
  return v;
}
