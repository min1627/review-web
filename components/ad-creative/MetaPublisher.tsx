"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, Download, CheckCircle, AlertCircle } from "lucide-react";

interface MetaPublisherProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  hasImage: boolean;
}

interface AdAccount {
  id: string;
  name: string;
  currency: string;
}

export default function MetaPublisher({ canvasRef, hasImage }: MetaPublisherProps) {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [creativeName, setCreativeName] = useState("");
  const [adMessage, setAdMessage] = useState("");
  const [adLink, setAdLink] = useState("");
  const [adsetId, setAdsetId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    setLoadingAccounts(true);
    try {
      const res = await fetch("/api/ad-creative/meta/accounts");
      const data = await res.json();
      if (data.accounts) setAccounts(data.accounts);
    } catch {
      // Meta token not configured yet
    }
    setLoadingAccounts(false);
  }

  async function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `ad-creative-${Date.now()}.png`;
    a.click();
  }

  async function handlePublish() {
    if (!creativeName || !adMessage) {
      setResult({ type: "error", message: "소재명과 광고 문구를 입력하세요." });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsPublishing(true);
    setResult(null);

    try {
      // 1. Get canvas as base64
      const dataUrl = canvas.toDataURL("image/png");

      // 2. Upload image to Meta
      setIsUploading(true);
      const uploadRes = await fetch("/api/ad-creative/meta/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: dataUrl }),
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);
      setIsUploading(false);

      // 3. Create creative (and optionally ad)
      const publishRes = await fetch("/api/ad-creative/meta/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageHash: uploadData.imageHash,
          name: creativeName,
          message: adMessage,
          link: adLink || undefined,
          adsetId: adsetId || undefined,
          callToAction: adLink ? "LEARN_MORE" : undefined,
        }),
      });
      const publishData = await publishRes.json();
      if (!publishRes.ok) throw new Error(publishData.error);

      setResult({
        type: "success",
        message: `게시 완료! Creative ID: ${publishData.creativeId}${
          publishData.adId ? `, Ad ID: ${publishData.adId}` : ""
        }`,
      });
    } catch (err) {
      setResult({
        type: "error",
        message: err instanceof Error ? err.message : "게시 실패",
      });
    } finally {
      setIsPublishing(false);
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Send size={16} />
        내보내기 & Meta 게시
      </h3>

      {/* Download */}
      <button
        onClick={handleDownload}
        disabled={!hasImage}
        className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download size={16} />
        PNG 다운로드 (1080x1080)
      </button>

      {/* Meta publish */}
      <div className="space-y-3 bg-blue-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-800">Meta 광고 게시</h4>

        {loadingAccounts ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={14} className="animate-spin" />
            계정 불러오는 중...
          </div>
        ) : accounts.length > 0 ? (
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full border rounded p-2 text-sm"
          >
            <option value="">광고 계정 선택</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.id}) — {acc.currency}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-xs text-gray-500">
            META_ACCESS_TOKEN을 .env.local에 설정하면 광고 계정이 표시됩니다.
          </p>
        )}

        <input
          type="text"
          value={creativeName}
          onChange={(e) => setCreativeName(e.target.value)}
          placeholder="소재명 (예: dalba_ctr_test_01)"
          className="w-full border rounded p-2 text-sm"
        />
        <textarea
          value={adMessage}
          onChange={(e) => setAdMessage(e.target.value)}
          placeholder="광고 문구 (Primary text)"
          rows={2}
          className="w-full border rounded p-2 text-sm resize-none"
        />
        <input
          type="text"
          value={adLink}
          onChange={(e) => setAdLink(e.target.value)}
          placeholder="랜딩 URL (선택)"
          className="w-full border rounded p-2 text-sm"
        />
        <input
          type="text"
          value={adsetId}
          onChange={(e) => setAdsetId(e.target.value)}
          placeholder="Ad Set ID (선택, 입력하면 광고도 생성)"
          className="w-full border rounded p-2 text-sm"
        />

        <button
          onClick={handlePublish}
          disabled={!hasImage || isPublishing || !creativeName || !adMessage}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {isUploading ? "이미지 업로드 중..." : "크리에이티브 생성 중..."}
            </>
          ) : (
            <>
              <Send size={16} />
              Meta 게시 (PAUSED 상태)
            </>
          )}
        </button>

        {result && (
          <div
            className={`flex items-start gap-2 text-sm p-2 rounded ${
              result.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {result.type === "success" ? (
              <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            )}
            <span className="break-all">{result.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
