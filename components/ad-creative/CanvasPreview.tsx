"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TextLayer } from "./TextOverlayEditor";

interface CanvasPreviewProps {
  backgroundImage: string | null;
  textLayers: TextLayer[];
  selectedLayerIndex: number;
  onLayerMove: (index: number, x: number, y: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const CANVAS_SIZE = 1080;

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lines.push("");
      continue;
    }
    const words = paragraph.split("");
    let currentLine = "";
    for (const char of words) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }

  return lines;
}

function renderTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  isSelected: boolean
) {
  ctx.save();

  const font = `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
  ctx.font = font;
  ctx.textAlign = layer.textAlign;
  ctx.textBaseline = "top";

  const lines = wrapText(ctx, layer.text, layer.maxWidth);
  const lineHeight = layer.fontSize * 1.3;
  const totalHeight = lines.length * lineHeight;

  // Background
  if (layer.backgroundColor) {
    ctx.fillStyle = layer.backgroundColor;
    let maxLineWidth = 0;
    for (const line of lines) {
      const w = ctx.measureText(line).width;
      if (w > maxLineWidth) maxLineWidth = w;
    }

    const pad = layer.padding;
    let bgX = layer.x - pad;
    if (layer.textAlign === "center") bgX = layer.x - maxLineWidth / 2 - pad;
    else if (layer.textAlign === "right") bgX = layer.x - maxLineWidth - pad;

    const borderRadius = Math.min(pad, 16);
    const bgW = maxLineWidth + pad * 2;
    const bgH = totalHeight + pad * 2;
    const bgY = layer.y - pad;

    ctx.beginPath();
    ctx.roundRect(bgX, bgY, bgW, bgH, borderRadius);
    ctx.fill();
  }

  // Text shadow for readability
  if (!layer.backgroundColor) {
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }

  // Text
  ctx.fillStyle = layer.color;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], layer.x, layer.y + i * lineHeight);
  }

  ctx.shadowColor = "transparent";

  // Selection indicator
  if (isSelected) {
    ctx.strokeStyle = "#3B82F6";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);

    let maxLineWidth = 0;
    for (const line of lines) {
      const w = ctx.measureText(line).width;
      if (w > maxLineWidth) maxLineWidth = w;
    }

    const pad = 8;
    let rx = layer.x - pad;
    if (layer.textAlign === "center") rx = layer.x - maxLineWidth / 2 - pad;
    else if (layer.textAlign === "right") rx = layer.x - maxLineWidth - pad;

    ctx.strokeRect(rx, layer.y - pad, maxLineWidth + pad * 2, totalHeight + pad * 2);
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = canvasW / canvasH;

  let sx = 0,
    sy = 0,
    sw = img.naturalWidth,
    sh = img.naturalHeight;

  if (imgRatio > canvasRatio) {
    sw = img.naturalHeight * canvasRatio;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / canvasRatio;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasW, canvasH);
}

export default function CanvasPreview({
  backgroundImage,
  textLayers,
  selectedLayerIndex,
  onLayerMove,
  canvasRef,
}: CanvasPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ layerX: number; layerY: number; mouseX: number; mouseY: number } | null>(null);

  // Load background image
  useEffect(() => {
    if (!backgroundImage) {
      imgRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      renderAll();
    };
    img.src = backgroundImage;
  }, [backgroundImage]);

  // Re-render on layer changes
  const renderAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // Background
    if (imgRef.current) {
      drawCoverImage(ctx, imgRef.current, CANVAS_SIZE, CANVAS_SIZE);
    } else {
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.fillStyle = "#9ca3af";
      ctx.font = "32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("이미지를 업로드하세요", CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    }

    // Text layers
    for (let i = 0; i < textLayers.length; i++) {
      renderTextLayer(ctx, textLayers[i], i === selectedLayerIndex);
    }
  }, [textLayers, selectedLayerIndex, canvasRef]);

  useEffect(() => {
    renderAll();
  }, [renderAll]);

  // Scale factor for mouse coordinate conversion
  function getScale(): number {
    const canvas = canvasRef.current;
    if (!canvas) return 1;
    const rect = canvas.getBoundingClientRect();
    return CANVAS_SIZE / rect.width;
  }

  function handleMouseDown(e: React.MouseEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = getScale();
    const mx = (e.clientX - rect.left) * scale;
    const my = (e.clientY - rect.top) * scale;

    // Find clicked layer (reverse order for top-most first)
    for (let i = textLayers.length - 1; i >= 0; i--) {
      const layer = textLayers[i];
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.font = `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
      const lines = wrapText(ctx, layer.text, layer.maxWidth);
      const lineHeight = layer.fontSize * 1.3;
      const totalH = lines.length * lineHeight;
      let maxW = 0;
      for (const line of lines) {
        const w = ctx.measureText(line).width;
        if (w > maxW) maxW = w;
      }

      let lx = layer.x;
      if (layer.textAlign === "center") lx = layer.x - maxW / 2;
      else if (layer.textAlign === "right") lx = layer.x - maxW;

      if (mx >= lx - 10 && mx <= lx + maxW + 10 && my >= layer.y - 10 && my <= layer.y + totalH + 10) {
        onLayerMove(i, layer.x, layer.y); // Select
        setIsDragging(true);
        dragStartRef.current = { layerX: layer.x, layerY: layer.y, mouseX: mx, mouseY: my };
        return;
      }
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging || !dragStartRef.current || selectedLayerIndex < 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = getScale();
    const mx = (e.clientX - rect.left) * scale;
    const my = (e.clientY - rect.top) * scale;

    const dx = mx - dragStartRef.current.mouseX;
    const dy = my - dragStartRef.current.mouseY;

    const newX = Math.round(dragStartRef.current.layerX + dx);
    const newY = Math.round(dragStartRef.current.layerY + dy);

    onLayerMove(selectedLayerIndex, newX, newY);
  }

  function handleMouseUp() {
    setIsDragging(false);
    dragStartRef.current = null;
  }

  return (
    <div ref={containerRef} className="relative">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="w-full aspect-square rounded-lg border shadow-sm cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        1080 x 1080
      </div>
    </div>
  );
}
