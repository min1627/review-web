"use client";

import Link from "next/link";

interface RankingItem {
  product_id: string;
  product_name: string;
  brand: string;
  rank_position: number;
  rating: number | null;
  review_count: number | null;
  image_url: string;
  product_url: string;
  prev_rank: number | null;
  category_name?: string;
}

function RankChange({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null || previous === undefined) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }
  const diff = previous - current;
  if (diff > 0) {
    return <span className="text-sm font-medium text-green-600">↑{diff}</span>;
  }
  if (diff < 0) {
    return <span className="text-sm font-medium text-red-600">↓{Math.abs(diff)}</span>;
  }
  return <span className="text-xs text-muted-foreground">-</span>;
}

export default function RankingTable({ rankings }: { rankings: RankingItem[] }) {
  if (rankings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        해당 날짜의 랭킹 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-16">순위</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">상품명</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-28">브랜드</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground w-16">평점</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground w-20">리뷰수</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground w-16">변동</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((item) => (
            <tr key={item.product_id} className="border-b hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {item.rank_position}
                </span>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/products/${item.product_id}`}
                  className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                >
                  {item.product_name || "이름 없음"}
                </Link>
                {item.category_name && (
                  <span className="text-xs text-muted-foreground ml-2">{item.category_name}</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{item.brand}</td>
              <td className="px-4 py-3 text-center">
                {item.rating !== null ? (
                  <span className="text-sm font-medium">
                    <span className="text-yellow-500">★</span> {item.rating}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                {item.review_count?.toLocaleString() || "-"}
              </td>
              <td className="px-4 py-3 text-center">
                <RankChange current={item.rank_position} previous={item.prev_rank} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
