"use client";

import { Type, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold";
  color: string;
  backgroundColor: string;
  padding: number;
  maxWidth: number;
  textAlign: "left" | "center" | "right";
}

const FONT_FAMILIES = [
  "sans-serif",
  "serif",
  "monospace",
  "'Noto Sans KR', sans-serif",
  "'Nanum Gothic', sans-serif",
];

const PRESET_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF0000",
  "#FF6B00",
  "#FFD700",
  "#00B050",
  "#0066FF",
  "#8B00FF",
];

interface TextOverlayEditorProps {
  layers: TextLayer[];
  selectedIndex: number;
  onLayersChange: (layers: TextLayer[]) => void;
  onSelectLayer: (index: number) => void;
}

export function createDefaultLayer(type: "headline" | "body" | "cta"): TextLayer {
  const id = `layer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  switch (type) {
    case "headline":
      return {
        id,
        text: "헤드라인 텍스트",
        x: 540,
        y: 200,
        fontSize: 64,
        fontFamily: "sans-serif",
        fontWeight: "bold",
        color: "#FFFFFF",
        backgroundColor: "",
        padding: 0,
        maxWidth: 900,
        textAlign: "center",
      };
    case "body":
      return {
        id,
        text: "본문 카피를 입력하세요",
        x: 540,
        y: 540,
        fontSize: 36,
        fontFamily: "sans-serif",
        fontWeight: "normal",
        color: "#FFFFFF",
        backgroundColor: "",
        padding: 0,
        maxWidth: 800,
        textAlign: "center",
      };
    case "cta":
      return {
        id,
        text: "자세히 보기",
        x: 540,
        y: 880,
        fontSize: 32,
        fontFamily: "sans-serif",
        fontWeight: "bold",
        color: "#FFFFFF",
        backgroundColor: "#FF6B00",
        padding: 20,
        maxWidth: 400,
        textAlign: "center",
      };
  }
}

export default function TextOverlayEditor({
  layers,
  selectedIndex,
  onLayersChange,
  onSelectLayer,
}: TextOverlayEditorProps) {
  const selectedLayer = layers[selectedIndex] ?? null;

  function updateLayer(index: number, updates: Partial<TextLayer>) {
    const next = [...layers];
    next[index] = { ...next[index], ...updates };
    onLayersChange(next);
  }

  function removeLayer(index: number) {
    const next = layers.filter((_, i) => i !== index);
    onLayersChange(next);
    if (selectedIndex >= next.length) onSelectLayer(Math.max(0, next.length - 1));
  }

  function moveLayer(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= layers.length) return;
    const next = [...layers];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    onLayersChange(next);
    onSelectLayer(newIndex);
  }

  function addLayer(type: "headline" | "body" | "cta") {
    const newLayer = createDefaultLayer(type);
    onLayersChange([...layers, newLayer]);
    onSelectLayer(layers.length);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Type size={16} />
        텍스트 오버레이
      </h3>

      {/* Add buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => addLayer("headline")}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
        >
          <Plus size={12} /> 헤드라인
        </button>
        <button
          onClick={() => addLayer("body")}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100"
        >
          <Plus size={12} /> 본문
        </button>
        <button
          onClick={() => addLayer("cta")}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100"
        >
          <Plus size={12} /> CTA
        </button>
      </div>

      {/* Layer list */}
      {layers.length > 0 && (
        <div className="space-y-1">
          {layers.map((layer, i) => (
            <div
              key={layer.id}
              onClick={() => onSelectLayer(i)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${
                i === selectedIndex
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <span className="flex-1 truncate">{layer.text || "(빈 텍스트)"}</span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); moveLayer(i, -1); }}
                  className="p-0.5 hover:bg-gray-200 rounded"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveLayer(i, 1); }}
                  className="p-0.5 hover:bg-gray-200 rounded"
                >
                  <ChevronDown size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeLayer(i); }}
                  className="p-0.5 hover:bg-red-100 text-red-500 rounded"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected layer editor */}
      {selectedLayer && (
        <div className="space-y-3 border-t pt-3">
          <div>
            <label className="text-xs text-gray-500">텍스트</label>
            <textarea
              value={selectedLayer.text}
              onChange={(e) => updateLayer(selectedIndex, { text: e.target.value })}
              rows={2}
              className="w-full border rounded p-2 text-sm resize-none mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">크기 (px)</label>
              <input
                type="number"
                value={selectedLayer.fontSize}
                onChange={(e) =>
                  updateLayer(selectedIndex, { fontSize: Number(e.target.value) })
                }
                min={12}
                max={200}
                className="w-full border rounded p-1.5 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">굵기</label>
              <select
                value={selectedLayer.fontWeight}
                onChange={(e) =>
                  updateLayer(selectedIndex, {
                    fontWeight: e.target.value as "normal" | "bold",
                  })
                }
                className="w-full border rounded p-1.5 text-sm mt-1"
              >
                <option value="normal">보통</option>
                <option value="bold">굵게</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">X</label>
              <input
                type="number"
                value={selectedLayer.x}
                onChange={(e) => updateLayer(selectedIndex, { x: Number(e.target.value) })}
                min={0}
                max={1080}
                className="w-full border rounded p-1.5 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Y</label>
              <input
                type="number"
                value={selectedLayer.y}
                onChange={(e) => updateLayer(selectedIndex, { y: Number(e.target.value) })}
                min={0}
                max={1080}
                className="w-full border rounded p-1.5 text-sm mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">최대 너비</label>
            <input
              type="number"
              value={selectedLayer.maxWidth}
              onChange={(e) =>
                updateLayer(selectedIndex, { maxWidth: Number(e.target.value) })
              }
              min={100}
              max={1080}
              className="w-full border rounded p-1.5 text-sm mt-1"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">정렬</label>
            <div className="flex gap-1 mt-1">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => updateLayer(selectedIndex, { textAlign: align })}
                  className={`flex-1 text-xs py-1.5 rounded border ${
                    selectedLayer.textAlign === align
                      ? "bg-blue-50 border-blue-300 text-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {align === "left" ? "왼쪽" : align === "center" ? "가운데" : "오른쪽"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">폰트</label>
            <select
              value={selectedLayer.fontFamily}
              onChange={(e) =>
                updateLayer(selectedIndex, { fontFamily: e.target.value })
              }
              className="w-full border rounded p-1.5 text-sm mt-1"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">글자색</label>
            <div className="flex gap-1.5 mt-1 items-center">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateLayer(selectedIndex, { color: c })}
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedLayer.color === c ? "border-blue-500" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={selectedLayer.color}
                onChange={(e) => updateLayer(selectedIndex, { color: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">
              배경색 (CTA용, 비우면 투명)
            </label>
            <div className="flex gap-1.5 mt-1 items-center">
              <button
                onClick={() => updateLayer(selectedIndex, { backgroundColor: "" })}
                className={`w-6 h-6 rounded-full border-2 text-[8px] ${
                  !selectedLayer.backgroundColor ? "border-blue-500" : "border-gray-200"
                }`}
              >
                &#x2205;
              </button>
              {PRESET_COLORS.slice(0, 6).map((c) => (
                <button
                  key={c}
                  onClick={() => updateLayer(selectedIndex, { backgroundColor: c })}
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedLayer.backgroundColor === c
                      ? "border-blue-500"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={selectedLayer.backgroundColor || "#000000"}
                onChange={(e) =>
                  updateLayer(selectedIndex, { backgroundColor: e.target.value })
                }
                className="w-6 h-6 rounded cursor-pointer"
              />
            </div>
          </div>

          {selectedLayer.backgroundColor && (
            <div>
              <label className="text-xs text-gray-500">배경 패딩 (px)</label>
              <input
                type="number"
                value={selectedLayer.padding}
                onChange={(e) =>
                  updateLayer(selectedIndex, { padding: Number(e.target.value) })
                }
                min={0}
                max={100}
                className="w-full border rounded p-1.5 text-sm mt-1"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
