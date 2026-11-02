import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// 로그인은 선택 사항: AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET / AUTH_SECRET 이 있을 때만 켜져요.
// 회원 DB 없이 JWT 세션만 씁니다 (MVP).
export const authEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && process.env.AUTH_SECRET,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
});
