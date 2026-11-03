"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { compute, fromPercents, hm, hours } from "@/lib/calc";
import type { AppState } from "@/lib/app-state";
import {
  ActionBar, BigNumber, BottomSheet, Button, Card, FinePrint, Meter, ScaleLabels, useIsDesktop,
} from "@/components/ui";
import { cx } from "@/components/ui/styles";
import { HeroEditor, QUESTIONS, QUESTION_GROUPS } from "./questions";
import { AnswerRow, allValid, type InputFlowProps } from "./shared";

/** C · 확인하고 고치기 — 채워진 목록에서 다른 것만 고침. 모바일 바텀시트 / 데스크톱 옆 패널 */
export function SheetFlow({ state, update, onSubmit, loading }: InputFlowProps) {
  const [editing, setEditing] = useState<number | null>(null);
  const desktop = useIsDesktop();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const close = useCallback(() => setEditing(null), []);
  const q = editing === null ? null : QUESTIONS[editing];
  const hasNext = editing !== null && editing < QUESTIONS.length - 1;
  const goNext = () => setEditing((i) => (i === null ? null : Math.min(QUESTIONS.length - 1, i + 1)));
  const onDone = () => {
    if (!q) return;
    if (timer.current) clearTimeout(timer.current);
    // 선택형은 고르면 잠깐 보여 주고 닫힘(데스크톱은 다음 항목으로), 입력형은 Enter로 같은 동작
    timer.current = setTimeout(() => (desktop && hasNext ? goNext() : close()), q.kind === "choice" ? 220 : 0);
  };

  const editor = q && (
    <HeroEditor key={q.id} q={q} state={state} update={update} autoFocus onDone={q.valid(state) ? onDone : undefined} />
  );

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
      <div className="space-y-5">
        <div>
          <h1 className="text-[26px] font-bold leading-snug tracking-tight md:text-[30px]">
            내 통학 정보가
            <br />
            맞는지 확인해 주세요
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-fg-sub">예시 값이 채워져 있어요. 내 상황과 다른 항목만 눌러서 고치면 돼요.</p>
        </div>

        <div className="md:hidden">
          <Preview state={state} compact />
        </div>

        {QUESTION_GROUPS.map(({ group, items }) => (
          <section key={group}>
            <h2 className="mb-2 px-1 text-sm font-semibold text-fg-sub">{group}</h2>
            <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
              {items.map(({ q: qq, i }) => (
                <li key={qq.id}>
                  <AnswerRow
                    label={qq.label}
                    value={qq.display(state)}
                    current={desktop && editing === i}
                    onClick={() => setEditing(i)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="md:hidden">
          <ActionBar>
            <Button size="lg" onClick={onSubmit} disabled={!allValid(state) || loading}>
              {loading ? "가치관 분석 중…" : "이대로 자취 적합 검사"}
            </Button>
          </ActionBar>
        </div>
      </div>

      {/* 데스크톱: 오른쪽 편집 패널 + 미리보기 */}
      <aside className="hidden md:block">
        <div className="sticky top-24 space-y-5">
          <Card>
            {q ? (
              <div key={q.id} className="motion-safe:animate-rise">
                <p className="text-sm font-semibold text-primary">{q.group}</p>
                <h2 className="mt-1 whitespace-pre-line text-2xl font-bold leading-snug">{q.title}</h2>
                {q.sub && <p className="mt-2 text-sm leading-relaxed text-fg-sub">{q.sub}</p>}
                <div className="mt-6">{editor}</div>
                <div className="mt-7 flex justify-end gap-2">
                  {hasNext && (
                    <Button variant="secondary" onClick={goNext}>
                      다음 항목
                    </Button>
                  )}
                  <Button onClick={close} disabled={!q.valid(state)}>
                    확인
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-lg font-bold">고칠 항목을 왼쪽에서 골라 주세요</p>
                <p className="mt-1.5 text-sm text-fg-sub">값을 바꾸면 아래 미리보기가 바로 다시 계산돼요.</p>
              </div>
            )}
          </Card>
          <Preview state={state} />
          <Button size="lg" block onClick={onSubmit} disabled={!allValid(state) || loading}>
            {loading ? "가치관 분석 중…" : "이대로 자취 적합 검사"}
          </Button>
        </div>
      </aside>

      {/* 모바일: 바텀시트 */}
      {!desktop && q && (
        <BottomSheet
          open
          onClose={close}
          title={q.title}
          aside={<LiveLine state={state} />}
          footer={
            <>
              {hasNext && (
                <Button variant="secondary" size="lg" onClick={goNext}>
                  다음 항목
                </Button>
              )}
              <Button size="lg" onClick={close} disabled={!q.valid(state)}>
                확인
              </Button>
            </>
          }
        >
          {q.sub && <p className="-mt-2 mb-6 text-[15px] leading-relaxed text-fg-sub">{q.sub}</p>}
          {editor}
        </BottomSheet>
      )}
    </div>
  );
}

function getPreview(state: AppState) {
  const r = compute(state.commute, state.costs, fromPercents(state.pct));
  return {
    r,
    index: r.index,
    basis: state.analysis ? "리포트에서 정한 가치관 기준" : "가치관 분석 전이라 돈·시간·체력을 똑같이 두고 계산",
  };
}

/** 바텀시트 제목 아래 한 줄: 값을 바꾸면 숫자가 바로 바뀌는 걸 보여 줌 */
function LiveLine({ state }: { state: AppState }) {
  const { index, r } = getPreview(state);
  return (
    <p className="text-sm text-fg-sub" aria-live="polite">
      예상 자취지수 <b className={cx("tabular-nums", index >= 50 ? "text-primary" : "text-accent")}>{index.toFixed(1)}</b> · 하루 통학{" "}
      <b className="text-fg">{hm(r.commuteDailyMin)}</b>
    </p>
  );
}

function Preview({ state, compact }: { state: AppState; compact?: boolean }) {
  const { index, r, basis } = getPreview(state);
  const tone = index >= 50 ? "primary" : "accent";
  return (
    <Card padding={compact ? "sm" : "md"} tone="highlight">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold">미리 본 자취지수</p>
        <p className="text-xs text-fg-muted">입력값이 바뀌면 바로 계산</p>
      </div>
      <div className={cx("flex items-end justify-between gap-4", compact ? "mt-1" : "mt-3")} aria-live="polite">
        <BigNumber value={index.toFixed(1)} unit="/ 100" tone={tone} size="lg" />
        <p className="pb-1.5 text-right text-sm text-fg-sub">
          하루 통학 <b className="text-fg">{hm(r.commuteDailyMin)}</b>
          <br />한 달 <b className="text-fg">{hours(r.savedHours)}</b> 되찾음
        </p>
      </div>
      <div className="mt-3 space-y-2">
        <Meter value={index} tone={tone} size="sm" marker />
        {!compact && <ScaleLabels items={["통학 유리", "50 = 손익분기", "자취 유리"]} />}
      </div>
      <FinePrint className="mt-3">{basis}했어요. 정확한 값은 검사 후 리포트에서 확인해요.</FinePrint>
    </Card>
  );
}
