"use client";

import { useState } from "react";
import type { AppState } from "@/lib/app-state";
import { rebalance, type LivingCosts } from "@/lib/calc";
import { WEIGHT_LABELS, reportModel } from "@/lib/view-models";
import {
  Badge, BigNumber, Button, Callout, Card, CardTitle, Em, Field, FinePrint, LabeledMeter,
  LinkButton, Meter, NumberInput, Panel, ScaleLabels, SectionLabel, Slider, StatList,
} from "@/components/ui";

export function ReportScreen({
  state, update, name, onStay, onGo,
}: {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  name: string | null;
  onStay: () => void;
  onGo: () => void;
}) {
  const [showAssumptions, setShowAssumptions] = useState(false);
  const m = reportModel(state, name);
  const tone = m.recommended ? "primary" : "accent";

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
        <Card>
          <CardTitle aside={<Badge tone={tone}>{m.verdict}</Badge>}>{m.title}</CardTitle>
          <div className="mt-4">
            <BigNumber value={m.index} unit="/ 100" />
          </div>
          <div className="mt-5 space-y-3">
            <Meter value={m.indexPct} tone={tone} size="sm" marker />
            <ScaleLabels items={["통학 유리", "50 = 손익분기", "자취 유리"]} />
          </div>
        </Card>

        <Card>
          {m.hasSavedTime ? (
            <div className="space-y-5">
              <p className="text-lg font-bold leading-snug sm:text-xl">
                자취는 통학 1시간을 약 <Em tone="accent">{m.headline.price}</Em>에 되사는 셈이에요. {m.headline.subject} 1시간을 약{" "}
                <Em>{m.headline.myHour}</Em>어치로 여기고 있어요.
              </p>
              {m.bars.map((b) => (
                <LabeledMeter key={b.label} {...b} />
              ))}
              <p className="text-sm text-fg-sub">{m.summary}</p>
            </div>
          ) : (
            <p className="text-lg font-bold">자취 후 통학 시간이 지금보다 줄지 않아서, 되찾는 시간이 없어요.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        <Card>
          <CardTitle meta="방학 포함 월평균">한 달 기준 비교</CardTitle>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <SectionLabel tone="primary">자취하면 되찾는 것</SectionLabel>
              <StatList rows={m.gains} />
            </div>
            <div className="space-y-2">
              <SectionLabel tone="accent">자취하면 더 드는 돈</SectionLabel>
              <StatList rows={m.costs} />
            </div>
          </div>

          <div className="mt-5">
            <LinkButton onClick={() => setShowAssumptions((v) => !v)} aria-expanded={showAssumptions}>
              {showAssumptions ? "가정값 접기" : "가정값 직접 고치기"}
            </LinkButton>
          </div>
          {showAssumptions && <Assumptions costs={state.costs} onChange={(patch) => update({ costs: { ...state.costs, ...patch } })} />}
        </Card>

        <Card>
          <CardTitle
            aside={
              m.aiPct && (
                <Button variant="secondary" size="sm" disabled={m.isAiValue} onClick={() => update({ pct: m.aiPct! })}>
                  AI 분석값으로
                </Button>
              )
            }
          >
            내 가치관
          </CardTitle>
          <div className="mt-5 space-y-5">
            {WEIGHT_LABELS.map(({ key, label }) => (
              <Slider
                key={key}
                label={label}
                value={state.pct[key]}
                display={`${state.pct[key]}%`}
                onChange={(v) => update({ pct: rebalance(state.pct, key, v) })}
              />
            ))}
          </div>
          {m.reason && (
            <Callout tone="neutral" className="mt-5">
              {m.reason.text}
              {m.reason.fallbackNote && <span className="mt-1 block text-fg-muted">{m.reason.fallbackNote}</span>}
            </Callout>
          )}
        </Card>
      </div>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-fg-sub">
          <span>
            자취하면 등교일 저녁 <b className="text-fg">{m.eveningGain}</b>
          </span>
          <span>
            막차 걱정 없이 학교에 남을 수 있는 날 <b className="text-fg">{m.lateDays}</b>
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onStay}>
            통학 유지하기
          </Button>
          <Button onClick={onGo}>{m.nextLabel}</Button>
        </div>
      </Card>

      {state.decision === "stay" && (
        <Card tone="highlight">
          <p className="font-bold">통학을 유지하기로 했어요.</p>
          <p className="mt-1 text-sm text-fg-sub">{m.stayMessage}</p>
        </Card>
      )}
    </div>
  );
}

function Assumptions({ costs, onChange }: { costs: LivingCosts; onChange: (patch: Partial<LivingCosts>) => void }) {
  const fields: { label: string; key: keyof LivingCosts; step: number }[] = [
    { label: "월세 (학교 주변 기본값)", key: "rent", step: 10_000 },
    { label: "관리비", key: "mgmt", step: 10_000 },
    { label: "추가 생활비", key: "living", step: 10_000 },
    { label: "초기 비용 총액", key: "initialTotal", step: 50_000 },
    { label: "보증금", key: "deposit", step: 1_000_000 },
  ];
  return (
    <Panel className="mt-4 grid gap-3 sm:grid-cols-3">
      {fields.map((f) => (
        <Field key={f.key} compact label={f.label} htmlFor={`as-${f.key}`}>
          <NumberInput id={`as-${f.key}`} tone="inset" size="sm" suffix="원" step={f.step} value={costs[f.key]} onChange={(v) => onChange({ [f.key]: v })} />
        </Field>
      ))}
      <Field compact label="보증금 기회비용 연이율" htmlFor="as-rate">
        <NumberInput
          id="as-rate"
          tone="inset"
          size="sm"
          suffix="%"
          step={0.1}
          value={Math.round(costs.annualRate * 1000) / 10}
          onChange={(v) => onChange({ annualRate: v / 100 })}
        />
      </Field>
      <FinePrint className="sm:col-span-3">
        자취 후 왕복 20분, 학기 32주(방학 포함 월평균), 피로 계수 = 0.15 + 0.1 × 환승 횟수(최대 0.5)로 계산해요. 모두 팀 확정 전 초안이에요.
      </FinePrint>
    </Panel>
  );
}
