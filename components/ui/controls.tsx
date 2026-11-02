"use client";

import { useState } from "react";
import type {
  AnchorHTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes, ReactNode,
  SelectHTMLAttributes, TextareaHTMLAttributes,
} from "react";
import { cx, focusRing, styles } from "./styles";

// ── 버튼 ─────────────────────────────
export type ButtonVariant = keyof typeof styles.button.variant;
export type ButtonSize = keyof typeof styles.button.size;

export function Button({
  variant = "primary", size = "md", block, className, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; block?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={cx(styles.button.base, styles.button.variant[variant], styles.button.size[size], block && "w-full", className)}
    />
  );
}

export function TextLink({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      className={cx("inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline", focusRing, className)}
    />
  );
}

/** 링크처럼 보이는 버튼 (토글 등 페이지 이동이 아닌 동작) */
export function LinkButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cx("inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline", focusRing, className)}
    />
  );
}

export function Chip({
  selected, dashed, onClick, children,
}: { selected?: boolean; dashed?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cx(styles.chip.base, selected ? styles.chip.selected : styles.chip.idle, !selected && dashed && styles.chip.dashed)}
    >
      {children}
    </button>
  );
}

export function ChipGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

/** 하나만 고르는 버튼 묶음 */
export function Segmented<T extends string | number>({
  options, value, onChange, label,
}: { options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cx(styles.segment.base, o.value === value ? styles.segment.selected : styles.segment.idle)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── 폼 ─────────────────────────────
type Tone = keyof typeof styles.control.tone;
type Size = keyof typeof styles.control.size;
const controlClass = (tone: Tone = "default", size: Size = "md", extra?: string) =>
  cx(styles.control.base, styles.control.tone[tone], styles.control.size[size], extra);

/** 라벨 + 입력 + 도움말 */
export function Field({
  label, htmlFor, hint, compact, children,
}: { label: ReactNode; htmlFor?: string; hint?: ReactNode; compact?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={compact ? styles.miniLabel : styles.label}>
        {label}
      </label>
      {children}
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}

export function FieldGroupLabel({ children }: { children: ReactNode }) {
  return <p className={styles.label}>{children}</p>;
}

type ControlProps = { tone?: Tone; size?: Size };

export function TextInput({ tone, size, className, ...props }: InputHTMLAttributes<HTMLInputElement> & ControlProps) {
  return <input {...props} className={controlClass(tone, size, className)} />;
}

export function Select({ tone, size, className, ...props }: SelectHTMLAttributes<HTMLSelectElement> & ControlProps) {
  return <select {...props} className={controlClass(tone, size, cx("appearance-none", className))} />;
}

export function TextArea({ tone, size, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & ControlProps) {
  return <textarea {...props} className={controlClass(tone, size, cx("resize-y leading-relaxed", className))} />;
}

/**
 * 숫자 입력 + 단위 표시. 보고 있을 땐 천 단위 쉼표, 편집 중엔 원본 숫자.
 * (type="number" 스피너를 피하려고 텍스트 입력 + 숫자 키패드 사용, 빈칸이면 0)
 */
export function NumberInput({
  value, onChange, suffix, step = 1, id, tone, size,
}: { value: number; onChange: (v: number) => void; suffix?: string; step?: number; id?: string } & ControlProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const decimals = step < 1;
  const safe = Number.isFinite(value) ? value : 0;
  const shown = draft ?? safe.toLocaleString("ko-KR", { maximumFractionDigits: decimals ? 2 : 0 });

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode={decimals ? "decimal" : "numeric"}
        autoComplete="off"
        value={shown}
        onFocus={() => setDraft(String(safe))}
        onBlur={() => setDraft(null)}
        onChange={(e) => {
          const raw = e.target.value.replace(decimals ? /[^0-9.]/g : /[^0-9]/g, "");
          setDraft(raw);
          const n = raw === "" ? 0 : Number(raw);
          if (Number.isFinite(n)) onChange(n);
        }}
        onKeyDown={(e) => {
          if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
          e.preventDefault();
          const next = Math.max(0, +(safe + (e.key === "ArrowUp" ? step : -step)).toFixed(2));
          setDraft(String(next));
          onChange(next);
        }}
        className={controlClass(tone, size, cx("tabular-nums", suffix && "pr-11"))}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-fg-muted">{suffix}</span>
      )}
    </div>
  );
}

/** 라벨·값이 위에 붙은 0~100 슬라이더 */
export function Slider({
  label, value, onChange, display,
}: { label: ReactNode; value: number; onChange: (v: number) => void; display?: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex justify-between text-sm">
        <span className="text-fg-sub">{label}</span>
        <b className="tabular-nums">{display ?? value}</b>
      </span>
      <input
        type="range"
        className="ui-slider"
        min={0}
        max={100}
        value={value}
        style={{ ["--pct" as string]: `${value}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
