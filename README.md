# HOME:ET

서울에서 처음 자취를 고민하는 대학생에게 통학 대비 자취의 실제 가치를 수치로 보여 주고, 적정 월세와 계약 D-day까지 안내하는 서비스입니다. (팀 로컬에선 됐는데)

## 흐름

1. **정보 입력**: 학교, 본가, 통학 정보, 등교일, 시급, 생활 목표
2. **자취 적합 리포트**: Gemini가 생활 목표에서 돈·시간·체력 가중치를 뽑고 자취지수(0~100, 50 = 손익분기)를 계산합니다. 슬라이더로 바로 재계산할 수 있습니다.
3. **맞춤 월세 추천**: 자취지수가 50이 되는 월세를 역산해 지역 시세와 비교합니다.
4. **계약 D-day**: 계약일·잔금일을 기준으로 단계별 할 일과 용어 카드를 보여 주고, .ics / Google 캘린더로 내보냅니다.

## 개발

```bash
cp .env.example .env.local   # 키는 선택 사항
npm install
npm run dev
```

| 환경 변수 | 용도 | 없으면 |
| --- | --- | --- |
| `GEMINI_API_KEY` | 가중치 추출 (`/api/weights`) | 키워드 기반 대체 분석 |
| `GEMINI_MODEL` | 모델 교체 (기본 `gemini-3.8-flash`) | 기본값 |
| `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Google 로그인 (Auth.js) | 로그인 버튼 숨김 |

Google OAuth 리디렉션 URI: `http://localhost:3000/api/auth/callback/google`, `https://<배포 도메인>/api/auth/callback/google`

## 구조

- `lib/calc.ts`: 자취지수·월세 상한 산출식과 가정값 (팀 확정 전 초안)
- `lib/data.ts`: 데모 학교·동별 시세 (예시 데이터)
- `lib/dday.ts`: 계약 D-day 규칙, 용어 카드, 캘린더 내보내기
- `lib/weights.ts`, `app/api/weights`: Gemini 가중치 분석 + 대체 분석
- `components/`: 화면 단계별 컴포넌트
