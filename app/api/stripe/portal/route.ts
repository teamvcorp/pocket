import { auth } from "@/auth";
import { getUser } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  const origin = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get("host")}`;

  if (!session?.user?.email) {
    return NextResponse.redirect(`${origin}/`);
  }

  const user = await getUser(session.user.email);

  if (!user?.stripeCustomerId) {
    // Free user — no portal to show; send them to the dashboard
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/dashboard`,
    });
    return NextResponse.redirect(portalSession.url);
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.redirect(`${origin}/dashboard`);
  }
}
