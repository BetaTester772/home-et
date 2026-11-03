"use client";

import { useEffect, useRef, useState } from "react";
import { ActionBar, Button, FinePrint, useIsDesktop } from "@/components/ui";
import { cx } from "@/components/ui/styles";
import { HeroEditor, QUESTIONS } from "./questions";
import { AnswerRow, ProgressBar, SideIntro, allValid, type InputFlowProps } from "./shared";

const N = QUESTIONS.length;
const AUTO_NEXT_MS = 220; // 선택 피드백을 잠깐 보여 준 뒤 넘어감

/** A · 한 화면에 한 질문 */
export function StepFlow({ state, update, onSubmit, loading }: InputFlowProps) {
  const [idx, setIdx] = useState(0); // N = 확인 화면
  const [dir, setDir] = useState<1 | -1>(1);
  const [reached, setReached] = useState(0);
  const [fromReview, setFromReview] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktop = useIsDesktop();

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const isReview = idx === N;
  const q = QUESTIONS[idx];
  const valid = isReview ? allValid(state) : q.valid(state);

  const goTo = (i: number, d: 1 | -1) => {
    if (timer.current) clearTimeout(timer.current);
    setDir(d);
    setIdx(i);
    setReached((r) => Math.max(r, i));
    window.scrollTo({ top: 0 });
  };
  const next = () => {
    if (isReview) return onSubmit();
    if (!valid) return;
    if (fromReview) {
      setFromReview(false);
      goTo(N, 1);
    } else goTo(idx + 1, 1);
  };
  const prev = () => {
    if (fromReview) {
      setFromReview(false);
      return goTo(N, 1);
    }
    if (idx > 0) goTo(idx - 1, -1);
  };
  const autoNext = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(next, AUTO_NEXT_MS);
  };
  const edit = (i: number) => {
    setFromReview(isReview);
    goTo(i, -1);
  };

  const progress = (Math.min(idx, N) / N) * 100;
  const canPrev = idx > 0 || fromReview;

  return (
    <div className="flex flex-1 flex-col md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14">
      {/* 데스크톱: 왼쪽에 소개 + 지금까지 답한 것 */}
      <aside className="hidden md:block">
        <div className="sticky top-24">
          <SideIntro />
          <ol className="mt-8 space-y-0.5" aria-label="질문 목록">
            {QUESTIONS.map((qq, i) => (
              <li key={qq.id}>
                <AnswerRow
                  size="sm"
                  label={qq.label}
                  value={i <= reached ? qq.display(state) : "—"}
                  current={i === idx}
                  disabled={i > reached}
                  onClick={() => edit(i)}
                />
              </li>
            ))}
          </ol>
        </div>
      </aside>

      <section className="flex flex-1 flex-col bg-surface md:min-h-[600px] md:rounded-card md:border md:border-border">
        {/* 상단: 진행률 막대만. 확인 화면에서 항목을 고치러 온 땐 숨김 (막대가 뒤로 가 보여서 헷갈림) */}
        <div className="sticky top-0 z-10 flex h-12 items-center bg-surface px-5 md:static md:h-auto md:rounded-t-card md:px-10 md:pt-8">
          <ProgressBar value={progress} className={cx("flex-1", fromReview && "invisible")} />
        </div>

        <div
          key={idx}
          className={cx(
            "flex-1 px-5 pt-6 md:px-10 md:pt-8 md:pb-10",
            dir > 0 ? "motion-safe:animate-step-next" : "motion-safe:animate-step-prev",
          )}
        >
          {isReview ? (
            <>
              <h1 className="text-[26px] font-bold leading-snug tracking-tight md:text-[30px]">이대로 검사할까요?</h1>
              <p className="mt-2 text-[15px] text-fg-sub">고칠 항목을 누르면 바로 바꿀 수 있어요.</p>
              <ul className="-mx-5 mt-6 divide-y divide-border border-y border-border md:mx-0 md:overflow-hidden md:rounded-panel md:border">
                {QUESTIONS.map((qq, i) => (
                  <li key={qq.id}>
                    <AnswerRow label={qq.label} value={qq.display(state)} onClick={() => edit(i)} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-primary">{q.group}</p>
              <h1 className="mt-1.5 whitespace-pre-line text-[26px] font-bold leading-snug tracking-tight md:text-[30px]">{q.title}</h1>
              {q.sub && <p className="mt-2 text-[15px] leading-relaxed text-fg-sub">{q.sub}</p>}
              <div className="mt-8">
                <HeroEditor
                  q={q}
                  state={state}
                  update={update}
                  autoFocus={desktop} // 모바일은 자동 포커스 X: 화면마다 키보드가 올라오며 하단 바가 들썩임
                  shortcuts={desktop}
                  onDone={q.kind === "choice" ? autoNext : next}
                />
              </div>
            </>
          )}
        </div>

        <ActionBar keyboardAware desktopClassName="md:items-center md:justify-between md:rounded-b-card md:px-10 md:py-5">
          {/* 모바일: 왼쪽에 좁게 (첫 질문에선 숨겨서 '다음'이 꽉 차게) */}
          <Button
            variant={desktop ? "ghost" : "secondary"}
            size="lg"
            onClick={prev}
            disabled={!canPrev}
            className={cx("max-md:w-24 max-md:flex-none!", !canPrev && "max-md:hidden")}
          >
            이전
          </Button>
          <div className="contents md:flex md:items-center md:gap-4">
            <FinePrint className="hidden lg:block">
              {isReview ? "" : q.kind === "choice" ? "숫자키로 고르기" : "Enter로 다음"}
            </FinePrint>
            <Button size="lg" onClick={next} disabled={!valid || loading} className="max-md:flex-1 md:min-w-40">
              {isReview ? (loading ? "가치관 분석 중…" : "자취 적합 검사 시작") : fromReview ? "확인" : "다음"}
            </Button>
          </div>
        </ActionBar>
      </section>
    </div>
  );
}
