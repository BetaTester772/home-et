"use client";

import { compute, fromPercents, man, type LivingCosts } from "@/lib/calc";
import { findSchool, type Region } from "@/lib/data";
import { Button, Card, Chip, Label, NumberInput, PageTitle, Row, TextInput } from "./ui";
import { regionFare, selectedRegion, type AppState } from "./state";

export function RentStep({
  state, update, name, onBack, onNext,
}: {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  name: string | null;
  onBack: () => void;
  onNext: () => void;
}) {
  const school = findSchool(state.schoolId);
  const region = selectedRegion(state);
  const w = fromPercents(state.pct);
  const costs: LivingCosts = { ...state.costs, rent: region.rentMedian, mgmt: region.mgmtMedian };
  const r = compute(state.commute, costs, w, region.oneWayMin * 2, regionFare(region));
  const cap = r.rentCap;
  const finite = Number.isFinite(cap);

  let message: string;
  if (!finite) message = "돈 가중치가 0이라 상한이 없어요. 가치관 슬라이더를 다시 확인해 주세요.";
  else if (cap <= 0) message = `지금 가치관 기준으로는 ${region.name}에서 어떤 월세를 내도 통학보다 손해예요. 리포트에서 가치관을 다시 살펴보거나 통학을 이어가는 것도 방법이에요.`;
  else if (cap >= region.rentMedian * 1.5) message = `${region.name} 원룸 월세 중앙값(${man(region.rentMedian, 0)})보다 상한이 훨씬 높아요. 시세 안에서 넓게 고를 수 있어요.`;
  else if (cap >= region.rentMedian) message = `${region.name} 원룸 월세 중앙값(${man(region.rentMedian, 0)})이 상한 안에 들어와요. 이 지역에서 고르면 통학보다 손해가 아니에요.`;
  else message = `${region.name} 원룸 월세 중앙값(${man(region.rentMedian, 0)})이 상한보다 높아요. 중앙값보다 싼 방을 찾거나 다른 지역도 같이 비교해 보세요.`;

  const setCustom = (patch: Partial<Region>) => update({ custom: { ...state.custom, ...patch } });
  const lat = region.lat, lng = region.lng;
  const pad = 0.012;
  const minLat = Math.min(lat, school.lat) - pad, maxLat = Math.max(lat, school.lat) + pad;
  const minLng = Math.min(lng, school.lng) - pad, maxLng = Math.max(lng, school.lng) + pad;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${school.lat},${school.lng}`;

  return (
    <div>
      <PageTitle title="어디서, 얼마까지 내도 될까?" sub="리포트와 같은 기준으로, 내 가치관에서 자취가 손해가 되지 않는 월세 상한을 계산했어요." />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Card>
          <h2 className="mb-4 font-bold">자취 지역 <span className="ml-1 text-sm font-normal text-muted">{school.name} 주변</span></h2>
          <div className="flex flex-wrap gap-2">
            {school.regions.map((rg) => (
              <Chip key={rg.id} active={state.regionId === rg.id} onClick={() => update({ regionId: rg.id, leaseRent: rg.rentMedian })}>
                {rg.name}
              </Chip>
            ))}
            <Chip dashed active={state.regionId === "custom"} onClick={() => update({ regionId: "custom", leaseRent: state.custom.rentMedian })}>
              직접 입력
            </Chip>
          </div>

          {state.regionId === "custom" && (
            <div className="mt-4 grid gap-3 rounded-2xl bg-field p-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cname">동 이름</Label>
                <TextInput id="cname" className="bg-white" value={state.custom.name} onChange={(e) => setCustom({ name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="cmin">학교까지 편도 (버스·지하철 기준)</Label>
                <NumberInput id="cmin" suffix="분" value={state.custom.oneWayMin} onChange={(v) => setCustom({ oneWayMin: v })} className="[&_input]:bg-white" />
              </div>
              <div>
                <Label htmlFor="crent">원룸 월세 중앙값</Label>
                <NumberInput id="crent" suffix="원" step={10000} value={state.custom.rentMedian} onChange={(v) => update({ custom: { ...state.custom, rentMedian: v }, leaseRent: v })} className="[&_input]:bg-white" />
              </div>
              <div>
                <Label htmlFor="cmgmt">관리비 중앙값</Label>
                <NumberInput id="cmgmt" suffix="원" step={10000} value={state.custom.mgmtMedian} onChange={(v) => setCustom({ mgmtMedian: v })} className="[&_input]:bg-white" />
              </div>
            </div>
          )}

          <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-field">
            <iframe
              key={mapSrc}
              title={`${school.name} 주변 지도`}
              src={mapSrc}
              className="h-64 w-full sm:h-72"
              loading="lazy"
            />
          </div>
          <p className="mt-1.5 text-right text-[11px] text-muted">지도 © OpenStreetMap 기여자 · 마커는 학교 위치</p>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-sub">
            <span>
              학교까지 <b className="text-ink">{region.mode === "도보" ? "도보" : region.id === "custom" ? "대중교통" : region.mode} {region.oneWayMin}분</b>
            </span>
            <span>
              원룸 월세 중앙값 <b className="text-ink">{man(region.rentMedian, 0)}</b> {region.id !== "custom" && "(예시 데이터)"}
            </span>
            <span>
              관리비 중앙값 <b className="text-ink">{man(region.mgmtMedian, 0)}</b> {region.id !== "custom" && "(예시 데이터)"}
            </span>
          </div>
        </Card>

        <Card>
          <h2 className="font-bold">{name ? `${name} 님의 적정 월세 상한` : "나의 적정 월세 상한"}</h2>
          <p className="mt-3 flex items-baseline gap-1.5">
            <span className="text-4xl font-bold tracking-tight text-brand tabular-nums sm:text-5xl">
              {finite ? man(Math.max(0, cap)) : "제한 없음"}
            </span>
            {finite && <span className="text-sm text-muted">/ 월 이하</span>}
          </p>
          <p className="mt-4 rounded-2xl bg-brand-soft p-3.5 text-sm leading-relaxed text-brand-dark">{message}</p>
          {finite && (
            <div className="mt-4">
              <Row label="내 시간·체력 가치 기준 지불 의향" value={man(r.willingness)} />
              <Row label="− 관리비" value={man(costs.mgmt)} />
              <Row label="− 추가 생활비" value={man(costs.living)} />
              <Row label="− 초기 비용 (2년 분할)" value={man(r.initialMonthly)} />
              <Row label="− 보증금 기회비용" value={man(r.depositCost)} />
              <Row label="+ 절약 교통비" value={man(r.savedFare)} />
              <div className="mt-2 border-t border-line pt-2">
                <Row label="월세 상한" value={man(Math.max(0, cap))} strong />
              </div>
            </div>
          )}
          <p className="mt-4 text-xs text-muted">
            리포트에서 조정한 가치관 기준: 돈 {state.pct.money}% · 시간 {state.pct.time}% · 체력 {state.pct.body}%
          </p>
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
