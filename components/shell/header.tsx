"use client";

import type { StepNo } from "@/lib/app-state";
import { useAuth } from "@/components/providers";
import { cx, focusRing } from "@/components/ui/styles";

export const STEPS: { no: StepNo; label: string }[] = [
  { no: 1, label: "정보 입력" },
  { no: 2, label: "자취 적합 리포트" },
  { no: 3, label: "맞춤 월세 추천" },
  { no: 4, label: "계약 D-day" },
];

export function Header({
  step, canVisit, onNavigate,
}: { step: StepNo; canVisit: (no: StepNo) => boolean; onNavigate: (no: StepNo) => void }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <button type="button" onClick={() => onNavigate(1)} className={cx("shrink-0 rounded-md", focusRing)} aria-label="HOME:ET 처음으로">
          <Logo />
        </button>
        <nav className="-mx-1 flex min-w-0 flex-1 justify-start gap-1 overflow-x-auto px-1 sm:justify-end" aria-label="단계">
          {STEPS.map(({ no, label }) => (
            <button
              key={no}
              type="button"
              disabled={!canVisit(no)}
              onClick={() => onNavigate(no)}
              aria-current={step === no ? "step" : undefined}
              className={cx(
                "shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] transition disabled:cursor-not-allowed disabled:opacity-40",
                focusRing,
                step === no ? "bg-primary font-bold text-on-primary" : "text-fg-sub hover:bg-surface-muted",
              )}
            >
              {no} {label}
            </button>
          ))}
        </nav>
        <AuthButton />
      </div>
    </header>
  );
}

export function Logo() {
  return (
    <span className="text-xl font-extrabold tracking-tight">
      HOME<span className="text-accent">:</span>ET
    </span>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-8 text-xs text-fg-muted sm:px-6">
      HOME:ET · 팀 로컬에선 됐는데 · 시세는 예시 데이터이며 산출식은 팀 확정 전 초안이에요.
    </footer>
  );
}

function AuthButton() {
  const auth = useAuth();
  if (!auth.enabled) return null;
  if (auth.status === "loading") return <span className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-surface-muted" aria-hidden />;
  if (auth.status === "authenticated") {
    return (
      <div className="flex shrink-0 items-center gap-2">
        {auth.image && (
          // eslint-disable-next-line @next/next/no-img-element -- Google 프로필 이미지 (외부 도메인)
          <img src={auth.image} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
        )}
        <span className="hidden text-sm font-semibold md:inline">{auth.name}</span>
        <button type="button" onClick={auth.signOut} className={cx("rounded-full px-3 py-2 text-[13px] text-fg-sub hover:bg-surface-muted", focusRing)}>
          로그아웃
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={auth.signIn}
      className={cx(
        "flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-[13px] font-semibold hover:bg-surface-muted",
        focusRing,
      )}
    >
      <GoogleMark />
      <span className="hidden sm:inline">Google로 로그인</span>
      <span className="sm:hidden">로그인</span>
    </button>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
