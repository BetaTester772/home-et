"use client";

import { useCallback, useEffect, useState } from "react";
import { INITIAL, loadState, saveState, type AppState, type StepNo } from "@/lib/app-state";
import { DEFAULT_WEIGHTS, toPercents } from "@/lib/calc";
import { addDays, startOfDay, toInput } from "@/lib/dday";
import type { WeightAnalysis } from "@/lib/weights";
import { useAuth } from "./providers";
import { DdayScreen } from "./screens/dday-screen";
import { InputScreen } from "./screens/input-screen";
import { RentScreen } from "./screens/rent-screen";
import { ReportScreen } from "./screens/report-screen";
import { Footer, Header } from "./shell/header";

/** 상태·흐름만 담당. 화면 모양은 screens/, 부품은 ui/ 에 있어요. */
export function HomeEtApp() {
  const [state, setState] = useState<AppState>(INITIAL);
  const [today, setToday] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const name = auth.status === "authenticated" ? auth.name : null;

  // 마운트 후 저장된 상태 복원 + 날짜 기본값 (서버 렌더와 어긋나지 않게 클라이언트에서만)
  useEffect(() => {
    const now = startOfDay(new Date());
    const saved = loadState() ?? INITIAL;
    const contract = saved.contract || toInput(addDays(now, 5));
    const balance = saved.balance || toInput(addDays(now, 41));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 브라우저 전용 값(localStorage, 오늘 날짜)으로 초기화
    setToday(now);
    setState({ ...saved, contract, balance });
  }, []);

  useEffect(() => {
    if (today) saveState(state);
  }, [state, today]);

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
        body: JSON.stringify({ goal: state.goal }),
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

  return (
    <>
      <Header step={state.step} canVisit={(no) => no === 1 || ready} onNavigate={go} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {state.step === 1 && <InputScreen state={state} update={update} onSubmit={analyze} loading={loading} />}
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
      <Footer />
    </>
  );
}
