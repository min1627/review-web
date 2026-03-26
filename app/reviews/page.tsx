"use client";

import { useEffect, useState, useCallback } from "react";
import ReviewFilters, { FilterState } from "@/components/ReviewFilters";
import ReviewComparePanel, { SharedFilterState } from "@/components/ReviewComparePanel";

export default function ReviewsPage() {
  const [filters, setFilters] = useState<FilterState>({
    keyword: "",
    productId: "",
    skinType: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "date",
  });
  const [appliedFilters, setAppliedFilters] = useState<SharedFilterState>({
    keyword: "",
    productId: "",
    skinType: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "date",
  });
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(console.error);
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = useCallback(() => {
    setAppliedFilters({ ...filters });
  }, [filters]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">리뷰 비교</h1>

      <ReviewFilters
        filters={filters}
        products={products}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReviewComparePanel
          title="긍정 리뷰"
          defaultRatings={[4, 5]}
          sharedFilters={appliedFilters}
          accentColor="green"
        />
        <ReviewComparePanel
          title="부정 리뷰"
          defaultRatings={[1, 2]}
          sharedFilters={appliedFilters}
          accentColor="red"
        />
      </div>
    </div>
  );
}
