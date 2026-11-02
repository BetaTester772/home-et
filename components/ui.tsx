import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cx("rounded-3xl border border-line bg-white p-6 sm:p-7", className)}>
      {children}
    </section>
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-ink">
      {children}
    </label>
  );
}

export const fieldClass =
  "w-full rounded-xl border border-line bg-field px-3.5 py-3 text-[15px] text-ink outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(fieldClass, props.className)} />;
}

/** 숫자 입력 (빈칸이면 0) */
export function NumberInput({
  value, onChange, suffix, min = 0, step = 1, id, className,
}: {
  value: number; onChange: (v: number) => void; suffix?: string;
  min?: number; step?: number; id?: string; className?: string;
}) {
  return (
    <div className={cx("relative", className)}>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className={cx(fieldClass, suffix && "pr-11")}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
          {suffix}
        </span>
      )}
    </div>
  );
}

type Variant = "primary" | "secondary" | "ghost";
export function Button({
  variant = "primary", className, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20",
        variant === "primary" && "bg-brand text-white hover:bg-brand-dark",
        variant === "secondary" && "border border-line bg-white text-ink hover:bg-field",
        variant === "ghost" && "text-sub hover:bg-field",
        className,
      )}
    />
  );
}

export function Row({ label, value, strong }: { label: ReactNode; value: ReactNode; strong?: boolean }) {
  return (
    <div className={cx("flex items-baseline justify-between gap-4 py-1.5 text-sm", strong ? "font-bold text-ink" : "text-sub")}>
      <span>{label}</span>
      <span className={cx("tabular-nums", strong ? "text-[15px]" : "text-ink")}>{value}</span>
    </div>
  );
}

export function Chip({
  active, onClick, children, dashed,
}: { active?: boolean; onClick?: () => void; children: ReactNode; dashed?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "rounded-full px-4 py-2.5 text-sm font-semibold transition",
        active ? "bg-brand text-white" : "border bg-white text-sub hover:bg-field",
        !active && (dashed ? "border-dashed border-line" : "border-line"),
      )}
    >
      {children}
    </button>
  );
}

export function PageTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
      <p className="mt-2 text-[15px] text-sub">{sub}</p>
    </div>
  );
}
