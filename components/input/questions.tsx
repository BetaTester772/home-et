"use client";

/**
 * 입력 질문 정의 + 질문별 입력기. 세 가지 입력 방식(A·B·C)이 모두 이걸 공유해요.
 * - hero: 질문 하나를 크게 (한 화면 한 질문, 바텀시트, 쌓이는 폼의 현재 질문)
 * - compact: 작게 (쌓이는 폼에서 이미 답한 칸)
 */
import type { ReactNode } from "react";
import { GOAL_TAGS, goalText, schoolPatch, type AppState } from "@/lib/app-state";
import { MIN_WAGE_2026, hm, won, type Commute } from "@/lib/calc";
import { SCHOOLS, findSchool } from "@/lib/data";
import {
  Chip, Field, HeroNumberInput, HeroTextInput, NumberInput, OptionList,
  QuickChips, Select, Stepper, TextArea, TextInput,
} from "@/components/ui";

/** 주당 등교일 범위 (학회·주말 활동까지 7일) */
export const DAYS_MIN = 1;
export const DAYS_MAX = 7;
/** 환승 횟수 상한 (피로 계수는 4번부터 최대치라 그 이상은 결과가 같음) */
export const TRANSFERS_MAX = 6;

export type QId = "school" | "home" | "oneway" | "transfers" | "headway" | "fare" | "days" | "wage" | "goal";

export interface Question {
  id: QId;
  group: string;
  label: string; // 요약 목록용 짧은 이름
  title: string; // \n 줄바꿈 허용
  sub?: string;
  /** choice = 고르면 끝 (자동으로 다음), input = 입력 후 Enter/다음 */
  kind: "choice" | "input";
  display: (s: AppState) => string;
  valid: (s: AppState) => boolean;
}

const always = () => true;

export const QUESTIONS: Question[] = [
  {
    id: "school", group: "학교 · 집", label: "학교", kind: "choice",
    title: "어느 학교에 다니세요?",
    sub: "학교 주변 원룸 시세를 불러올 때 써요.",
    display: (s) => findSchool(s.schoolId).name, valid: always,
  },
  {
    id: "home", group: "학교 · 집", label: "본가", kind: "input",
    title: "본가는 어디예요?",
    sub: "동 이름까지만 적어도 충분해요.",
    display: (s) => s.home.trim() || "입력 전", valid: (s) => s.home.trim().length > 0,
  },
  {
    id: "oneway", group: "통학 경로", label: "편도 시간", kind: "input",
    title: "본가에서 학교까지\n편도로 얼마나 걸려요?",
    sub: "집을 나서서 강의실에 도착할 때까지요.",
    display: (s) => hm(s.commute.oneWayMin), valid: (s) => s.commute.oneWayMin > 0,
  },
  {
    id: "transfers", group: "통학 경로", label: "환승", kind: "input",
    title: "가는 길에 몇 번 갈아타요?",
    sub: "환승이 많을수록 같은 1시간도 더 지치게 계산해요.",
    display: (s) => (s.commute.transfers === 0 ? "없음" : `${s.commute.transfers}회`), valid: always,
  },
  {
    id: "headway", group: "통학 경로", label: "배차 간격", kind: "input",
    title: "타는 버스·지하철은\n몇 분마다 와요?",
    sub: "놓쳤을 때 기다리는 시간을 하루 한 번 더해요.",
    display: (s) => `${s.commute.headwayMin}분`, valid: always,
  },
  {
    id: "fare", group: "통학 경로", label: "왕복 교통비", kind: "input",
    title: "하루 왕복 교통비는\n얼마예요?",
    sub: "갈 때와 올 때 찍히는 금액을 더해 주세요.",
    display: (s) => won(s.commute.roundTripFare), valid: always,
  },
  {
    id: "days", group: "생활 패턴", label: "주당 등교일", kind: "input",
    title: "일주일에 며칠\n학교에 가요?",
    sub: "학회·동아리로 주말에도 나가면 그 날도 세어 주세요.",
    display: (s) => `주 ${s.commute.daysPerWeek}일`, valid: always,
  },
  {
    id: "wage", group: "생활 패턴", label: "내 1시간의 가치", kind: "input",
    title: "내 1시간은\n얼마짜리일까요?",
    sub: "통학 시간을 돈으로 바꿀 때 기준이에요. 잘 모르겠으면 최저임금 그대로 두세요.",
    display: (s) => won(s.commute.hourlyWage), valid: (s) => s.commute.hourlyWage > 0,
  },
  {
    id: "goal", group: "가치관", label: "대학생활 목표", kind: "input",
    title: "대학생활에서\n얻고 싶은 걸 알려 주세요",
    sub: "해당하는 걸 모두 골라 주세요. AI가 돈·시간·체력 중 무엇을 더 중요하게 여기는지 분석해요.",
    display: (s) => goalSummary(s), valid: (s) => goalText(s).length > 0,
  },
];

