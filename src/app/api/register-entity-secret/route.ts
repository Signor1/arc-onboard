import { NextRequest, NextResponse } from "next/server";
import { redactError, registerSecret } from "@/lib/circle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, entitySecret } = (await req.json()) as {
      apiKey?: string;
      entitySecret?: string;
    };
    if (!apiKey || !entitySecret) {
      return NextResponse.json(
        { error: "apiKey and entitySecret are required" },
        { status: 400 }
      );
    }
    const result = await registerSecret(apiKey, entitySecret);
    return NextResponse.json({
      ok: true,
      recoveryFile: result.data?.recoveryFile,
    });
  } catch (err) {
    return NextResponse.json({ error: redactError(err) }, { status: 500 });
  }
}
