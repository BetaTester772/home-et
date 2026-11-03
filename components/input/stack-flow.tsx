"use client";

import { useEffect, useRef, useState } from "react";
import { ActionBar, Button, NumberedList, useIsDesktop } from "@/components/ui";
import { CompactEditor, HeroEditor, QUESTIONS } from "./questions";
import { ProgressBar, SideIntro, allValid, type InputFlowProps } from "./shared";

const N = QUESTIONS.length;
const INTRO = ["통학 시간과 피로 회복 시간을 돈으로 환산", "내 가치관을 반영한 자취지수와 적정 월세", "계약금부터 확정일자까지 D-day 안내"];

/** B · 답할수록 쌓이는 폼 — 새 질문은 맨 위, 답한 칸은 아래에서 바로 수정 */
export function StackFlow({ state, update, onSubmit, loading }: InputFlowProps) {
  const [count, setCount] = useState(1); // 지금까지 나온 질문 수
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktop = useIsDesktop();
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const cur = QUESTIONS[count - 1];
  const last = count === N;
  const answered = QUESTIONS.slice(0, count - 1).reverse();
  const canNext = last ? allValid(state) : cur.valid(state);

  const reveal = () => {
    if (!cur.valid(state)) return;
    if (last) return;
    setCount((c) => Math.min(N, c + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const onDone = () => {
    if (timer.current) clearTimeout(timer.current);
    if (cur.kind === "choice") timer.current = setTimeout(reveal, 220);
    else reveal();
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)] md:gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-14">
      <aside className="hidden md:block">
        <div className="sticky top-24">
          <SideIntro>
            <div className="mt-7">
              <NumberedList items={INTRO} />
            </div>
          </SideIntro>
        </div>
      </aside>

      <section className="md:rounded-card md:border md:border-border md:bg-surface md:p-10">
        <div className="flex items-center gap-3">
          <ProgressBar value={(count / N) * 100} className="flex-1" />
          <span className="text-xs font-semibold tabular-nums text-fg-muted">
            {count} / {N}
          </span>
        </div>

        <div key={cur.id} className="mt-7 motion-safe:animate-rise">
          <h1 className="whitespace-pre-line text-[26px] font-bold leading-snug tracking-tight md:text-[30px]">{cur.title}</h1>
          {cur.sub && <p className="mt-2 text-[15px] leading-relaxed text-fg-sub">{cur.sub}</p>}
          <div className="mt-7">
            <HeroEditor q={cur} state={state} update={update} autoFocus={desktop && count > 1} onDone={onDone} />
          </div>
        </div>

        {answered.length > 0 && (
          <div className="mt-10 space-y-5 border-t border-border pt-7">
            {answered.map((q) => (
              <div key={q.id} className="motion-safe:animate-fade">
                <CompactEditor q={q} state={state} update={update} />
              </div>
            ))}
          </div>
        )}

        <div className="md:mt-10">
          <ActionBar keyboardAware desktopClassName="md:border-0 md:bg-transparent md:p-0 md:[&>*]:flex-1">
            {last ? (
              <Button size="lg" onClick={onSubmit} disabled={!canNext || loading}>
                {loading ? "가치관 분석 중…" : "자취 적합 검사 시작"}
              </Button>
            ) : (
              <Button size="lg" onClick={reveal} disabled={!canNext}>
                다음
              </Button>
            )}
          </ActionBar>
        </div>
      </section>
    </div>
  );
}
