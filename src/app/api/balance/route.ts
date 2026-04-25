import { NextRequest, NextResponse } from "next/server";
import { client, redactError } from "@/lib/circle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, entitySecret, walletId } = (await req.json()) as {
      apiKey?: string;
      entitySecret?: string;
      walletId?: string;
    };
    if (!apiKey || !entitySecret || !walletId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const sdk = client(apiKey, entitySecret);
    const res = await sdk.getWalletTokenBalance({ id: walletId });
    return NextResponse.json({ tokenBalances: res.data?.tokenBalances ?? [] });
  } catch (err) {
    return NextResponse.json({ error: redactError(err) }, { status: 500 });
  }
}
