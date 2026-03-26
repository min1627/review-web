import { NextRequest, NextResponse } from "next/server";
import { MetaAdsClient } from "@/lib/meta-api";

export async function POST(request: NextRequest) {
  try {
    const token = process.env.META_ACCESS_TOKEN;
    const accountId = process.env.META_AD_ACCOUNT_ID;
    const pageId = process.env.META_PAGE_ID;

    if (!token || !accountId || !pageId) {
      return NextResponse.json(
        { error: "META_ACCESS_TOKEN, META_AD_ACCOUNT_ID, META_PAGE_ID가 모두 필요합니다." },
        { status: 500 }
      );
    }

    const { imageHash, name, message, adsetId, link, callToAction } =
      await request.json();

    if (!imageHash || !name || !message) {
      return NextResponse.json(
        { error: "imageHash, name, message가 필요합니다." },
        { status: 400 }
      );
    }

    const client = new MetaAdsClient(token);

    // 1. Create ad creative
    const creativeId = await client.createCreative(accountId, {
      name: `Creative - ${name}`,
      pageId,
      imageHash,
      message,
      link,
      callToAction,
    });

    // 2. If adsetId provided, create ad under it (PAUSED)
    let adId: string | null = null;
    if (adsetId) {
      adId = await client.createAd(accountId, {
        name: `Ad - ${name}`,
        adsetId,
        creativeId,
        status: "PAUSED",
      });
    }

    return NextResponse.json({ creativeId, adId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "광고 게시 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
