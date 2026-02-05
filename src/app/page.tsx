"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

type Period = "3months" | "4months" | "6months";

const periodLabels: Record<Period, string> = {
  "3months": "3ヶ月後",
  "4months": "4ヶ月後",
  "6months": "6ヶ月後",
};

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("3months");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    before: string;
    after: string;
    period: Period;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setError("");
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const generateImage = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("period", selectedPeriod);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          before: data.before,
          after: data.after,
          period: data.period,
        });
      } else {
        setError(data.error || "エラーが発生しました");
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 結果表示画面
  if (result) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] py-5 px-5">
        <div className="max-w-[430px] mx-auto">
          <div className="bg-white rounded-3xl p-5 shadow-lg mb-5">
            <div className="flex justify-between items-center mb-5">
              <span className="text-lg font-bold">シミュレーション結果</span>
              <span className="px-4 py-2 bg-[var(--accent-light)] rounded-full text-sm font-bold text-[var(--accent-dark)]">
                {periodLabels[result.period]}
              </span>
            </div>
            <div className="flex flex-col gap-5">
              <div className="relative">
                <span className="absolute top-3.5 left-3.5 px-4 py-2 rounded-full text-sm font-bold z-10 bg-gray-500/90 text-white">
                  Before
                </span>
                <img
                  src={result.before}
                  alt="Before"
                  className="w-full rounded-2xl shadow-md"
                />
              </div>
              <div className="relative">
                <span className="absolute top-3.5 left-3.5 px-4 py-2 rounded-full text-sm font-bold z-10 bg-[var(--accent)] text-white">
                  After
                </span>
                <img
                  src={result.after}
                  alt="After"
                  className="w-full rounded-2xl shadow-md"
                />
              </div>
            </div>
          </div>
          <button
            onClick={resetAll}
            className="w-full py-4 border-2 border-gray-200 rounded-xl bg-white text-base font-semibold hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            新しい写真で試す
          </button>
        </div>
      </div>
    );
  }

  // ローディング画面
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center p-12">
          <div className="w-14 h-14 border-4 border-gray-200 border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-5" />
          <p className="text-gray-500 font-medium">AI が未来の姿を予測中...</p>
        </div>
      </div>
    );
  }

  // メイン画面
  return (
    <div className="min-h-screen bg-[#f5f5f5] py-5 px-5">
      <div className="max-w-[430px] mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-7 pt-2">
          <h1 className="text-2xl font-extrabold mb-1.5 tracking-tight">
            Before / <span className="text-[var(--accent)]">After</span>
          </h1>
          <p className="text-sm text-gray-500">あなたの未来の姿をシミュレーション</p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* アップロードエリア */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-12 text-center mb-6 cursor-pointer transition-all bg-white ${
            isDragOver
              ? "border-[var(--accent)] bg-[var(--accent-light)]"
              : selectedFile
              ? "border-[var(--accent)] border-solid p-4"
              : "border-gray-200"
          }`}
        >
          {selectedFile && previewUrl ? (
            <div>
              <img
                src={previewUrl}
                alt="プレビュー"
                className="w-full max-h-80 object-contain rounded-2xl"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetAll();
                }}
                className="mt-3.5 px-6 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-500 text-sm font-semibold hover:bg-gray-200 transition-all"
              >
                写真を変更
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--accent-light)] rounded-full flex items-center justify-center text-3xl">
                📷
              </div>
              <p className="text-base font-semibold mb-2">写真をアップロード</p>
              <p className="text-sm text-gray-400">
                タップして選択 または ドラッグ&ドロップ
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        {/* 期間選択 */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 font-semibold mb-3">
            シミュレーション期間
          </p>
          <div className="flex gap-2.5">
            {(["3months", "4months", "6months"] as Period[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`flex-1 py-4 px-2.5 border-2 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
                  selectedPeriod === period
                    ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent-dark)]"
                    : "border-gray-200 bg-white text-gray-500"
                }`}
              >
                {periodLabels[period]}
              </button>
            ))}
          </div>
        </div>

        {/* 生成ボタン */}
        <button
          onClick={generateImage}
          disabled={!selectedFile}
          className="w-full py-5 rounded-2xl bg-[var(--accent)] text-white text-lg font-bold shadow-lg shadow-[var(--accent)]/40 transition-all hover:bg-[var(--accent-dark)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          未来の姿を見る
        </button>
      </div>
    </div>
  );
}
