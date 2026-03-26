"use client";

import Link from "next/link";

interface ComparisonItem {
  product_id: string;
  product_name: string;
  brand: string;
  rank_date1: number | null;
  rank_date2: number | null;
  rating_date1: number | null;
  rating_date2: number | null;
  image_url: string;
  product_url: string;
}

function getChangeInfo(rank1: number | null, rank2: number | null) {
  if (rank1 === null && rank2 !== null) {
    return { label: "NEW", className: "bg-blue-100 text-blue-700", icon: "🆕" };
  }
  if (rank1 !== null && rank2 === null) {
    return { label: "OUT", className: "bg-gray-100 text-gray-700", icon: "⚪" };
  }
  if (rank1 === null || rank2 === null) {
    return { label: "-", className: "", icon: "⚪" };
  }
  const diff = rank1 - rank2;
  if (diff > 0) {
    return { label: `↑${diff}`, className: "text-green-600 font-medium", icon: "🟢" };
  }
  if (diff < 0) {
    return { label: `↓${Math.abs(diff)}`, className: "text-red-600 font-medium", icon: "🔴" };
  }
  return { label: "-", className: "text-muted-foreground", icon: "⚪" };
}

export default function RankingComparison({
  rankings,
  date1,
  date2,
}: {
  rankings: ComparisonItem[];
  date1: string;
  date2: string;
}) {
  if (rankings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        비교할 데이터가 없습니다.
      </div>
    );
  }

  const d1Label = date1.slice(5);
  const d2Label = date2.slice(5);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground w-12"></th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">상품명</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground w-24">
              {d1Label} 순위
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground w-24">
              {d2Label} 순위
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground w-20">
              변동
            </th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((item) => {
            const change = getChangeInfo(item.rank_date1, item.rank_date2);
            return (
              <tr key={item.product_id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-center">{change.icon}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/products/${item.product_id}`}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {item.product_name}
                  </Link>
                  <span className="text-xs text-muted-foreground ml-2">{item.brand}</span>
                </td>
                <td className="px-4 py-3 text-center text-sm">
                  {item.rank_date1 !== null ? item.rank_date1 : "-"}
                </td>
                <td className="px-4 py-3 text-center text-sm">
                  {item.rank_date2 !== null ? item.rank_date2 : "-"}
                </td>
                <td className={`px-4 py-3 text-center text-sm ${change.className}`}>
                  {change.label}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
