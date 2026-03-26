import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  const pool = getPool();

  try {
    // 상품별 통계
    if (productId) {
      const ratingDist = await pool.query(
        `SELECT rating, COUNT(*)::int as count
         FROM reviews WHERE product_id = $1 AND source = 'oliveyoung'
         GROUP BY rating ORDER BY rating DESC`,
        [productId]
      );

      const skinTypeStats = await pool.query(
        `SELECT skin_type, ROUND(AVG(rating), 1)::float as avg_rating, COUNT(*)::int as count
         FROM reviews WHERE product_id = $1 AND source = 'oliveyoung' AND skin_type IS NOT NULL AND skin_type != ''
         GROUP BY skin_type ORDER BY count DESC`,
        [productId]
      );

      const rankingTrend = await pool.query(
        `SELECT crawled_date, rank_position, rating, review_count
         FROM daily_rankings WHERE product_id = $1 AND source = 'oliveyoung'
         ORDER BY crawled_date ASC LIMIT 30`,
        [productId]
      );

      const productInfo = await pool.query(
        `SELECT product_name, brand, rating, review_count, image_url, product_url
         FROM daily_rankings WHERE product_id = $1 AND source = 'oliveyoung'
         ORDER BY crawled_date DESC LIMIT 1`,
        [productId]
      );

      const totalReviews = await pool.query(
        `SELECT COUNT(*)::int as count FROM reviews WHERE product_id = $1 AND source = 'oliveyoung'`,
        [productId]
      );

      return NextResponse.json({
        product: productInfo.rows[0] || null,
        totalReviews: totalReviews.rows[0]?.count || 0,
        ratingDistribution: ratingDist.rows,
        skinTypeStats: skinTypeStats.rows,
        rankingTrend: rankingTrend.rows,
      });
    }

    // 전체 통계
    const productCount = await pool.query(
      `SELECT COUNT(DISTINCT product_id)::int as count FROM daily_rankings WHERE crawled_date = CURRENT_DATE`
    );

    const totalReviews = await pool.query(
      `SELECT COUNT(*)::int as count FROM reviews WHERE source = 'oliveyoung'`
    );

    const avgRating = await pool.query(
      `SELECT ROUND(AVG(rating), 1)::float as avg FROM reviews WHERE source = 'oliveyoung'`
    );

    const todayNewReviews = await pool.query(
      `SELECT COUNT(*)::int as count FROM reviews WHERE crawled_at::date = CURRENT_DATE`
    );

    const categories = await pool.query(
      `SELECT * FROM categories WHERE is_active = true ORDER BY id`
    );

    const availableDates = await pool.query(
      `SELECT DISTINCT crawled_date FROM daily_rankings ORDER BY crawled_date DESC LIMIT 60`
    );

    const products = await pool.query(
      `SELECT DISTINCT ON (product_id) product_id, product_name, brand
       FROM daily_rankings WHERE source = 'oliveyoung'
       ORDER BY product_id, crawled_date DESC`
    );

    return NextResponse.json({
      productCount: productCount.rows[0]?.count || 0,
      totalReviews: totalReviews.rows[0]?.count || 0,
      avgRating: avgRating.rows[0]?.avg || 0,
      todayNewReviews: todayNewReviews.rows[0]?.count || 0,
      categories: categories.rows,
      availableDates: availableDates.rows.map((r: any) => r.crawled_date),
      products: products.rows,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
