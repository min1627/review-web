import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const date2 = searchParams.get("date2");
  const categoryId = searchParams.get("categoryId");

  const pool = getPool();

  try {
    // 비교 모드
    if (date2) {
      const catFilter = categoryId ? "AND category_id = $3" : "";
      const params: any[] = [date, date2];
      if (categoryId) params.push(parseInt(categoryId));

      const catFilterD2 = categoryId
        ? `AND category_id = $${categoryId ? "4" : "3"}`
        : "";
      if (categoryId) params.push(parseInt(categoryId));

      const result = await pool.query(
        `SELECT
          COALESCE(d1.product_id, d2.product_id) as product_id,
          COALESCE(d1.product_name, d2.product_name) as product_name,
          COALESCE(d1.brand, d2.brand) as brand,
          d1.rank_position as rank_date1,
          d2.rank_position as rank_date2,
          d1.rating as rating_date1,
          d2.rating as rating_date2,
          d1.review_count as reviews_date1,
          d2.review_count as reviews_date2,
          COALESCE(d2.product_url, d1.product_url) as product_url,
          COALESCE(d2.image_url, d1.image_url) as image_url
        FROM
          (SELECT * FROM daily_rankings WHERE crawled_date = $1 ${catFilter}) d1
        FULL OUTER JOIN
          (SELECT * FROM daily_rankings WHERE crawled_date = $2 ${catFilterD2}) d2
        ON d1.product_id = d2.product_id AND d1.source = d2.source
        ORDER BY COALESCE(d2.rank_position, 999), COALESCE(d1.rank_position, 999)`,
        params
      );
      return NextResponse.json({ rankings: result.rows, date1: date, date2 });
    }

    // 단일 날짜 랭킹
    const catFilter = categoryId ? "AND dr.category_id = $2" : "";
    const params: any[] = [date];
    if (categoryId) params.push(parseInt(categoryId));

    const result = await pool.query(
      `SELECT dr.*, c.category_name,
        (SELECT rank_position FROM daily_rankings
         WHERE product_id = dr.product_id AND source = dr.source
         AND crawled_date = (dr.crawled_date - INTERVAL '1 day')::date
         LIMIT 1) as prev_rank
      FROM daily_rankings dr
      LEFT JOIN categories c ON dr.category_id = c.id
      WHERE dr.crawled_date = $1 ${catFilter}
      ORDER BY dr.rank_position ASC`,
      params
    );

    return NextResponse.json({ rankings: result.rows, date });
  } catch (error) {
    console.error("Rankings API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
