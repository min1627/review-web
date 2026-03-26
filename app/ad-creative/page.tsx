"use client";

import { useCallback, useRef, useState } from "react";
import ImageUploader from "@/components/ad-creative/ImageUploader";
import NanoBananaEditor from "@/components/ad-creative/NanoBananaEditor";
import CanvasPreview from "@/components/ad-creative/CanvasPreview";
import TextOverlayEditor, {
  type TextLayer,
} from "@/components/ad-creative/TextOverlayEditor";
import MetaPublisher from "@/components/ad-creative/MetaPublisher";

export default function AdCreativePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Image state
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageHistory, setImageHistory] = useState<string[]>([]);

  // Text layers
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(-1);

  // Image upload handler
  const handleImageLoad = useCallback((dataUrl: string) => {
    setCurrentImage(dataUrl);
    setImageHistory([dataUrl]);
  }, []);

  // Clear image
  const handleClearImage = useCallback(() => {
    setCurrentImage(null);
    setImageHistory([]);
  }, []);

  // NanoBanana edit complete
  const handleEditComplete = useCallback(
    (editedDataUrl: string) => {
      setCurrentImage(editedDataUrl);
      setImageHistory((prev) => [...prev, editedDataUrl]);
    },
    []
  );

  // Revert to previous version
  const handleRevert = useCallback(
    (index: number) => {
      if (index >= 0 && index < imageHistory.length) {
        setCurrentImage(imageHistory[index]);
        setImageHistory((prev) => prev.slice(0, index + 1));
      }
    },
    [imageHistory]
  );

  // Layer move (from canvas drag or select)
  const handleLayerMove = useCallback(
    (index: number, x: number, y: number) => {
      setSelectedLayerIndex(index);
      setTextLayers((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], x, y };
        return next;
      });
    },
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">광고 소재 생성</h1>
        <p className="text-sm text-gray-500 mt-1">
          이미지를 업로드하고 AI로 편집한 뒤, 카피를 추가하여 1080x1080 소재를 만드세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Image + Editor controls */}
        <div className="space-y-4">
          {/* Image upload */}
          <div className="bg-white rounded-xl border p-4 space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">
              1. 이미지 준비
            </h2>
            <ImageUploader
              onImageLoad={handleImageLoad}
              currentImage={currentImage}
              onClear={handleClearImage}
            />
          </div>

          {/* NanoBanana editor */}
          <div className="bg-white rounded-xl border p-4">
            <NanoBananaEditor
              currentImage={currentImage}
              onEditComplete={handleEditComplete}
              editHistory={imageHistory}
              onRevert={handleRevert}
            />
          </div>

          {/* Text overlay editor */}
          <div className="bg-white rounded-xl border p-4">
            <TextOverlayEditor
              layers={textLayers}
              selectedIndex={selectedLayerIndex}
              onLayersChange={setTextLayers}
              onSelectLayer={setSelectedLayerIndex}
            />
          </div>
        </div>

        {/* Right column: Canvas preview + Export */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4 space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">
              2. 미리보기
            </h2>
            <CanvasPreview
              backgroundImage={currentImage}
              textLayers={textLayers}
              selectedLayerIndex={selectedLayerIndex}
              onLayerMove={handleLayerMove}
              canvasRef={canvasRef}
            />
          </div>

          <div className="bg-white rounded-xl border p-4">
            <MetaPublisher
              canvasRef={canvasRef}
              hasImage={!!currentImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
