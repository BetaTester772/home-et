"use client";

import { useState } from "react";
import {
  compute, fromPercents, hm, hours, man, rebalance, toPercents, won,
  type LivingCosts, type Percents, type WeightKey,
} from "@/lib/calc";
import { Button, Card, NumberInput, Row, cx } from "./ui";
import type { AppState } from "./state";

const KEYS: { key: WeightKey; label: string }[] = [
  { key: "money", label: "돈" },
  { key: "time", label: "시간" },
  { key: "body", label: "체력" },
];

export function ReportStep({
  state, update, name, onStay, onGo,
}: {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  name: string | null;
  onStay: () => void;
  onGo: () => void;
}) {
  const [showAssumptions, setShowAssumptions] = useState(false);
  const w = fromPercents(state.pct);
  const r = compute(state.commute, state.costs, w);
  const recommended = r.index >= 50;
  const who = name ? `${name} 님` : "나";
  const aiPct = state.analysis ? toPercents(state.analysis) : null;
  const isAi = aiPct && KEYS.every(({ key }) => aiPct[key] === state.pct[key]);
  const setCost = (patch: Partial<LivingCosts>) => update({ costs: { ...state.costs, ...patch } });

  const myHour = Math.round(r.myHourValue);
  const price = Math.round(r.buyBackPrice);
  const scale = Math.max(myHour, price, 1);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">{name ? `${name} 님의 자취지수` : "내 자취지수"}</h2>
            <span
              className={cx(
                "rounded-full px-3 py-1.5 text-xs font-bold",
                recommended ? "bg-brand-soft text-brand" : "bg-accent-soft text-accent",
              )}
            >
              {recommended ? "자취 추천" : "다시 생각해 보기"}
            </span>
          </div>
          <p className="mt-4 flex items-baseline gap-1.5">
            <span className="text-6xl font-bold tracking-tight tabular-nums">{r.index.toFixed(1)}</span>
            <span className="text-lg text-muted">/ 100</span>
          </p>
          <div className="relative mt-5 h-2.5 rounded-full bg-line" aria-hidden>
            <div
              className={cx("h-full rounded-full transition-all", recommended ? "bg-brand" : "bg-accent")}
              style={{ width: `${r.index}%` }}
            />
            <div className="absolute -top-1.5 left-1/2 h-5.5 w-0.5 -translate-x-1/2 bg-ink" />
          </div>
          <div className="mt-3 flex justify-between text-xs text-muted">
            <span>통학 유리</span>
            <span>50 = 손익분기</span>
            <span>자취 유리</span>
          </div>
        </Card>

        <Card>
          {r.savedHours > 0 ? (
            <>
              <p className="text-lg font-bold leading-snug sm:text-xl">
                자취는 통학 1시간을 약 <span className="text-accent">{man(price)}</span>에 되사는 셈이에요.{" "}
                {name ? `지금 ${name} 님은` : "지금 내 가치관으로는"} 1시간을 약{" "}
                <span className="text-brand">{man(myHour)}</span>어치로 여기고 있어요.
              </p>
              <Bar label="내가 매기는 1시간의 가치" value={won(myHour)} pct={(myHour / scale) * 100} color="bg-brand" />
              <Bar label="자취로 1시간을 되사는 가격" value={won(price)} pct={(price / scale) * 100} color="bg-accent" />
              <p className="mt-4 text-sm text-sub">
                한 달에 약 {hours(r.savedHours)}을 되찾는 대신 약 {man(r.extraCost, 0)}을 더 써요. 내 1시간의 가치가 자취 가격보다
                크면 자취가 이득이에요.
              </p>
            </>
          ) : (
            <p className="text-lg font-bold">자취 후 통학 시간이 지금보다 줄지 않아서, 되찾는 시간이 없어요.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        <Card>
          <h2 className="font-bold">
            한 달 기준 비교 <span className="ml-1 text-sm font-normal text-muted">방학 포함 월평균</span>
          </h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-bold text-brand">자취하면 되찾는 것</h3>
              <Row label="통학 시간 (여유 시간 포함)" value={hours(r.savedHours)} />
              <Row label="시간 가치" value={man(r.timeValue)} />
              <Row label={`피로 회복 시간 (계수 ${r.fatigue.toFixed(2)})`} value={hours(r.fatigueHours)} />
              <Row label="체력 가치" value={man(r.bodyValue)} />
              <div className="mt-2 border-t border-line pt-2">
                <Row label="합계" value={man(r.gainTotal)} strong />
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold text-accent">자취하면 더 드는 돈</h3>
              <Row label="월세 · 관리비" value={man(r.rentAndMgmt)} />
              <Row label="추가 생활비" value={man(r.living)} />
              <Row label="초기 비용 (2년 분할)" value={man(r.initialMonthly)} />
              <Row label="보증금 기회비용 · 절약 교통비" value={man(r.depositCost - r.savedFare)} />
              <div className="mt-2 border-t border-line pt-2">
                <Row label="합계" value={man(r.extraCost)} strong />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAssumptions((v) => !v)}
            className="mt-5 text-sm font-semibold text-brand hover:underline"
            aria-expanded={showAssumptions}
          >
            {showAssumptions ? "가정값 접기" : "가정값 직접 고치기"}
          </button>
          {showAssumptions && (
            <div className="mt-4 grid gap-3 rounded-2xl bg-field p-4 sm:grid-cols-3">
              <Mini label="월세 (학교 주변 기본값)" v={state.costs.rent} on={(v) => setCost({ rent: v })} suffix="원" step={10000} />
              <Mini label="관리비" v={state.costs.mgmt} on={(v) => setCost({ mgmt: v })} suffix="원" step={10000} />
              <Mini label="추가 생활비" v={state.costs.living} on={(v) => setCost({ living: v })} suffix="원" step={10000} />
              <Mini label="초기 비용 총액" v={state.costs.initialTotal} on={(v) => setCost({ initialTotal: v })} suffix="원" step={50000} />
              <Mini label="보증금" v={state.costs.deposit} on={(v) => setCost({ deposit: v })} suffix="원" step={1000000} />
              <Mini
                label="보증금 기회비용 연이율"
                v={Math.round(state.costs.annualRate * 1000) / 10}
                on={(v) => setCost({ annualRate: v / 100 })}
                suffix="%"
                step={0.1}
              />
              <p className="text-xs text-muted sm:col-span-3">
                자취 후 왕복 20분, 학기 32주(방학 포함 월평균), 피로 계수 = 0.15 + 0.1 × 환승 횟수(최대 0.5)로 계산해요. 모두 팀 확정 전 초안이에요.
              </p>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold">내 가치관</h2>
            {aiPct && (
              <Button variant="secondary" className="px-3 py-2 text-xs" disabled={!!isAi} onClick={() => update({ pct: aiPct })}>
                AI 분석값으로
              </Button>
            )}
          </div>
          <div className="mt-5 space-y-5">
            {KEYS.map(({ key, label }) => (
              <WeightSlider key={key} label={label} pct={state.pct} k={key} onChange={(p) => update({ pct: p })} />
            ))}
          </div>
          {state.analysis && (
            <p className="mt-5 rounded-2xl bg-field p-3.5 text-xs leading-relaxed text-sub">
              {state.analysis.source === "gemini" ? "AI 분석 근거: " : ""}
              {state.analysis.reason}
              {state.analysis.source !== "gemini" && (
                <span className="mt-1 block text-muted">Gemini API에 연결하지 못해 대체 분석을 썼어요.</span>
              )}
            </p>
          )}
        </Card>
      </div>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-sub">
          <span>
            자취하면 등교일 저녁 <b className="text-ink">+{hm(r.savedDailyMin)}</b>
          </span>
          <span>
            막차 걱정 없이 학교에 남을 수 있는 날 <b className="text-ink">주 {state.commute.daysPerWeek}일</b>
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onStay}>
            통학 유지하기
          </Button>
          <Button onClick={onGo}>{recommended ? "자취 준비하기" : "그래도 자취하기"}</Button>
        </div>
      </Card>

      {state.decision === "stay" && (
        <Card className="border-brand/30 bg-brand-soft/60">
          <p className="font-bold">통학을 유지하기로 했어요.</p>
          <p className="mt-1 text-sm text-sub">
            {who === "나" ? "" : `${who}, `}리포트는 이 기기에 저장돼요. 등교일이나 시간표가 바뀌면 다시 계산해 보세요. 마음이 바뀌면 언제든 “그래도 자취하기”로 넘어갈 수 있어요.
          </p>
        </Card>
      )}
    </div>
  );
}

function Bar({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="mt-5">
      <div className="flex justify-between text-sm">
        <span className="text-sub">{label}</span>
        <b className="tabular-nums">{value}</b>
      </div>
      <div className="mt-2 h-3 rounded-full bg-line">
        <div className={cx("h-full rounded-full transition-all", color)} style={{ width: `${Math.max(2, pct)}%` }} />
      </div>
    </div>
  );
}

function WeightSlider({
  label, pct, k, onChange,
}: { label: string; pct: Percents; k: WeightKey; onChange: (p: Percents) => void }) {
  const v = pct[k];
  return (
    <label className="block">
      <span className="mb-2 flex justify-between text-sm">
        <span className="text-sub">{label}</span>
        <b className="tabular-nums">{v}%</b>
      </span>
      <input
        type="range"
        className="weight"
        min={0}
        max={100}
        value={v}
        style={{ ["--pct" as string]: `${v}%` }}
        onChange={(e) => onChange(rebalance(pct, k, Number(e.target.value)))}
      />
    </label>
  );
}

function Mini({
  label, v, on, suffix, step,
}: { label: string; v: number; on: (v: number) => void; suffix: string; step: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-sub">{label}</span>
      <NumberInput value={v} onChange={on} suffix={suffix} step={step} className="[&_input]:bg-white [&_input]:py-2.5" />
    </label>
  );
}
