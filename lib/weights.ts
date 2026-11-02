import { DEFAULT_WEIGHTS, normalizeWeights, type Weights } from "./calc";

export interface WeightAnalysis extends Weights {
  reason: string;
  source: "gemini" | "keyword" | "default";
}

// Gemini를 못 쓸 때(키 없음·실패) 쓰는 키워드 기반 대체 분석
const KEYWORDS: Record<keyof Weights, string[]> = {
  money: ["돈", "부모", "부담", "아끼", "절약", "용돈", "비용", "저축", "생활비", "빚", "대출", "월세"],
  time: ["공부", "학점", "시험", "동아리", "시간", "알바", "취업", "인턴", "준비", "자격증", "프로젝트", "대외활동", "자기계발"],
  body: ["체력", "피곤", "피로", "힘들", "휴식", "잠", "수면", "건강", "지치", "운동", "멀미", "녹초"],
};
const LABEL: Record<keyof Weights, string> = { money: "돈", time: "시간", body: "체력" };

export function keywordWeights(goal: string): WeightAnalysis {
  const text = goal.trim();
  if (!text) return { ...DEFAULT_WEIGHTS, reason: "생활 목표가 비어 있어 세 기준을 똑같이 두었어요.", source: "default" };

  const hits: Record<keyof Weights, string[]> = { money: [], time: [], body: [] };
  (Object.keys(KEYWORDS) as (keyof Weights)[]).forEach((k) => {
    for (const word of KEYWORDS[k]) if (text.includes(word)) hits[k].push(word);
  });
  const total = hits.money.length + hits.time.length + hits.body.length;
  if (total === 0) return { ...DEFAULT_WEIGHTS, reason: "뚜렷한 우선순위를 찾지 못해 세 기준을 똑같이 두었어요.", source: "default" };

  const w = normalizeWeights({
    money: 1 + 2 * hits.money.length,
    time: 1 + 2 * hits.time.length,
    body: 1 + 2 * hits.body.length,
  });
  const reason = (Object.keys(hits) as (keyof Weights)[])
    .filter((k) => hits[k].length)
    .map((k) => `${hits[k].map((h) => `“${h}”`).join(", ")} → ${LABEL[k]}`)
    .join(", ");
  return { ...w, reason: `키워드 분석: ${reason}`, source: "keyword" };
}
