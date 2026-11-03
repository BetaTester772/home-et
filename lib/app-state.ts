import {
  DEFAULT_COSTS, DEFAULT_WEIGHTS, MIN_WAGE_2026, toPercents,
  type Commute, type LivingCosts, type Percents,
} from "./calc";
import { SCHOOLS, findSchool, type Region } from "./data";
import type { WeightAnalysis } from "./weights";

export type StepNo = 1 | 2 | 3 | 4;

export interface AppState {
  step: StepNo;
  schoolId: string;
  home: string;
  commute: Commute;
  goal: string;
  analysis: WeightAnalysis | null;
  pct: Percents;
  costs: LivingCosts; // 리포트(①)에서 쓰는 가정값. rent/mgmt = 학교 주변 기본 시세
  regionId: string; // 지역 id 또는 "custom"
  custom: Region;
  contract: string; // YYYY-MM-DD
  balance: string;
  leaseDeposit: number;
  leaseRent: number;
  decision: "stay" | null;
}

const firstSchool = SCHOOLS[0];
const firstRegion = firstSchool.regions[0];

export const INITIAL: AppState = {
  step: 1,
  schoolId: firstSchool.id,
  home: "경기 남양주시 별내동",
  commute: {
    oneWayMin: 85,
    transfers: 2,
    headwayMin: 15,
    roundTripFare: 4_500,
    daysPerWeek: 4,
    hourlyWage: MIN_WAGE_2026,
  },
  goal: "학점 관리를 제대로 하고 싶고, 통학 때문에 동아리를 못 해서 아쉬워요. 그래도 부모님께 부담은 덜 드리고 싶어요.",
  analysis: null,
  pct: toPercents(DEFAULT_WEIGHTS),
  costs: { ...DEFAULT_COSTS, rent: firstRegion.rentMedian, mgmt: firstRegion.mgmtMedian },
  regionId: firstRegion.id,
  custom: {
    id: "custom", name: "직접 입력", mode: "버스", oneWayMin: 20,
    rentMedian: 500_000, mgmtMedian: 60_000, lat: firstSchool.lat, lng: firstSchool.lng,
  },
  contract: "",
  balance: "",
  leaseDeposit: DEFAULT_COSTS.deposit,
  leaseRent: firstRegion.rentMedian,
  decision: null,
};

export function selectedRegion(s: AppState): Region {
  if (s.regionId === "custom") return s.custom;
  const school = findSchool(s.schoolId);
  return school.regions.find((r) => r.id === s.regionId) ?? school.regions[0];
}

/** 자취 지역에서 학교까지 버스·지하철이면 왕복 요금이 생김 (서울 기본요금 기준 가정) */
export const regionFare = (r: Region) => (r.mode === "도보" ? 0 : 3_000);

/** 학교를 바꾸면 그 학교 첫 동네 시세로 기본값을 맞춘다 */
export function schoolPatch(s: AppState, id: string): Partial<AppState> {
  const school = findSchool(id);
  const r0 = school.regions[0];
  return {
    schoolId: school.id,
    regionId: r0.id,
    costs: { ...s.costs, rent: r0.rentMedian, mgmt: r0.mgmtMedian },
    custom: { ...s.custom, lat: school.lat, lng: school.lng },
    leaseRent: r0.rentMedian,
  };
}

export const STORAGE_KEY = "home-et:v1";
export function loadState(key = STORAGE_KEY): AppState | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...INITIAL, ...parsed, commute: { ...INITIAL.commute, ...parsed.commute }, costs: { ...INITIAL.costs, ...parsed.costs } };
  } catch {
    return null;
  }
}
export function saveState(s: AppState, key = STORAGE_KEY) {
  try {
    localStorage.setItem(key, JSON.stringify(s));
  } catch {
    /* 저장소를 못 쓰는 환경이면 그냥 넘어감 */
  }
}
