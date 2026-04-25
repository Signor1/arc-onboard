import { NextRequest, NextResponse } from "next/server";
import { client, redactError } from "@/lib/circle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, entitySecret, id } = (await req.json()) as {
      apiKey?: string;
      entitySecret?: string;
      id?: string;
    };
    if (!apiKey || !entitySecret || !id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const sdk = client(apiKey, entitySecret);
    const res = await sdk.getTransaction({ id });
    return NextResponse.json({ transaction: res.data?.transaction });
  } catch (err) {
    return NextResponse.json({ error: redactError(err) }, { status: 500 });
  }
}
