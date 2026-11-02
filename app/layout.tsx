import type { Metadata } from "next";
import { authEnabled } from "@/auth";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "HOME:ET · 첫 자취, 해도 될까?",
  description: "서울 대학생을 위한 첫 자취 판단 도우미. 통학 시간과 체력을 돈으로 바꿔 자취의 실제 가치를 보여 드려요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers authEnabled={authEnabled}>{children}</Providers>
      </body>
    </html>
  );
}
