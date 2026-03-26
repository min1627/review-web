"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import RankingComparison from "@/components/RankingComparison";
import DatePicker from "@/components/DatePicker";

interface Stats {
  categories: Array<{ id: number; category_name: string }>;
  availableDates: string[];
}

export default function RankingsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 최근 7일 랭킹 추이 데이터
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        const dates = (data.availableDates || []).map((d: any) =>
          typeof d === "string" ? d : new Date(d).toISOString().split("T")[0]
        );
        if (dates.length >= 2) {
          setDate2(dates[0]);
          setDate1(dates[1]);
        } else if (dates.length === 1) {
          setDate2(dates[0]);
          setDate1(dates[0]);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!date1 || !date2) return;
    setLoading(true);
    const params = new URLSearchParams({ date: date1, date2 });
    if (categoryId) params.set("categoryId", categoryId);

    fetch(`/api/rankings?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setRankings(data.rankings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [date1, date2, categoryId]);

  // 추이 데이터: 최근 7일 날짜에 대해 top 5 상품의 순위 변동
  useEffect(() => {
    if (!stats?.availableDates || stats.availableDates.length < 2) return;

    const dates = stats.availableDates
      .slice(0, 7)
      .map((d: any) =>
        typeof d === "string" ? d : new Date(d).toISOString().split("T")[0]
      )
      .reverse();

    Promise.all(
      dates.map((d) => {
        const params = new URLSearchParams({ date: d });
        if (categoryId) params.set("categoryId", categoryId);
        return fetch(`/api/rankings?${params}`).then((r) => r.json());
      })
    ).then((results) => {
      // 가장 최근 날짜의 top 5 상품 추적
      const latestRankings = results[results.length - 1]?.rankings || [];
      const topProducts = latestRankings.slice(0, 5);

      const trend = dates.map((date, idx) => {
        const dayRankings = results[idx]?.rankings || [];
        const point: any = { date: date.slice(5) };

        topProducts.forEach((p: any) => {
          const found = dayRankings.find(
            (r: any) => r.product_id === p.product_id
          );
          point[p.product_name?.substring(0, 15) || p.product_id] =
            found?.rank_position || null;
        });

        return point;
      });

      setTrendData(trend);
    });
  }, [stats, categoryId]);

  const availableDates = (stats?.availableDates || []).map((d: any) =>
    typeof d === "string" ? d : new Date(d).toISOString().split("T")[0]
  );

  const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">랭킹 비교</h1>

      {/* 필터 */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-wrap items-center gap-4">
          {stats?.categories && stats.categories.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                카테고리:
              </span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="px-3 py-2 rounded-md border bg-background text-sm"
              >
                <option value="">전체</option>
                {stats.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <DatePicker
            label="기준일"
            value={date1}
            onChange={setDate1}
            availableDates={availableDates}
          />
          <span className="text-muted-foreground">vs</span>
          <DatePicker
            label="비교일"
            value={date2}
            onChange={setDate2}
            availableDates={availableDates}
          />
        </div>
      </div>

      {/* 비교 테이블 */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          로딩 중...
        </div>
      ) : (
        <RankingComparison rankings={rankings} date1={date1} date2={date2} />
      )}

      {/* 순위 변동 추이 차트 */}
      {trendData.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">순위 변동 추이 (최근 7일)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis reversed domain={[1, "auto"]} />
              <Tooltip />
              <Legend />
              {Object.keys(trendData[0] || {})
                .filter((k) => k !== "date")
                .map((key, i) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[i % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
