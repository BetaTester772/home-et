"use client";

import { MIN_WAGE_2026, type Commute } from "@/lib/calc";
import { SCHOOLS } from "@/lib/data";
import { Button, Card, Label, NumberInput, TextInput, cx, fieldClass } from "./ui";
import type { AppState } from "./state";

export function InputStep({
  state, update, onSubmit, loading,
}: {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const c = state.commute;
  const setC = (patch: Partial<Commute>) => update({ commute: { ...c, ...patch } });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-10">
      <div className="lg:pt-4">
        <p className="text-sm font-semibold text-accent">서울 대학생을 위한 첫 자취 판단 도우미</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-[42px]">
          첫 자취,
          <br />
          해도 될까?
        </h1>
        <p className="mt-6 text-[16px] leading-relaxed text-sub">
          자취 비용은 숫자로 보이지만 통학으로 잃는 시간과 체력은 보이지 않아요. 둘을 같은 기준으로 바꿔서, 지금 통학보다
          자취가 나에게 얼마나 이득인지 보여 드릴게요.
        </p>
        <ol className="mt-7 space-y-3 text-[15px] text-ink">
          {["통학 시간과 피로 회복 시간을 돈으로 환산", "내 가치관을 반영한 자취지수와 적정 월세", "계약금부터 확정일자까지 D-day 안내"].map(
            (t, i) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-xs font-bold text-brand">
                  {i + 1}
                </span>
                {t}
              </li>
            ),
          )}
        </ol>
      </div>

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <h2 className="mb-6 text-lg font-bold">내 통학 정보</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="school">학교</Label>
              <select
                id="school"
                value={state.schoolId}
                onChange={(e) => {
                  const school = SCHOOLS.find((s) => s.id === e.target.value)!;
                  const r0 = school.regions[0];
                  update({
                    schoolId: school.id,
                    regionId: r0.id,
                    costs: { ...state.costs, rent: r0.rentMedian, mgmt: r0.mgmtMedian },
                    custom: { ...state.custom, lat: school.lat, lng: school.lng },
                    leaseRent: r0.rentMedian,
                  });
                }}
                className={cx(fieldClass, "appearance-none")}
              >
                {SCHOOLS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.district})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="home">본가 주소</Label>
              <TextInput id="home" value={state.home} onChange={(e) => update({ home: e.target.value })} placeholder="예: 경기 남양주시 별내동" />
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-field p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniField label="편도" suffix="분" value={c.oneWayMin} onChange={(v) => setC({ oneWayMin: v })} />
              <MiniField label="환승" suffix="회" value={c.transfers} onChange={(v) => setC({ transfers: v })} />
              <MiniField label="배차" suffix="분" value={c.headwayMin} onChange={(v) => setC({ headwayMin: v })} />
              <MiniField label="왕복 교통비" suffix="원" step={100} value={c.roundTripFare} onChange={(v) => setC({ roundTripFare: v })} />
            </div>
            <p className="mt-3 text-xs text-muted">길찾기 API 연동 전이라 지금은 직접 입력해요. 배차 간격은 기다리는 여유 시간으로 하루 한 번 반영돼요.</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>주당 등교일</Label>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="주당 등교일">
                {[3, 4, 5].map((d) => (
                  <button
                    key={d}
                    type="button"
                    role="radio"
                    aria-checked={c.daysPerWeek === d}
                    onClick={() => setC({ daysPerWeek: d })}
                    className={cx(
                      "rounded-xl py-3 text-[15px] transition",
                      c.daysPerWeek === d ? "bg-brand font-bold text-white" : "border border-line bg-white text-sub hover:bg-field",
                    )}
                  >
                    {d}일
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="wage">내 1시간의 기준 시급</Label>
              <NumberInput id="wage" suffix="원" step={10} value={c.hourlyWage} onChange={(v) => setC({ hourlyWage: v })} />
              <p className="mt-2 text-xs text-muted">
                기본값은 2026년 최저임금({MIN_WAGE_2026.toLocaleString("ko-KR")}원)이에요.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="goal">대학생활에서 얻고 싶은 것</Label>
            <textarea
              id="goal"
              rows={4}
              value={state.goal}
              onChange={(e) => update({ goal: e.target.value })}
              placeholder="예: 학점 관리를 제대로 하고 싶어요. 알바도 해야 해서 체력이 걱정돼요."
              className={cx(fieldClass, "resize-y leading-relaxed")}
            />
            <p className="mt-2 text-xs text-muted">AI가 이 글을 읽고 돈·시간·체력 중 무엇을 더 중요하게 여기는지 분석해요.</p>
          </div>

          <Button type="submit" className="mt-6 w-full py-4" disabled={loading || c.oneWayMin <= 0}>
            {loading ? "가치관 분석 중…" : "자취 적합 검사 시작"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function MiniField({
  label, suffix, value, onChange, step,
}: { label: string; suffix: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-sub">{label}</span>
      <NumberInput value={value} onChange={onChange} suffix={suffix} step={step} className="[&_input]:bg-white [&_input]:py-2.5" />
    </label>
  );
}
