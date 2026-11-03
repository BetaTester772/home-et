import type { Metadata, Viewport } from "next";
import { authEnabled } from "@/auth";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "HOME:ET · 첫 자취, 해도 될까?",
  description: "서울 대학생을 위한 첫 자취 판단 도우미. 통학 시간과 체력을 돈으로 바꿔 자취의 실제 가치를 보여 드려요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // 하단 고정 버튼이 홈 인디케이터 영역(safe-area)을 피하도록
  interactiveWidget: "resizes-content", // Android: 키보드가 뜨면 레이아웃이 줄어 하단 버튼이 키보드 위에 붙음
  themeColor: "#ffffff",
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
      <body className="min-h-dvh flex flex-col">
        <Providers authEnabled={authEnabled}>{children}</Providers>
      </body>
    </html>
  );
}
