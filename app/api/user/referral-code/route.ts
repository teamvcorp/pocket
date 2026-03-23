import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUser, saveUser, generateReferralCode } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await getUser(session.user.email);
  if (!user) {
    return new Response("Not found", { status: 404 });
  }

  // Lazily issue a referral code to users who signed up before this feature existed
  if (!user.referralCode) {
    user.referralCode = generateReferralCode();
    await saveUser(user);
  }

  return NextResponse.json({ referralCode: user.referralCode });
}
