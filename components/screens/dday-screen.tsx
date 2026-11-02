"use client";

import { useState } from "react";
import type { AppState } from "@/lib/app-state";
import { buildIcs } from "@/lib/dday";
import { ddayModel, type DdayItem } from "@/lib/view-models";
import {
  Button, Callout, Card, CardTitle, Eyebrow, Field, FieldGroupLabel, FinePrint, NumberInput,
  PageHeader, SectionLabel, TermCard, TextInput, TextLink, TimelineItem, type BadgeTone,
} from "@/components/ui";

const badgeTone = (it: DdayItem): BadgeTone => (it.isToday ? "solidAccent" : it.done ? "muted" : "neutral");

function downloadIcs(content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "home-et-계약-일정.ics";
  a.click();
  URL.revokeObjectURL(url);
}

export function DdayScreen({
  state, update, today,
}: {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  today: Date;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const m = ddayModel(state, today, picked);
  const sel = m.selected;

  return (
    <div>
      <PageHeader title="첫 계약, 언제 무엇을 하면 될까?" sub="날짜만 넣으면 단계별 D-day를 알려 드리고, 그때 꼭 알아야 할 용어를 쉽게 풀어 드려요." />

      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr_auto] lg:items-end">
          <Field label="계약일" htmlFor="contract">
            <TextInput id="contract" type="date" value={state.contract} onChange={(e) => update({ contract: e.target.value })} />
          </Field>
          <Field label="잔금·입주일" htmlFor="balance">
            <TextInput id="balance" type="date" value={state.balance} min={state.contract} onChange={(e) => update({ balance: e.target.value })} />
          </Field>
          <div>
            <FieldGroupLabel>보증금 / 월세</FieldGroupLabel>
            <div className="grid grid-cols-2 gap-2">
              <NumberInput suffix="원" step={1_000_000} value={state.leaseDeposit} onChange={(v) => update({ leaseDeposit: v })} />
              <NumberInput suffix="원" step={10_000} value={state.leaseRent} onChange={(v) => update({ leaseRent: v })} />
            </div>
          </div>
          <Button variant="outline" disabled={!m.valid} onClick={() => downloadIcs(buildIcs(m.steps))}>
            캘린더 파일 받기 (.ics)
          </Button>
        </div>
        <FinePrint className="mt-3">{m.amountText} · .ics 파일은 Google·Apple 캘린더 모두에 가져올 수 있어요.</FinePrint>
        {!m.valid && (
          <Callout tone="warning" className="mt-2">
            잔금·입주일은 계약일과 같거나 그 뒤여야 해요.
          </Callout>
        )}
      </Card>

      {m.valid && sel && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)]">
          <Card>
            <CardTitle meta={`오늘 ${m.todayText} 기준`}>D-day 타임라인</CardTitle>
            <ol className="mt-4 space-y-2">
              {m.items.map((it) => (
                <li key={it.key}>
                  <TimelineItem
                    badge={it.badge}
                    badgeTone={badgeTone(it)}
                    title={it.title}
                    sub={it.dateText}
                    done={it.done}
                    selected={it.key === sel.key}
                    onSelect={() => setPicked(it.key)}
                  />
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <Eyebrow>
              {sel.badge} · {sel.dateText}
            </Eyebrow>
            <h2 className="mt-1 text-xl font-bold">{sel.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed">{sel.todo}</p>

            <div className="mt-6 space-y-3">
              <SectionLabel>이 단계에서 알아야 할 용어</SectionLabel>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {sel.terms.map((t) => (
                  <TermCard key={t.term} term={t.term}>
                    {t.desc}
                  </TermCard>
                ))}
              </div>
            </div>

            <TextLink href={sel.calendarUrl} target="_blank" rel="noopener noreferrer" className="mt-6">
              이 단계만 Google 캘린더에 추가 ↗
            </TextLink>
          </Card>
        </div>
      )}

      <FinePrint className="mt-6">
        HOME:ET의 계약 안내는 일반 정보이며 법률 자문이 아니에요. 실제 계약 전에는 등기부등본 원문과 공인중개사 설명을 꼭 함께 확인하세요.
      </FinePrint>
    </div>
  );
}
