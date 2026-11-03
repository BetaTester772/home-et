import type { Metadata } from "next";
import { HomeEtApp } from "@/components/home-et-app";
import { findVariant } from "@/lib/variants";

const v = findVariant("classic");
export const metadata: Metadata = { title: `${v.name} | HOME:ET`, description: v.summary };

export default function Page() {
  return <HomeEtApp variant="classic" />;
}
