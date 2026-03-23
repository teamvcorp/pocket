import { put, list } from "@vercel/blob";

export interface UserProfile {
  email: string;
  password?: string; // bcrypt hash (cost factor 12)
  language: string;
  beliefSystem: string;
  isPro: boolean;
  stripeCustomerId?: string;
  lastQuestionDate?: string;
  dailyCount: number;
  referralCode?: string; // this user's shareable referral code (issued at registration)
  referredBy?: string;   // referral code of whoever referred this user
  proSince?: string;     // ISO date when isPro was first set to true
}

/** Generate a unique 8-character uppercase referral code (no ambiguous chars). */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Fetch every user profile stored in Blob (handles pagination). */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const allBlobs: { url: string }[] = [];
    let hasMore = true;
    let cursor: string | undefined;
    while (hasMore) {
      const result = await list({ prefix: "users/", cursor, limit: 1000 });
      allBlobs.push(...result.blobs);
      hasMore = result.hasMore;
      cursor = result.cursor;
    }
    const users = await Promise.all(
      allBlobs.map(async (blob) => {
        try {
          const res = await fetch(blob.url);
          return (await res.json()) as UserProfile;
        } catch {
          return null;
        }
      })
    );
    return users.filter((u): u is UserProfile => u !== null);
  } catch {
    return [];
  }
}

/** Find a user by their referral code (case-insensitive). */
export async function getUserByReferralCode(code: string): Promise<UserProfile | null> {
  const users = await getAllUsers();
  return users.find((u) => u.referralCode === code.toUpperCase()) ?? null;
}

/** Encode email to a safe, URL-friendly blob path key (no path traversal risk). */
function emailToKey(email: string): string {
  return Buffer.from(email.toLowerCase()).toString("base64url");
}

export async function saveUser(user: UserProfile) {
  const key = emailToKey(user.email);
  await put(`users/${key}.json`, JSON.stringify(user), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function getUser(email: string): Promise<UserProfile | null> {
  try {
    const key = emailToKey(email);
    const { blobs } = await list({ prefix: `users/${key}.json` });
    if (blobs.length === 0) return null;
    const res = await fetch(blobs[0].url);
    return await res.json();
  } catch {
    return null;
  }
}

export async function getCodex(): Promise<string> {
  try {
    const { blobs } = await list({ prefix: "admin/codex.txt" });
    if (blobs.length === 0)
      return "Be compassionate and strictly follow the user's religious texts.";
    const res = await fetch(blobs[0].url);
    return await res.text();
  } catch {
    return "Be compassionate and strictly follow the user's religious texts.";
  }
}