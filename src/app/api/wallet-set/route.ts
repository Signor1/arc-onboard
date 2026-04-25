import { NextRequest, NextResponse } from "next/server";
import { client, redactError } from "@/lib/circle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, entitySecret, name } = (await req.json()) as {
      apiKey?: string;
      entitySecret?: string;
      name?: string;
    };
    if (!apiKey || !entitySecret || !name) {
      return NextResponse.json(
        { error: "apiKey, entitySecret, and name are required" },
        { status: 400 }
      );
    }
    const sdk = client(apiKey, entitySecret);
    const res = await sdk.createWalletSet({ name });
    return NextResponse.json({ walletSet: res.data?.walletSet });
  } catch (err) {
    return NextResponse.json({ error: redactError(err) }, { status: 500 });
  }
}
