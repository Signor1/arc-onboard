import { NextRequest, NextResponse } from "next/server";
import { client, redactError } from "@/lib/circle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const {
      apiKey,
      entitySecret,
      walletSetId,
      blockchain,
      accountType,
      count = 1,
    } = (await req.json()) as {
      apiKey?: string;
      entitySecret?: string;
      walletSetId?: string;
      blockchain?: string;
      accountType?: "EOA" | "SCA";
      count?: number;
    };
    if (!apiKey || !entitySecret || !walletSetId || !blockchain || !accountType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const sdk = client(apiKey, entitySecret);
    const res = await sdk.createWallets({
      walletSetId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      blockchains: [blockchain as any],
      count,
      accountType,
    });
    return NextResponse.json({ wallets: res.data?.wallets });
  } catch (err) {
    return NextResponse.json({ error: redactError(err) }, { status: 500 });
  }
}
