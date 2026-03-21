import { put, list, del } from "@vercel/blob";

export interface UserProfile {
  email: string;
  password?: string; // In a real app, hash this!
  language: string;
  beliefSystem: string;
  isPro: boolean;
  stripeCustomerId?: string;
  lastQuestionDate?: string;
  dailyCount: number;
}

export async function saveUser(user: UserProfile) {
  await put(`users/${user.email}.json`, JSON.stringify(user), {
    access: "public",
    addRandomSuffix: false,
  });
}

export async function getUser(email: string): Promise<UserProfile | null> {
  try {
    const { blobs } = await list({ prefix: `users/${email}.json` });
    if (blobs.length === 0) return null;
    const res = await fetch(blobs[0].url);
    return await res.json();
  } catch {
    return null;
  }
}

export async function getCodex(): Promise<string> {
  try {
    const { blobs } = await list({ prefix: 'admin/codex.txt' });
    if (blobs.length === 0) return "Be compassionate and strictly follow user's religious texts.";
    const res = await fetch(blobs[0].url);
    return await res.text();
  } catch {
    return "Default Codex";
  }
}