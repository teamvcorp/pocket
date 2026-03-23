import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getUser, saveUser } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature")!;

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const user = await getUser(session.customer_email ?? "");
    if (user) {
      user.isPro = true;
      user.stripeCustomerId = session.customer as string;
      if (!user.proSince) user.proSince = new Date().toISOString();
      await saveUser(user);
    }
  }
  return new Response("ok", { status: 200 });
}