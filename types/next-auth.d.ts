import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      email: string;
      name?: string | null;
      image?: string | null;
      isPro: boolean;
      language: string;
      beliefSystem: string;
    };
  }
  interface User {
    isPro?: boolean;
    language?: string;
    beliefSystem?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isPro?: boolean;
    language?: string;
    beliefSystem?: string;
  }
}
