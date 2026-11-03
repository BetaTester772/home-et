import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shell/header";
import { VARIANTS } from "@/lib/variants";

export const metadata: Metadata = {
  title: "입력 방식 비교 | HOME:ET",
  description: "같은 HOME:ET, 정보 입력 방식만 다른 네 가지 버전을 나란히 비교해요.",
};

/** 임시 비교 허브. 하나로 정하면 이 페이지 자리에 고른 버전을 두면 돼요. */
export default function LabPage() {
  return (
    <main className="flex-1 pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 md:pt-12">
        <Logo />
        <h1 className="mt-6 text-[28px] font-bold leading-tight tracking-tight md:text-4xl">입력 방식 비교</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-fg-sub">
          기능은 같고 <b className="text-fg">① 정보 입력</b> 화면만 다른 네 가지 버전이에요. 리포트·월세·D-day 화면의 모바일 개선(하단 고정 버튼, 단계 막대,
          D-day 펼침)은 모든 버전에 똑같이 들어가 있어요. 버전마다 입력값을 따로 저장해서 서로 섞이지 않아요.
        </p>
      </div>

      {/* 데스크톱: 모바일 화면 크기로 나란히 미리보기 */}
      <section className="mt-10 hidden lg:block" aria-label="모바일 미리보기">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-sm font-semibold text-fg-sub">모바일 미리보기 (375 × 760) · 안에서 직접 눌러 볼 수 있어요</h2>
        </div>
        <div className="mt-4 overflow-x-auto pb-4">
          <div className="mx-auto flex w-max gap-6 px-6">
            {VARIANTS.map((v) => (
              <figure key={v.id} className="shrink-0">
                <div className="overflow-hidden rounded-[2.5rem] border-[10px] border-fg bg-fg">
                  <iframe src={v.path} title={`${v.name} 모바일 미리보기`} width={375} height={760} loading="lazy" className="block rounded-[1.75rem] bg-surface" />
                </div>
                <figcaption className="mt-3 flex items-center justify-between px-2 text-sm">
                  <b>{v.name}</b>
                  <Link href={v.path} className="font-semibold text-primary hover:underline">
                    크게 열기 ↗
                  </Link>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:mt-10" aria-label="버전 설명">
        {VARIANTS.map((v) => (
          <article key={v.id} className="flex flex-col rounded-card border border-border bg-surface p-5 md:p-7">
            <h2 className="text-lg font-bold">{v.name}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-fg-sub">{v.summary}</p>
            <div className="mt-5 grid flex-1 gap-4 sm:grid-cols-2">
              <List title="좋은 점" tone="text-primary" items={v.good} />
              <List title="아쉬운 점" tone="text-accent" items={v.tradeoff} />
            </div>
            <Link
              href={v.path}
              className="mt-6 inline-flex items-center justify-center rounded-control bg-primary px-5 py-3.5 text-[15px] font-semibold text-on-primary transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            >
              {v.tag} 열어 보기
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}

function List({ title, tone, items }: { title: string; tone: string; items: string[] }) {
  return (
    <div>
      <h3 className={`text-sm font-bold ${tone}`}>{title}</h3>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-fg-sub">
        {items.map((t) => (
          <li key={t} className="flex gap-2">
            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-fg-muted" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
