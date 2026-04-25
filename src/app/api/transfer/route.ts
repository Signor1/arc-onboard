import { NextRequest, NextResponse } from "next/server";
import { client, redactError } from "@/lib/circle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const {
      apiKey,
      entitySecret,
      blockchain,
      walletAddress,
      destinationAddress,
      amount,
      tokenAddress,
    } = (await req.json()) as {
      apiKey?: string;
      entitySecret?: string;
      blockchain?: string;
      walletAddress?: string;
      destinationAddress?: string;
      amount?: string;
      tokenAddress?: string;
    };
    if (
      !apiKey ||
      !entitySecret ||
      !blockchain ||
      !walletAddress ||
      !destinationAddress ||
      !amount
    ) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const sdk = client(apiKey, entitySecret);
    const res = await sdk.createTransaction({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      blockchain: blockchain as any,
      walletAddress,
      destinationAddress,
      amount: [amount],
      tokenAddress,
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });
    return NextResponse.json({ transaction: res.data });
  } catch (err) {
    return NextResponse.json({ error: redactError(err) }, { status: 500 });
  }
}