export const QUESTION_GROUPS = Array.from(new Set(QUESTIONS.map((q) => q.group))).map((group) => ({
  group,
  items: QUESTIONS.map((q, i) => ({ q, i })).filter(({ q }) => q.group === group),
}));

function goalSummary(s: AppState) {
  const labels: string[] = GOAL_TAGS.filter((t) => s.goalTags.includes(t.id)).map((t) => t.label);
  if (s.goal.trim()) labels.push(labels.length ? "추가 설명" : s.goal.trim());
  return labels.join(", ") || "입력 전";
}

export interface EditorProps {
  q: Question;
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  /** 답을 마쳤을 때 (선택형은 고른 직후, 입력형은 Enter) */
  onDone?: () => void;
  autoFocus?: boolean;
  /** 데스크톱 한 화면 한 질문: 숫자키로 선택 */
  shortcuts?: boolean;
}

/** 질문 하나를 크게 */
export function HeroEditor({ q, state, update, onDone, autoFocus, shortcuts }: EditorProps) {
  const c = state.commute;
  const setC = (patch: Partial<Commute>) => update({ commute: { ...c, ...patch } });
  const id = `hero-${q.id}`;

  switch (q.id) {
    case "school":
      return (
        <OptionList
          label={q.label}
          shortcuts={shortcuts}
          value={state.schoolId}
          options={SCHOOLS.map((s) => ({ value: s.id, label: s.name, sub: s.district }))}
          onSelect={(v) => {
            update(schoolPatch(state, v));
            onDone?.();
          }}
        />
      );
    case "home":
      return (
        <HeroTextInput
          id={id}
          aria-label={q.label}
          autoFocus={autoFocus}
          autoComplete="address-level3"
          placeholder="예: 경기 남양주시 별내동"
          value={state.home}
          onChange={(e) => update({ home: e.target.value })}
          onEnter={q.valid(state) ? onDone : undefined}
        />
      );
    case "oneway":
      return (
        <NumberWithChips
          id={id} label={q.label} autoFocus={autoFocus} onEnter={onDone}
          suffix="분" value={c.oneWayMin} onChange={(v) => setC({ oneWayMin: v })}
          chips={[30, 45, 60, 90, 120].map((v) => ({ value: v, label: hm(v) }))}
          note={c.oneWayMin > 0 ? <>하루 왕복 약 <b className="text-fg">{hm(2 * c.oneWayMin + c.headwayMin)}</b> (기다리는 시간 포함)</> : null}
        />
      );
    case "transfers":
      return (
        <Stepper
          size="hero" label={q.label} unit="번" min={0} max={TRANSFERS_MAX}
          value={c.transfers} onChange={(v) => setC({ transfers: v })} autoFocus={autoFocus} onEnter={onDone}
        />
      );
    case "headway":
      return (
        <NumberWithChips
          id={id} label={q.label} autoFocus={autoFocus} onEnter={onDone}
          suffix="분" value={c.headwayMin} onChange={(v) => setC({ headwayMin: v })}
          chips={[5, 10, 15, 20, 30].map((v) => ({ value: v, label: `${v}분` }))}
        />
      );
    case "fare":
      return (
        <NumberWithChips
          id={id} label={q.label} autoFocus={autoFocus} onEnter={onDone} step={100}
          suffix="원" value={c.roundTripFare} onChange={(v) => setC({ roundTripFare: v })}
          chips={[0, 3_000, 4_500, 6_000].map((v) => ({ value: v, label: v === 0 ? "안 들어요" : won(v) }))}
        />
      );
    case "days":
      return (
        <Stepper
          size="hero" label={q.label} prefix="주" unit="일" min={DAYS_MIN} max={DAYS_MAX}
          value={c.daysPerWeek} onChange={(v) => setC({ daysPerWeek: v })} autoFocus={autoFocus} onEnter={onDone}
        />
      );
    case "wage":
      return (
        <NumberWithChips
          id={id} label={q.label} autoFocus={autoFocus} onEnter={onDone} step={10}
          suffix="원" value={c.hourlyWage} onChange={(v) => setC({ hourlyWage: v })}
          chips={[
            { value: MIN_WAGE_2026, label: "2026 최저임금" },
            { value: 12_000, label: "12,000원" },
            { value: 15_000, label: "15,000원" },
            { value: 20_000, label: "20,000원" },
          ]}
          note={<>시간당 · 알바 시급이나 &lsquo;이 정도면 시간을 팔겠다&rsquo; 싶은 금액</>}
        />
      );
    case "goal":
      return <GoalEditor id={id} state={state} update={update} />;
  }
}

