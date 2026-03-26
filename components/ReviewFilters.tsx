"use client";

import { Search } from "lucide-react";

export interface FilterState {
  keyword: string;
  productId: string;
  skinType: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
}

interface Product {
  product_id: string;
  product_name: string;
  brand: string;
}

export default function ReviewFilters({
  filters,
  products,
  onFilterChange,
  onSearch,
}: {
  filters: FilterState;
  products: Product[];
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      {/* 키워드 검색 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="키워드 검색..."
            value={filters.keyword}
            onChange={(e) => onFilterChange("keyword", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="w-full pl-10 pr-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={onSearch}
          className="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          검색
        </button>
      </div>

      {/* 필터 행 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 상품 */}
        <select
          value={filters.productId}
          onChange={(e) => onFilterChange("productId", e.target.value)}
          className="px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">전체 상품</option>
          {products.map((p) => (
            <option key={p.product_id} value={p.product_id}>
              {p.product_name?.substring(0, 20) || p.product_id}
            </option>
          ))}
        </select>

        {/* 피부타입 */}
        <select
          value={filters.skinType}
          onChange={(e) => onFilterChange("skinType", e.target.value)}
          className="px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">전체 피부타입</option>
          <option value="지성">지성</option>
          <option value="건성">건성</option>
          <option value="복합성">복합성</option>
          <option value="중성">중성</option>
        </select>

        {/* 기간: 시작 */}
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onFilterChange("dateFrom", e.target.value)}
          className="px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {/* 기간: 끝 */}
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onFilterChange("dateTo", e.target.value)}
          className="px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {/* 정렬 */}
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange("sortBy", e.target.value)}
          className="px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="date">최신순</option>
          <option value="helpful">추천순</option>
        </select>
      </div>
    </div>
  );
}
