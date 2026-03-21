import QRCode from "qrcode";
import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "https://pocket-jesus.vercel.app";
  const dataUrl = await QRCode.toDataURL(url, {
    width: 80,
    margin: 1,
    color: { dark: "#243018", light: "#fdf8f0" },
  });
  return NextResponse.json({ dataUrl });
}
