import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const PRO_PRICE_ID = "price_1TDPoLFOfT7vP5JsnkEmT8Fh"; // Create this in Stripe Dashboard