import NextAuth from "next-auth";
import type { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUser } from "./lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await getUser(credentials.email as string);
        if (!user || !user.password) return null;
        const ok = await bcrypt.compare(credentials.password as string, user.password);
        if (!ok) return null;
        return {
          id: user.email,
          email: user.email,
          isPro: user.isPro,
          language: user.language,
          beliefSystem: user.beliefSystem,
        } satisfies User & { isPro: boolean; language: string; beliefSystem: string };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.isPro = user.isPro;
        token.language = user.language;
        token.beliefSystem = user.beliefSystem;
      }
      // Re-fetch from blob when client calls update() (e.g. after Stripe checkout)
      if (trigger === "update" && token.email) {
        const fresh = await getUser(token.email as string);
        if (fresh) {
          token.isPro = fresh.isPro;
          token.language = fresh.language;
          token.beliefSystem = fresh.beliefSystem;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.isPro = token.isPro as boolean;
      session.user.language = token.language as string;
      session.user.beliefSystem = token.beliefSystem as string;
      return session;
    },
  },
});