import { auth } from "@/auth";
import { stripe, PRO_PRICE_ID } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
    customer_email: session.user.email,
  });

  return NextResponse.json({ url: checkoutSession.url });
}