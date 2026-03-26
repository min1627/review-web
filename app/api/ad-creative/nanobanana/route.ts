import { NextRequest, NextResponse } from "next/server";
import { editImage } from "@/lib/gemini-image";

export async function POST(request: NextRequest) {
  try {
    const { image, prompt } = await request.json();

    if (!image || !prompt) {
      return NextResponse.json(
        { error: "image (base64)와 prompt가 필요합니다." },
        { status: 400 }
      );
    }

    const editedImageBase64 = await editImage({
      imageBase64: image,
      prompt,
    });

    return NextResponse.json({
      editedImage: `data:image/png;base64,${editedImageBase64}`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gemini API 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
