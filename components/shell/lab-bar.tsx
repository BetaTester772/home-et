"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { VARIANTS, type VariantId } from "@/lib/variants";
import { cx, focusRing } from "@/components/ui/styles";

const noop = () => () => {};

/** 비교용 상단 띠. 허브의 미리보기(iframe) 안에서는 숨김 */
export function LabBar({ current }: { current: VariantId }) {
  const embedded = useSyncExternalStore(noop, () => window.self !== window.top, () => true);
  if (embedded) return null;
  return (
    <div className="bg-fg text-surface">
      <nav className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-1.5 text-xs [scrollbar-width:none] sm:px-6" aria-label="입력 방식 비교">
        <Link href="/" className={cx("mr-1 shrink-0 rounded-full px-2 py-1 font-semibold text-surface/70 hover:text-surface", focusRing)}>
          ← 옵션 비교
        </Link>
        {VARIANTS.map((v) => (
          <Link
            key={v.id}
            href={v.path}
            aria-current={v.id === current ? "page" : undefined}
            className={cx(
              "shrink-0 rounded-full px-2.5 py-1 transition",
              focusRing,
              v.id === current ? "bg-surface font-bold text-fg" : "text-surface/70 hover:text-surface",
            )}
          >
            {v.tag}
          </Link>
        ))}
      </nav>
    </div>
  );
}
