"use client";

import Link from "next/link";
import { ThumbsUp, Camera } from "lucide-react";

interface Review {
  id: number;
  product_id: string;
  reviewer_name: string;
  skin_type: string | null;
  skin_tone: string | null;
  rating: number;
  review_date: string;
  review_text: string;
  tags: string[];
  product_option: string | null;
  helpful_count: number;
  photo_urls: string[];
  purchase_type: string | null;
  product_name?: string;
  brand?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-500">
      {"★".repeat(rating)}
      {"☆".repeat(Math.max(0, 5 - rating))}
    </span>
  );
}

export default function ReviewList({
  reviews,
  showProduct = true,
}: {
  reviews: Review[];
  showProduct?: boolean;
}) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-lg border bg-card p-5 hover:shadow-sm transition-shadow"
        >
          {/* 헤더: 별점 + 유저 정보 + 날짜 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <StarRating rating={review.rating} />
              <span className="text-sm font-medium">{review.reviewer_name}</span>
              {review.skin_type && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {review.skin_type}
                </span>
              )}
              {review.skin_tone && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {review.skin_tone}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{review.review_date}</span>
          </div>

          {/* 상품명 (옵셔널) */}
          {showProduct && review.product_name && (
            <Link
              href={`/products/${review.product_id}`}
              className="text-sm text-primary hover:underline mb-1 block"
            >
              [{review.brand}] {review.product_name}
            </Link>
          )}

          {/* 옵션 */}
          {review.product_option && (
            <p className="text-xs text-muted-foreground mb-1">
              옵션: {review.product_option}
            </p>
          )}

          {/* 태그 */}
          {review.tags && review.tags.length > 0 && (
            <div className="flex gap-1 mb-2">
              {review.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 리뷰 본문 */}
          <p className="text-sm text-foreground leading-relaxed mb-3">
            {review.review_text}
          </p>

          {/* 하단: 추천수 + 사진 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-muted-foreground">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">{review.helpful_count}</span>
            </div>
            {review.photo_urls && review.photo_urls.length > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Camera className="w-4 h-4" />
                <span className="text-sm">{review.photo_urls.length}장</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
