import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/db";

const COMPANY_CODE = "COMPANY";

export async function GET() {
  try {
    const users = await getAllUsers();

    // Build a map of referralCode → email for referrer lookup
    const codeToEmail = new Map<string, string>();
    for (const u of users) {
      if (u.referralCode) codeToEmail.set(u.referralCode, u.email);
    }

    // Collect only pro users
    const proUsers = users.filter((u) => u.isPro);

    // Group by referredBy, falling back to COMPANY
    const groups = new Map<string, { email: string; proSince?: string }[]>();

    for (const u of proUsers) {
      const key = u.referredBy ?? COMPANY_CODE;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push({ email: u.email, proSince: u.proSince });
    }

    // Ensure COMPANY group always exists (even if empty) so admin always sees it
    if (!groups.has(COMPANY_CODE)) groups.set(COMPANY_CODE, []);

    const result = Array.from(groups.entries()).map(([code, members]) => ({
      referralCode: code,
      referrerEmail: code === COMPANY_CODE ? null : (codeToEmail.get(code) ?? null),
      referrerName:
        code === COMPANY_CODE
          ? "Company"
          : (codeToEmail.get(code)?.split("@")[0] ?? code),
      proUsers: members,
    }));

    // Sort: COMPANY last, others alphabetically by referrerName
    result.sort((a, b) => {
      if (a.referralCode === COMPANY_CODE) return 1;
      if (b.referralCode === COMPANY_CODE) return -1;
      return a.referrerName.localeCompare(b.referrerName);
    });

    // Collect free (non-pro) users
    const freeUsers = users
      .filter((u) => !u.isPro)
      .map((u) => ({ email: u.email, referredBy: u.referredBy ?? null }));

    return NextResponse.json({ groups: result, freeUsers });
  } catch (err) {
    console.error("Admin users error:", err);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
