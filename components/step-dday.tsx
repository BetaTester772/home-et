"use client";

import { useState } from "react";
import { man } from "@/lib/calc";
import {
  TERMS, buildIcs, buildSteps, dLabel, googleCalendarUrl, md, parseDate, stepDateText,
} from "@/lib/dday";
import { Button, Card, Label, NumberInput, PageTitle, TextInput, cx } from "./ui";
import type { AppState } from "./state";

export function DdayStep({
  state, update, today,
}: {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  today: Date;
}) {
  const contract = parseDate(state.contract);
  const balance = parseDate(state.balance);
  const valid = contract && balance && balance.getTime() >= contract.getTime();
  const steps = valid ? buildSteps(today, contract, balance, state.leaseDeposit, state.leaseRent) : [];

  const current = steps.find((s) => dLabel(s, today) === "오늘") ?? steps.find((s) => dLabel(s, today) !== "완료") ?? steps[0];
  const [picked, setPicked] = useState<string | null>(null);
  const selected = steps.find((s) => s.key === picked) ?? current;

  const downloadIcs = () => {
    const blob = new Blob([buildIcs(steps)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "home-et-계약-일정.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageTitle title="첫 계약, 언제 무엇을 하면 될까?" sub="날짜만 넣으면 단계별 D-day를 알려 드리고, 그때 꼭 알아야 할 용어를 쉽게 풀어 드려요." />

      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr_auto] lg:items-end">
          <div>
            <Label htmlFor="contract">계약일</Label>
            <TextInput id="contract" type="date" value={state.contract} onChange={(e) => update({ contract: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="balance">잔금·입주일</Label>
            <TextInput id="balance" type="date" value={state.balance} min={state.contract} onChange={(e) => update({ balance: e.target.value })} />
          </div>
          <div>
            <Label>보증금 / 월세</Label>
            <div className="grid grid-cols-2 gap-2">
              <NumberInput suffix="원" step={1000000} value={state.leaseDeposit} onChange={(v) => update({ leaseDeposit: v })} />
              <NumberInput suffix="원" step={10000} value={state.leaseRent} onChange={(v) => update({ leaseRent: v })} />
            </div>
          </div>
          <Button variant="secondary" className="border-brand/40 text-brand" disabled={!valid} onClick={downloadIcs}>
            캘린더 파일 받기 (.ics)
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted">
          {man(state.leaseDeposit, 0)} / {man(state.leaseRent, 0)} · .ics 파일은 Google·Apple 캘린더 모두에 가져올 수 있어요.
        </p>
        {!valid && (
          <p className="mt-2 text-sm font-medium text-accent">잔금·입주일은 계약일과 같거나 그 뒤여야 해요.</p>
        )}
      </Card>

      {valid && selected && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)]">
          <Card>
            <h2 className="mb-4 font-bold">
              D-day 타임라인 <span className="ml-1 text-sm font-normal text-muted">오늘 {md(today)} 기준</span>
            </h2>
            <ol className="space-y-2">
              {steps.map((s) => {
                const label = dLabel(s, today);
                const active = s.key === selected.key;
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => setPicked(s.key)}
                      className={cx(
                        "flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition",
                        active ? "border-brand/50 bg-brand-soft/70" : "border-line hover:bg-field",
                      )}
                    >
                      <span
                        className={cx(
                          "grid h-9 w-15 shrink-0 place-items-center rounded-lg text-sm font-bold",
                          label === "오늘" ? "bg-accent text-white" : label === "완료" ? "bg-field text-muted" : "bg-[#eceef2] text-ink",
                        )}
                      >
                        {label}
                      </span>
                      <span>
                        <span className={cx("block text-[15px] font-bold", label === "완료" && "text-muted line-through")}>{s.title}</span>
                        <span className="block text-sm text-muted">{stepDateText(s)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card>
            <p className="text-sm font-semibold text-accent">
              {dLabel(selected, today)} · {stepDateText(selected)}
            </p>
            <h2 className="mt-1 text-xl font-bold">{selected.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink">{selected.todo}</p>

            <h3 className="mt-6 text-sm font-semibold text-sub">이 단계에서 알아야 할 용어</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {selected.terms.map((t) => (
                <div key={t} className="rounded-2xl border border-line bg-[#f8f9fb] p-4">
                  <p className="font-bold text-brand">{t}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-sub">{TERMS[t]}</p>
                </div>
              ))}
            </div>

            <a
              href={googleCalendarUrl(selected)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
            >
              이 단계만 Google 캘린더에 추가 ↗
            </a>
          </Card>
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-muted">
        HOME:ET의 계약 안내는 일반 정보이며 법률 자문이 아니에요. 실제 계약 전에는 등기부등본 원문과 공인중개사 설명을 꼭 함께 확인하세요.
      </p>
    </div>
  );
}
