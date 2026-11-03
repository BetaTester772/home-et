"use client";

import { useCallback, useEffect, useState } from "react";
import { cx } from "@/components/ui/styles";
import { INITIAL, STORAGE_KEY, goalText, loadState, saveState, type AppState, type StepNo } from "@/lib/app-state";
import { DEFAULT_WEIGHTS, toPercents } from "@/lib/calc";
import { addDays, startOfDay, toInput } from "@/lib/dday";
import type { VariantId } from "@/lib/variants";
import type { WeightAnalysis } from "@/lib/weights";
import { SheetFlow } from "./input/sheet-flow";
import { StackFlow } from "./input/stack-flow";
import { StepFlow } from "./input/step-flow";
import { useAuth } from "./providers";
import { DdayScreen } from "./screens/dday-screen";
import { InputScreen } from "./screens/input-screen";
import { RentScreen } from "./screens/rent-screen";
import { ReportScreen } from "./screens/report-screen";
import { Footer, Header } from "./shell/header";
import { LabBar } from "./shell/lab-bar";

const INPUTS = { classic: InputScreen, step: StepFlow, stack: StackFlow, sheet: SheetFlow } satisfies Record<VariantId, unknown>;

/**
 * 상태·흐름만 담당. 화면 모양은 screens/, 부품은 ui/ 에 있어요.
 * variant = ① 정보 입력 방식 (비교용). 버전마다 저장 공간을 따로 써서 서로 섞이지 않아요.
 */
export function HomeEtApp({ variant = "classic" }: { variant?: VariantId }) {
  const storageKey = variant === "classic" ? STORAGE_KEY : `${STORAGE_KEY}:${variant}`;
  const [state, setState] = useState<AppState>(INITIAL);
  const [today, setToday] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const name = auth.status === "authenticated" ? auth.name : null;

  // 마운트 후 저장된 상태 복원 + 날짜 기본값 (서버 렌더와 어긋나지 않게 클라이언트에서만)
  useEffect(() => {
    const now = startOfDay(new Date());
    const saved = loadState(storageKey) ?? INITIAL;
    const contract = saved.contract || toInput(addDays(now, 5));
    const balance = saved.balance || toInput(addDays(now, 41));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 브라우저 전용 값(localStorage, 오늘 날짜)으로 초기화
    setToday(now);
    setState({ ...saved, contract, balance });
  }, [storageKey]);

  useEffect(() => {
    if (today) saveState(state, storageKey);
  }, [state, today, storageKey]);

  const update = useCallback((patch: Partial<AppState>) => setState((s) => ({ ...s, ...patch })), []);
  const go = (step: StepNo) => {
    update({ step });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goalText(state) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const analysis = (await res.json()) as WeightAnalysis;
      update({ analysis, pct: toPercents(analysis), decision: null });
    } catch {
      update({
        analysis: { ...DEFAULT_WEIGHTS, reason: "분석 서버에 연결하지 못해 세 기준을 똑같이 두었어요.", source: "default" },
        pct: toPercents(DEFAULT_WEIGHTS),
      });
    } finally {
      setLoading(false);
      go(2);
    }
  };

  const ready = state.analysis !== null;
  const Input = INPUTS[variant];
  const onInput = state.step === 1;
  // 모바일 입력 화면: A는 앱 헤더 없이 꽉 찬 화면, A·B는 흰 바탕 (토스식 단계 입력)
  const immersive = onInput && variant === "step";
  const whiteMobile = onInput && (variant === "step" || variant === "stack");

  return (
    <>
      <LabBar current={variant} />
      <Header step={state.step} canVisit={(no) => no === 1 || ready} onNavigate={go} className={immersive ? "max-md:hidden" : undefined} />
      <main
        className={cx(
          "mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 md:py-12",
          // 남은 높이를 자식(A의 질문 화면)에게 넘겨서 LabBar + 화면 높이가 뷰포트를 넘지 않게
          immersive && "max-md:flex max-md:flex-col max-md:p-0",
          whiteMobile && "max-md:bg-surface",
        )}
      >
        {onInput && <Input state={state} update={update} onSubmit={analyze} loading={loading} />}
        {state.step === 2 && ready && (
          <ReportScreen
            state={state}
            update={update}
            name={name}
            onStay={() => update({ decision: "stay" })}
            onGo={() => {
              update({ decision: null });
              go(3);
            }}
          />
        )}
        {state.step === 3 && ready && <RentScreen state={state} update={update} name={name} onBack={() => go(2)} onNext={() => go(4)} />}
        {state.step === 4 && ready && today && <DdayScreen state={state} update={update} today={today} />}
      </main>
      <Footer className={onInput && variant !== "classic" ? "max-md:hidden" : undefined} />
    </>
  );
}
