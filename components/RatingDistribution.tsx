"use client";

interface RatingData {
  rating: number;
  count: number;
}

export default function RatingDistribution({ data }: { data: RatingData[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        별점 데이터 없음
      </div>
    );
  }

  // 5 → 1 순서
  const ratings = [5, 4, 3, 2, 1].map((r) => {
    const found = data.find((d) => d.rating === r);
    return { rating: r, count: found?.count || 0 };
  });

  const maxCount = Math.max(...ratings.map((r) => r.count));

  return (
    <div className="space-y-2">
      {ratings.map(({ rating, count }) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
        return (
          <div key={rating} className="flex items-center gap-3">
            <span className="text-sm text-yellow-500 w-14">
              {"★".repeat(rating)}{" "}
            </span>
            <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-12 text-right">
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
