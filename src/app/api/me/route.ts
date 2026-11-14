import { NextResponse } from "next/server";
import { getGuest } from "@/lib/guest";
import { snapshot } from "@/lib/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await snapshot(await getGuest()));
}
