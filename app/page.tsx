"use client";

import { useEffect, useState } from "react";
import StatsOverview from "@/components/StatsOverview";
import RankingTable from "@/components/RankingTable";
import DatePicker from "@/components/DatePicker";

interface Stats {
  productCount: number;
  totalReviews: number;
  avgRating: number;
  todayNewReviews: number;
  categories: Array<{ id: number; category_name: string }>;
  availableDates: string[];
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        if (data.availableDates?.length > 0) {
          const latest =
            typeof data.availableDates[0] === "string"
              ? data.availableDates[0]
              : new Date(data.availableDates[0]).toISOString().split("T")[0];
          setSelectedDate(latest);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ date: selectedDate });
    if (selectedCategory) params.set("categoryId", selectedCategory);

    fetch(`/api/rankings?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setRankings(data.rankings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedDate, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">오늘의 랭킹 + 요약</h1>
        <DatePicker
          label="날짜"
          value={selectedDate}
          onChange={setSelectedDate}
          availableDates={stats?.availableDates}
        />
      </div>

      {/* 통계 카드 */}
      {stats && <StatsOverview stats={stats} />}

      {/* 카테고리 선택 */}
      {stats?.categories && stats.categories.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            카테고리:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === ""
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              전체
            </button>
            {stats.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === String(cat.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {cat.category_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 랭킹 테이블 */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          로딩 중...
        </div>
      ) : (
        <RankingTable rankings={rankings} />
      )}
    </div>
  );
}
