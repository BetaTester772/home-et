"use client";

import { schoolPatch, type AppState } from "@/lib/app-state";
import { MIN_WAGE_2026, type Commute } from "@/lib/calc";
import { SCHOOLS } from "@/lib/data";
import { GoalEditor } from "@/components/input/questions";
import {
  Button, Card, CardTitle, Eyebrow, Field, FieldGroupLabel, FinePrint, NumberInput,
  NumberedList, Panel, Select, Stepper, TextInput,
} from "@/components/ui";

const INTRO = [
  "통학 시간과 피로 회복 시간을 돈으로 환산",
  "내 가치관을 반영한 자취지수와 적정 월세",
  "계약금부터 확정일자까지 D-day 안내",
];

export function InputScreen({
  state, update, onSubmit, loading,
}: {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const c = state.commute;
  const setC = (patch: Partial<Commute>) => update({ commute: { ...c, ...patch } });

  const changeSchool = (id: string) => update(schoolPatch(state, id));

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-10">
      <div className="lg:pt-4">
        <Eyebrow>서울 대학생을 위한 첫 자취 판단 도우미</Eyebrow>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-[42px]">
          첫 자취,
          <br />
          해도 될까?
        </h1>
        <p className="mt-6 text-[16px] leading-relaxed text-fg-sub">
          자취 비용은 숫자로 보이지만 통학으로 잃는 시간과 체력은 보이지 않아요. 둘을 같은 기준으로 바꿔서, 지금 통학보다
          자취가 나에게 얼마나 이득인지 보여 드릴게요.
        </p>
        <div className="mt-7">
          <NumberedList items={INTRO} />
        </div>
      </div>

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-6"
        >
          <CardTitle size="lg">내 통학 정보</CardTitle>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="학교" htmlFor="school">
                <Select id="school" value={state.schoolId} onChange={(e) => changeSchool(e.target.value)}>
                  {SCHOOLS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.district})
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="본가 주소" htmlFor="home">
                <TextInput id="home" value={state.home} onChange={(e) => update({ home: e.target.value })} placeholder="예: 경기 남양주시 별내동" />
              </Field>
            </div>

            <Panel>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Field compact label="편도" htmlFor="oneway">
                  <NumberInput id="oneway" tone="inset" size="sm" suffix="분" value={c.oneWayMin} onChange={(v) => setC({ oneWayMin: v })} />
                </Field>
                <Field compact label="환승">
                  <Stepper label="환승" unit="번" min={0} max={6} value={c.transfers} onChange={(v) => setC({ transfers: v })} />
                </Field>
                <Field compact label="배차" htmlFor="headway">
                  <NumberInput id="headway" tone="inset" size="sm" suffix="분" value={c.headwayMin} onChange={(v) => setC({ headwayMin: v })} />
                </Field>
                <Field compact label="왕복 교통비" htmlFor="fare">
                  <NumberInput id="fare" tone="inset" size="sm" suffix="원" step={100} value={c.roundTripFare} onChange={(v) => setC({ roundTripFare: v })} />
                </Field>
              </div>
              <FinePrint className="mt-3">
                길찾기 API 연동 전이라 지금은 직접 입력해요. 배차 간격은 기다리는 여유 시간으로 하루 한 번 반영돼요.
              </FinePrint>
            </Panel>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldGroupLabel>주당 등교일</FieldGroupLabel>
              <Stepper label="주당 등교일" unit="일" min={1} max={7} value={c.daysPerWeek} onChange={(v) => setC({ daysPerWeek: v })} />
            </div>
            <Field label="내 1시간의 기준 시급" htmlFor="wage" hint={`기본값은 2026년 최저임금(${MIN_WAGE_2026.toLocaleString("ko-KR")}원)이에요.`}>
              <NumberInput id="wage" suffix="원" step={10} value={c.hourlyWage} onChange={(v) => setC({ hourlyWage: v })} />
            </Field>
          </div>

          <div>
            <FieldGroupLabel>대학생활에서 얻고 싶은 것</FieldGroupLabel>
            <GoalEditor id="goal" state={state} update={update} />
            <FinePrint className="mt-2">AI가 고른 항목과 글을 읽고 돈·시간·체력 중 무엇을 더 중요하게 여기는지 분석해요.</FinePrint>
          </div>

          <Button type="submit" size="lg" block disabled={loading || c.oneWayMin <= 0}>
            {loading ? "가치관 분석 중…" : "자취 적합 검사 시작"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
