import { NextResponse } from "next/server";
import { MetaAdsClient } from "@/lib/meta-api";

export async function GET() {
  try {
    const token = process.env.META_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "META_ACCESS_TOKEN이 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const client = new MetaAdsClient(token);
    const accounts = await client.getAdAccounts();

    return NextResponse.json({ accounts });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Meta API 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
