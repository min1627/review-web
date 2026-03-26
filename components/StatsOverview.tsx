"use client";

import { Package, MessageSquare, Star, TrendingUp } from "lucide-react";

interface StatsData {
  productCount: number;
  totalReviews: number;
  avgRating: number;
  todayNewReviews: number;
}

export default function StatsOverview({ stats }: { stats: StatsData }) {
  const cards = [
    {
      label: "수집 상품",
      value: `${stats.productCount.toLocaleString()}개`,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "총 리뷰",
      value: `${stats.totalReviews.toLocaleString()}개`,
      icon: MessageSquare,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "평균 별점",
      value: `${stats.avgRating}점`,
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "오늘 신규 리뷰",
      value: `${stats.todayNewReviews.toLocaleString()}개`,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
