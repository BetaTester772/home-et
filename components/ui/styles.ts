/**
 * UI 프리미티브의 시각 스타일을 한곳에 모은 파일.
 * 색·라운드는 app/globals.css 토큰을, 모양·크기·상태는 여기 variant 맵을 고치면 됩니다.
 * 화면(components/screens)은 이 파일을 직접 import하지 않고 프리미티브만 씁니다.
 */

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const focusRing = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20";

export const styles = {
  card: {
    base: "rounded-card border bg-surface",
    tone: {
      default: "border-border",
      highlight: "border-primary/30 bg-primary-soft/60",
    },
    padding: { md: "p-5 md:p-7", sm: "p-4 md:p-5" },
  },
  panel: "rounded-panel bg-surface-muted p-4",

  button: {
    base: `inline-flex items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`,
    variant: {
      primary: "bg-primary text-on-primary hover:bg-primary-hover",
      secondary: "border border-border bg-surface text-fg hover:bg-surface-muted",
      outline: "border border-primary/40 bg-surface text-primary hover:bg-primary-soft",
      ghost: "text-fg-sub hover:bg-surface-muted",
    },
    size: {
      sm: "rounded-control px-3 py-2 text-xs",
      md: "rounded-control px-5 py-3 text-[15px]",
      lg: "rounded-control px-5 py-4 text-[15px]",
    },
  },

  chip: {
    base: `shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.97] ${focusRing}`,
    selected: "bg-primary text-on-primary",
    idle: "border border-border bg-surface text-fg-sub hover:bg-surface-muted",
    dashed: "border-dashed",
  },

  control: {
    // 모바일은 16px 이상이어야 iOS가 포커스할 때 화면을 확대하지 않음
    base: "w-full rounded-control border border-border px-3.5 text-base md:text-[15px] text-fg outline-none transition focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10",
    tone: { default: "bg-surface-muted", inset: "bg-surface" }, // inset = 회색 패널 안에 놓일 때
    size: { md: "py-3", sm: "py-2.5" },
  },
  /** 한 화면 한 질문용 큰 입력 (하단 선만) */
  hero: {
    wrap: "flex cursor-text items-baseline gap-1.5 border-b-2 border-border pb-2 transition-colors focus-within:border-primary",
    number: "min-w-[1ch] bg-transparent text-[34px] font-bold leading-tight tracking-tight tabular-nums text-fg outline-none placeholder:text-fg-muted/50 md:text-[40px]",
    text: "w-full bg-transparent text-2xl font-semibold leading-tight text-fg outline-none placeholder:text-fg-muted/50 md:text-[28px]",
    suffix: "text-2xl font-bold text-fg-muted md:text-[28px]",
  },

  /** 크게 누르는 선택지 (목록·격자) */
  option: {
    base: `flex min-h-14 w-full items-center gap-3 rounded-panel border px-4 py-3.5 text-left transition active:scale-[0.99] ${focusRing}`,
    idle: "border-border bg-surface hover:border-fg-muted/40 hover:bg-surface-muted",
    selected: "border-primary bg-primary-soft text-primary",
  },

  label: "mb-2 block text-sm font-semibold text-fg",
  miniLabel: "mb-1 block text-xs font-medium text-fg-sub",
  hint: "mt-2 text-xs text-fg-muted",

  badge: {
    base: "inline-grid place-items-center rounded-full px-3 py-1.5 text-xs font-bold",
    tone: {
      primary: "bg-primary-soft text-primary",
      accent: "bg-accent-soft text-accent",
      solidAccent: "bg-accent text-on-accent",
      neutral: "bg-surface-strong text-fg",
      muted: "bg-surface-muted text-fg-muted",
    },
  },

  meter: {
    track: "relative rounded-full bg-border",
    fill: { primary: "bg-primary", accent: "bg-accent" },
    size: { sm: "h-2.5", md: "h-3" },
    marker: "absolute -top-1.5 left-1/2 h-5.5 w-0.5 -translate-x-1/2 bg-fg",
  },

  callout: {
    base: "rounded-panel leading-relaxed",
    tone: {
      primary: "bg-primary-soft p-3.5 text-sm text-primary-hover",
      neutral: "bg-surface-muted p-3.5 text-xs text-fg-sub",
      warning: "text-sm font-medium text-accent",
    },
  },

  emphasis: { primary: "text-primary", accent: "text-accent" },
} as const;