function NumberWithChips<T extends number>({
  id, label, value, onChange, suffix, step, chips, note, autoFocus, onEnter,
}: {
  id: string; label: string; value: number; onChange: (v: number) => void; suffix: string; step?: number;
  chips: { value: T; label: ReactNode }[]; note?: ReactNode; autoFocus?: boolean; onEnter?: () => void;
}) {
  return (
    <div className="space-y-5">
      <HeroNumberInput id={id} aria-label={label} autoFocus={autoFocus} suffix={suffix} step={step} value={value} onChange={onChange} onEnter={onEnter} />
      {note && <p className="-mt-2 text-sm text-fg-sub">{note}</p>}
      <QuickChips label={`${label} 추천값`} items={chips} value={value as T} onSelect={onChange} />
    </div>
  );
}

/** 대학생활 목표: 칩으로 먼저 고르고, 칩에 없는 건 아래 칸에 직접 (칩과 글은 따로 저장) */
export function GoalEditor({ id, state, update, rows = 3 }: { id: string; state: AppState; update: EditorProps["update"]; rows?: number }) {
  const toggle = (tag: AppState["goalTags"][number]) =>
    update({ goalTags: state.goalTags.includes(tag) ? state.goalTags.filter((t) => t !== tag) : [...state.goalTags, tag] });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="대학생활 목표 고르기">
        {GOAL_TAGS.map((t) => (
          <Chip key={t.id} selected={state.goalTags.includes(t.id)} onClick={() => toggle(t.id)}>
            {t.label}
          </Chip>
        ))}
      </div>
      <div>
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-fg">
          추가로 하고 싶은 말 <span className="font-normal text-fg-muted">(선택)</span>
        </label>
        <TextArea
          id={id}
          rows={rows}
          value={state.goal}
          onChange={(e) => update({ goal: e.target.value })}
          placeholder="예: 통학 때문에 동아리를 못 해서 아쉬워요."
        />
      </div>
    </div>
  );
}

/** 작게: 라벨 + 일반 입력 칸 (쌓이는 폼에서 이미 답한 항목) */
export function CompactEditor({ q, state, update }: EditorProps) {
  const c = state.commute;
  const setC = (patch: Partial<Commute>) => update({ commute: { ...c, ...patch } });
  const id = `compact-${q.id}`;

  const body = (() => {
    switch (q.id) {
      case "school":
        return (
          <Select id={id} value={state.schoolId} onChange={(e) => update(schoolPatch(state, e.target.value))}>
            {SCHOOLS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.district})
              </option>
            ))}
          </Select>
        );
      case "home":
        return <TextInput id={id} value={state.home} onChange={(e) => update({ home: e.target.value })} />;
      case "oneway":
        return <NumberInput id={id} suffix="분" value={c.oneWayMin} onChange={(v) => setC({ oneWayMin: v })} />;
      case "transfers":
        return (
          <Stepper label={q.label} unit="번" min={0} max={TRANSFERS_MAX} value={c.transfers} onChange={(v) => setC({ transfers: v })} />
        );
      case "headway":
        return <NumberInput id={id} suffix="분" value={c.headwayMin} onChange={(v) => setC({ headwayMin: v })} />;
      case "fare":
        return <NumberInput id={id} suffix="원" step={100} value={c.roundTripFare} onChange={(v) => setC({ roundTripFare: v })} />;
      case "days":
        return (
          <Stepper label={q.label} unit="일" min={DAYS_MIN} max={DAYS_MAX} value={c.daysPerWeek} onChange={(v) => setC({ daysPerWeek: v })} />
        );
      case "wage":
        return <NumberInput id={id} suffix="원" step={10} value={c.hourlyWage} onChange={(v) => setC({ hourlyWage: v })} />;
      case "goal":
        return <GoalEditor id={id} state={state} update={update} rows={2} />;
    }
  })();

  const isGroup = q.id === "transfers" || q.id === "days" || q.id === "goal";
  return (
    <Field label={q.label} htmlFor={isGroup ? undefined : id}>
      {body}
    </Field>
  );
}
