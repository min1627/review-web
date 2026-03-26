import { NextRequest, NextResponse } from "next/server";
import { MetaAdsClient } from "@/lib/meta-api";

export async function POST(request: NextRequest) {
  try {
    const token = process.env.META_ACCESS_TOKEN;
    const accountId = process.env.META_AD_ACCOUNT_ID;

    if (!token || !accountId) {
      return NextResponse.json(
        { error: "META_ACCESS_TOKEN 또는 META_AD_ACCOUNT_ID가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const { imageBase64 } = await request.json();
    if (!imageBase64) {
      return NextResponse.json(
        { error: "imageBase64가 필요합니다." },
        { status: 400 }
      );
    }

    // Strip data URL prefix if present
    const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64, "base64");

    const client = new MetaAdsClient(token);
    const imageHash = await client.uploadImage(accountId, imageBuffer);

    return NextResponse.json({ imageHash });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "이미지 업로드 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
