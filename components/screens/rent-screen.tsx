"use client";

import type { AppState } from "@/lib/app-state";
import type { Region } from "@/lib/data";
import { rentModel } from "@/lib/view-models";
import {
  BigNumber, Button, Callout, Card, CardTitle, Chip, ChipGroup, Field, FinePrint,
  InlineStats, NumberInput, PageHeader, Panel, StatList, TextInput,
} from "@/components/ui";

export function RentScreen({
  state, update, name, onBack, onNext,
}: {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  name: string | null;
  onBack: () => void;
  onNext: () => void;
}) {
  const m = rentModel(state, name);
  const setCustom = (patch: Partial<Region>) => update({ custom: { ...state.custom, ...patch } });

  return (
    <div>
      <PageHeader title="어디서, 얼마까지 내도 될까?" sub="리포트와 같은 기준으로, 내 가치관에서 자취가 손해가 되지 않는 월세 상한을 계산했어요." />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Card>
          <CardTitle meta={`${m.school.name} 주변`}>자취 지역</CardTitle>
          <div className="mt-4">
            <ChipGroup>
              {m.regions.map((rg) => (
                <Chip key={rg.id} selected={state.regionId === rg.id} onClick={() => update({ regionId: rg.id, leaseRent: rg.rentMedian })}>
                  {rg.name}
                </Chip>
              ))}
              <Chip dashed selected={m.isCustom} onClick={() => update({ regionId: "custom", leaseRent: state.custom.rentMedian })}>
                직접 입력
              </Chip>
            </ChipGroup>
          </div>

          {m.isCustom && (
            <Panel className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="동 이름" htmlFor="cname">
                <TextInput id="cname" tone="inset" value={state.custom.name} onChange={(e) => setCustom({ name: e.target.value })} />
              </Field>
              <Field label="학교까지 편도 (버스·지하철 기준)" htmlFor="cmin">
                <NumberInput id="cmin" tone="inset" suffix="분" value={state.custom.oneWayMin} onChange={(v) => setCustom({ oneWayMin: v })} />
              </Field>
              <Field label="원룸 월세 중앙값" htmlFor="crent">
                <NumberInput
                  id="crent"
                  tone="inset"
                  suffix="원"
                  step={10_000}
                  value={state.custom.rentMedian}
                  onChange={(v) => update({ custom: { ...state.custom, rentMedian: v }, leaseRent: v })}
                />
              </Field>
              <Field label="관리비 중앙값" htmlFor="cmgmt">
                <NumberInput id="cmgmt" tone="inset" suffix="원" step={10_000} value={state.custom.mgmtMedian} onChange={(v) => setCustom({ mgmtMedian: v })} />
              </Field>
            </Panel>
          )}

          <div className="mt-4">
            <MapEmbed src={m.map.src} title={m.map.title} />
          </div>
          <div className="mt-3">
            <InlineStats items={m.stats} />
          </div>
        </Card>

        <Card>
          <CardTitle>{m.title}</CardTitle>
          <div className="mt-3">
            <BigNumber value={m.capText} unit={m.hasCap ? "/ 월 이하" : undefined} tone="primary" size="lg" />
          </div>
          <Callout className="mt-4">{m.message}</Callout>
          {m.hasCap && (
            <div className="mt-4">
              <StatList rows={m.breakdown} />
            </div>
          )}
          <FinePrint className="mt-4">{m.weightsNote}</FinePrint>
        </Card>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onBack}>
          리포트로 돌아가기
        </Button>
        <Button onClick={onNext}>계약 일정 등록하기</Button>
      </div>
    </div>
  );
}

/** 지도 공급자를 바꿀 때 이 컴포넌트만 교체 (현재 OpenStreetMap 임베드) */
function MapEmbed({ src, title }: { src: string; title: string }) {
  return (
    <div>
      <div className="overflow-hidden rounded-panel border border-border bg-surface-muted">
        <iframe key={src} title={title} src={src} className="h-64 w-full sm:h-72" loading="lazy" />
      </div>
      <FinePrint className="mt-1.5 text-right text-[11px]">지도 © OpenStreetMap 기여자 · 마커는 학교 위치</FinePrint>
    </div>
  );
}
