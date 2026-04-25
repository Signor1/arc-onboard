import { NextResponse } from "next/server";
import { getMode } from "@/lib/mode";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ mode: getMode() });
}
