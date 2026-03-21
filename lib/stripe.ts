import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const PRO_PRICE_ID = "price_1TDPnBFOfT7vP5JsyRS2mKv8"; // Create this in Stripe Dashboard