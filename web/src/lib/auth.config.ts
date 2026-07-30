import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 1800 },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role?: string }).role ?? "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Overridden in auth.ts with Credentials
} satisfies NextAuthConfig;
