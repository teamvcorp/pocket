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