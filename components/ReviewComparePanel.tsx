"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import ReviewList from "@/components/ReviewList";
import RatingMultiSelect from "@/components/RatingMultiSelect";
import Pagination from "@/components/Pagination";

export interface SharedFilterState {
  keyword: string;
  productId: string;
  skinType: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
}

interface ReviewComparePanelProps {
  title: string;
  defaultRatings: number[];
  sharedFilters: SharedFilterState;
  accentColor: "green" | "red";
}

export default function ReviewComparePanel({
  title,
  defaultRatings,
  sharedFilters,
  accentColor,
}: ReviewComparePanelProps) {
  const [selectedRatings, setSelectedRatings] = useState<number[]>(defaultRatings);
  const [reviews, setReviews] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const prevFiltersRef = useRef(sharedFilters);
  const prevRatingsRef = useRef(selectedRatings);

  const fetchReviews = useCallback(
    (pageNum: number) => {
      if (selectedRatings.length === 0) {
        setReviews([]);
        setTotal(0);
        setTotalPages(0);
        return;
      }

      setLoading(true);
      const params = new URLSearchParams({ page: String(pageNum), limit: "10" });
      params.set("rating", selectedRatings.join(","));
      if (sharedFilters.keyword) params.set("keyword", sharedFilters.keyword);
      if (sharedFilters.productId) params.set("productId", sharedFilters.productId);
      if (sharedFilters.skinType) params.set("skinType", sharedFilters.skinType);
      if (sharedFilters.dateFrom) params.set("dateFrom", sharedFilters.dateFrom);
      if (sharedFilters.dateTo) params.set("dateTo", sharedFilters.dateTo);
      if (sharedFilters.sortBy) params.set("sortBy", sharedFilters.sortBy);

      fetch(`/api/reviews?${params}`)
        .then((r) => r.json())
        .then((data) => {
          setReviews(data.reviews || []);
          setTotal(data.total || 0);
          setPage(data.page || 1);
          setTotalPages(data.totalPages || 0);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    },
    [selectedRatings, sharedFilters]
  );

  // Reset to page 1 when filters or ratings change
  useEffect(() => {
    const filtersChanged = prevFiltersRef.current !== sharedFilters;
    const ratingsChanged = prevRatingsRef.current !== selectedRatings;

    if (filtersChanged || ratingsChanged) {
      prevFiltersRef.current = sharedFilters;
      prevRatingsRef.current = selectedRatings;
      setPage(1);
      fetchReviews(1);
    }
  }, [sharedFilters, selectedRatings, fetchReviews]);

  // Initial fetch
  useEffect(() => {
    fetchReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchReviews(newPage);
  };

  const borderColor = accentColor === "green" ? "border-l-green-500" : "border-l-red-500";

  return (
    <div className={`rounded-lg border bg-card border-l-4 ${borderColor}`}>
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <span className="text-sm text-muted-foreground">
            {total.toLocaleString()}건
          </span>
        </div>
        <RatingMultiSelect selected={selectedRatings} onChange={setSelectedRatings} />
      </div>

      <div className="p-4">
        {selectedRatings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            별점을 선택해주세요
          </div>
        ) : loading ? (
          <div className="text-center py-12 text-muted-foreground">
            로딩 중...
          </div>
        ) : (
          <>
            <ReviewList reviews={reviews} />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
