"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import RatingDistribution from "@/components/RatingDistribution";
import ReviewList from "@/components/ReviewList";
import Pagination from "@/components/Pagination";

interface ProductData {
  product: {
    product_name: string;
    brand: string;
    rating: number;
    review_count: number;
    image_url: string;
  } | null;
  totalReviews: number;
  ratingDistribution: Array<{ rating: number; count: number }>;
  skinTypeStats: Array<{ skin_type: string; avg_rating: number; count: number }>;
  rankingTrend: Array<{
    crawled_date: string;
    rank_position: number;
    rating: number;
    review_count: number;
  }>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [data, setData] = useState<ProductData | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/stats?productId=${productId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}&page=${page}&limit=10`)
      .then((r) => r.json())
      .then((res) => {
        setReviews(res.reviews || []);
        setTotalPages(res.totalPages || 0);
      })
      .catch(console.error);
  }, [productId, page]);

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
    );
  }

  if (!data || !data.product) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        상품 정보를 찾을 수 없습니다.
      </div>
    );
  }

  const { product, ratingDistribution, skinTypeStats, rankingTrend } = data;

  const trendChartData = rankingTrend.map((t) => ({
    date:
      typeof t.crawled_date === "string"
        ? t.crawled_date.slice(5)
        : new Date(t.crawled_date).toISOString().slice(5, 10),
    순위: t.rank_position,
    평점: t.rating,
  }));

  const skinTypeChartData = skinTypeStats.map((s) => ({
    name: s.skin_type,
    평점: s.avg_rating,
    리뷰수: s.count,
  }));

  return (
    <div className="space-y-8">
      {/* 상품 헤더 */}
      <div>
        <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
        <h1 className="text-2xl font-bold">{product.product_name}</h1>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-yellow-500 text-lg">
            {"★".repeat(Math.round(product.rating || 0))} {product.rating}
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">
            리뷰 {data.totalReviews.toLocaleString()}건
          </span>
        </div>
      </div>

      {/* 통계 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 별점 분포 */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">별점 분포</h2>
          <RatingDistribution data={ratingDistribution} />
        </div>

        {/* 피부타입별 평점 */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">피부타입별 평점</h2>
          {skinTypeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={skinTypeChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis dataKey="name" type="category" width={60} />
                <Tooltip />
                <Bar dataKey="평점" fill="hsl(142, 76%, 36%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              피부타입 데이터 없음
            </p>
          )}
        </div>
      </div>

      {/* 랭킹 추이 */}
      {trendChartData.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">랭킹 추이 (최근 30일)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="rank" reversed domain={[1, "auto"]} />
              <YAxis yAxisId="rating" orientation="right" domain={[0, 5]} />
              <Tooltip />
              <Line
                yAxisId="rank"
                type="monotone"
                dataKey="순위"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="rating"
                type="monotone"
                dataKey="평점"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 최근 리뷰 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">최근 리뷰</h2>
        <ReviewList reviews={reviews} showProduct={false} />
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </div>
  );
}
