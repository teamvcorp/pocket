import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUser } from "./lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await getUser(credentials.email as string);
        if (user) return user as any;
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const fullUser = await getUser(user.email!);
        token.language = fullUser?.language;
        token.beliefSystem = fullUser?.beliefSystem;
        token.isPro = fullUser?.isPro;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.language = token.language as string;
      session.user.beliefSystem = token.beliefSystem as string;
      session.user.isPro = token.isPro as boolean;
      return session;
    },
  },
});