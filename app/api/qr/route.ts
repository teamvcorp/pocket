import QRCode from "qrcode";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL("/", request.url).origin;
  const dataUrl = await QRCode.toDataURL(url, {
    width: 80,
    margin: 1,
    color: { dark: "#243018", light: "#fdf8f0" },
  });
  return NextResponse.json({ dataUrl });
}
