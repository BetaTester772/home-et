// 입력 UX 비교용 버전 목록. 허브(/)와 상단 비교 바가 이 목록을 씀.

export type VariantId = "step" | "stack" | "sheet" | "classic";

export interface Variant {
  id: VariantId;
  path: string;
  tag: string; // 비교 바에 쓰는 짧은 이름
  name: string;
  summary: string;
  good: string[];
  tradeoff: string[];
}

export const VARIANTS: Variant[] = [
  {
    id: "step",
    path: "/step",
    tag: "A 한 질문씩",
    name: "A · 한 화면에 한 질문",
    summary: "질문 하나에만 집중해요. 선택형은 누르면 바로 다음으로 넘어가고, 마지막에 전체를 확인해요.",
    good: ["모바일 한 손 입력이 가장 편해요", "질문마다 설명과 추천값을 넉넉히 보여 줄 수 있어요", "데스크톱은 Enter·숫자키만으로 끝까지 갈 수 있어요"],
    tradeoff: ["항목이 9개라 단계가 길게 느껴질 수 있어요", "전체를 한눈에 보기 어려워 확인 화면으로 보완해요"],
  },
  {
    id: "stack",
    path: "/stack",
    tag: "B 쌓이는 폼",
    name: "B · 답할수록 쌓이는 폼",
    summary: "새 질문이 맨 위에 하나씩 나타나고, 앞에서 답한 칸은 아래에 남아 그 자리에서 바로 고쳐요.",
    good: ["한 페이지라 흐름이 끊기지 않아요", "앞의 답을 고치러 뒤로 갈 필요가 없어요"],
    tradeoff: ["뒤로 갈수록 화면이 길어져요", "질문 순서를 건너뛸 수 없어요"],
  },
  {
    id: "sheet",
    path: "/sheet",
    tag: "C 확인하고 고치기",
    name: "C · 확인하고 고치기",
    summary: "예시 값이 채워진 목록에서 내 상황과 다른 항목만 눌러 고쳐요. 모바일은 바텀시트, 데스크톱은 옆 패널에서 자취지수 미리보기가 바로 바뀌어요.",
    good: ["다시 와서 숫자만 바꿔 보기에 가장 빨라요", "입력하는 동안 결과가 어떻게 변하는지 보여요"],
    tradeoff: ["처음 온 사람이 예시 값을 그대로 넘길 수 있어요"],
  },
  {
    id: "classic",
    path: "/classic",
    tag: "기존",
    name: "기존 · 한 장짜리 폼",
    summary: "지금 버전이에요. 모든 칸이 카드 하나에 모여 있어요. (공통 반응형 개선은 같이 들어가 있어요)",
    good: ["전체 항목을 한눈에 봐요", "데스크톱에서 빠르게 훑기 좋아요"],
    tradeoff: ["모바일에선 작은 칸이 많아 누르기 어려워요", "무엇부터 채울지 안내가 없어요"],
  },
];

export const findVariant = (id: VariantId) => VARIANTS.find((v) => v.id === id)!;
