import { NextRequest, NextResponse } from "next/server";
import { lookupPincode } from "@/lib/geo/geoData";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get("pincode")?.trim() || "";

  if (!/^[1-9]\d{5}$/.test(pincode)) {
    return NextResponse.json(
      { ok: false, reason: "invalid" },
      { status: 400 }
    );
  }

  const geo = lookupPincode(pincode);
  if (!geo) {
    return NextResponse.json(
      { ok: false, reason: "notCovered" },
      {
        status: 200,
        headers: { "Cache-Control": "public, max-age=86400" },
      }
    );
  }

  return NextResponse.json(
    { ok: true, ...geo },
    {
      status: 200,
      headers: { "Cache-Control": "public, max-age=86400" },
    }
  );
}
