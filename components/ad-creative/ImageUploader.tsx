"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";

interface ImageUploaderProps {
  onImageLoad: (dataUrl: string) => void;
  currentImage: string | null;
  onClear: () => void;
}

export default function ImageUploader({
  onImageLoad,
  currentImage,
  onClear,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) onImageLoad(result);
      };
      reader.readAsDataURL(file);
    },
    [onImageLoad]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    },
    [handleFile]
  );

  if (currentImage) {
    return (
      <div className="relative group">
        <img
          src={currentImage}
          alt="Uploaded"
          className="w-full aspect-square object-cover rounded-lg border"
        />
        <button
          onClick={onClear}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onPaste={handlePaste}
      onClick={() => fileInputRef.current?.click()}
      tabIndex={0}
    >
      <div className="flex flex-col items-center gap-3">
        {isDragging ? (
          <ImageIcon size={40} className="text-blue-500" />
        ) : (
          <Upload size={40} className="text-gray-400" />
        )}
        <div>
          <p className="font-medium text-gray-700">
            이미지를 드래그하거나 클릭하여 업로드
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Ctrl+V로 클립보드에서 붙여넣기 가능
          </p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
