"use client";

import { useState } from "react";
import { Wand2, Loader2, RotateCcw } from "lucide-react";

interface NanoBananaEditorProps {
  currentImage: string | null;
  onEditComplete: (editedImageDataUrl: string) => void;
  editHistory: string[];
  onRevert: (index: number) => void;
}

const PRESET_PROMPTS = [
  "배경을 부드러운 그라데이션으로 변경",
  "색상 톤을 더 밝고 깨끗하게",
  "제품에 부드러운 그림자 추가",
  "배경을 화이트로 변경",
  "약간 확대하고 중앙 정렬",
  "따뜻한 톤으로 색감 보정",
];

export default function NanoBananaEditor({
  currentImage,
  onEditComplete,
  editHistory,
  onRevert,
}: NanoBananaEditorProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEdit() {
    if (!currentImage || !prompt.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ad-creative/nanobanana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: currentImage, prompt: prompt.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "API 오류");

      // Convert base64 to data URL
      const dataUrl = data.editedImage.startsWith("data:")
        ? data.editedImage
        : `data:image/png;base64,${data.editedImage}`;

      onEditComplete(dataUrl);
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "편집 실패");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Wand2 size={16} />
        AI 이미지 편집
      </h3>

      {!currentImage ? (
        <p className="text-sm text-gray-400">이미지를 먼저 업로드하세요.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="편집 프롬프트를 입력하세요..."
            rows={2}
            className="w-full border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleEdit}
            disabled={isLoading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                편집 중...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                수정하기
              </>
            )}
          </button>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {editHistory.length > 1 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500">편집 히스토리</h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {editHistory.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => onRevert(i)}
                    className="flex-shrink-0 relative group"
                    title={i === 0 ? "원본" : `편집 ${i}`}
                  >
                    <img
                      src={img}
                      alt={`Version ${i}`}
                      className="w-14 h-14 object-cover rounded border hover:border-purple-500 transition-colors"
                    />
                    {i < editHistory.length - 1 && (
                      <div className="absolute inset-0 bg-black/30 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <RotateCcw size={14} className="text-white" />
                      </div>
                    )}
                    <span className="text-[10px] text-gray-400 block text-center">
                      {i === 0 ? "원본" : `v${i}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
