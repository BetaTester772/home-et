"use client";

import type { ReactNode } from "react";
import type { AppState } from "@/lib/app-state";
import { cx, focusRing } from "@/components/ui/styles";
import { Eyebrow } from "@/components/ui";
import { QUESTIONS } from "./questions";

export interface InputFlowProps {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  onSubmit: () => void;
  loading: boolean;
}

export const allValid = (s: AppState) => QUESTIONS.every((q) => q.valid(s));

/** 데스크톱 왼쪽 소개 (모바일에선 숨김) */
export function SideIntro({ children }: { children?: ReactNode }) {
  return (
    <div>
      <Eyebrow>서울 대학생을 위한 첫 자취 판단 도우미</Eyebrow>
      <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
        첫 자취,
        <br />
        해도 될까?
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-fg-sub">
        통학으로 잃는 시간과 체력을 돈으로 바꿔서, 자취가 나에게 얼마나 이득인지 보여 드릴게요.
      </p>
      {children}
    </div>
  );
}

/** 답한 항목 목록 한 줄 (누르면 그 질문으로) */
export function AnswerRow({
  label, value, onClick, current, disabled, size = "md",
}: { label: string; value: string; onClick?: () => void; current?: boolean; disabled?: boolean; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={current ? "step" : undefined}
      className={cx(
        "group flex w-full items-center gap-3 text-left transition disabled:cursor-default",
        size === "md" ? "min-h-14 px-5 py-3" : "min-h-11 rounded-control px-3 py-2",
        current ? "bg-primary-soft" : "enabled:hover:bg-surface-muted",
        focusRing,
      )}
    >
      <span className={cx("shrink-0", size === "md" ? "w-28 text-[15px]" : "w-24 text-[13px]", current ? "font-semibold text-primary" : "text-fg-sub")}>
        {label}
      </span>
      <span className={cx("min-w-0 flex-1 truncate text-right font-semibold", size === "md" ? "text-[15px]" : "text-[13px]", disabled && "text-fg-muted")}>
        {value}
      </span>
      {!disabled && <Chevron />}
    </button>
  );
}

export function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-fg-muted">
      <path d="m6 3.5 4.5 4.5L6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cx("h-1 overflow-hidden rounded-full bg-border", className)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}>
      <div className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out" style={{ width: `${value}%` }} />
    </div>
  );
}
