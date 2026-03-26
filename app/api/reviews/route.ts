import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "";
  const productId = searchParams.get("productId") || "";
  const rating = searchParams.get("rating") || "";
  const skinType = searchParams.get("skinType") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const sortBy = searchParams.get("sortBy") || "date";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const pool = getPool();

  try {
    const conditions: string[] = ["source = 'oliveyoung'"];
    const params: any[] = [];
    let paramIdx = 1;

    if (keyword) {
      conditions.push(
        `to_tsvector('simple', review_text) @@ plainto_tsquery('simple', $${paramIdx})`
      );
      params.push(keyword);
      paramIdx++;
    }
    if (productId) {
      conditions.push(`product_id = $${paramIdx}`);
      params.push(productId);
      paramIdx++;
    }
    if (rating) {
      const ratings = rating.split(",").map(Number).filter(n => n >= 1 && n <= 5);
      if (ratings.length > 0) {
        conditions.push(`rating = ANY($${paramIdx}::int[])`);
        params.push(ratings);
        paramIdx++;
      }
    }
    if (skinType) {
      conditions.push(`skin_type = $${paramIdx}`);
      params.push(skinType);
      paramIdx++;
    }
    if (dateFrom) {
      conditions.push(`review_date >= $${paramIdx}`);
      params.push(dateFrom);
      paramIdx++;
    }
    if (dateTo) {
      conditions.push(`review_date <= $${paramIdx}`);
      params.push(dateTo);
      paramIdx++;
    }

    const where = `WHERE ${conditions.join(" AND ")}`;
    const orderBy =
      sortBy === "helpful" ? "helpful_count DESC" : "review_date DESC";
    const offset = (page - 1) * limit;

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM reviews ${where}`,
      params
    );
    const total = parseInt(countRes.rows[0].count);

    const dataRes = await pool.query(
      `SELECT r.*,
        (SELECT product_name FROM daily_rankings
         WHERE product_id = r.product_id AND source = r.source
         ORDER BY crawled_date DESC LIMIT 1) as product_name,
        (SELECT brand FROM daily_rankings
         WHERE product_id = r.product_id AND source = r.source
         ORDER BY crawled_date DESC LIMIT 1) as brand
      FROM reviews r
      ${where}
      ORDER BY ${orderBy}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      reviews: dataRes.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Reviews API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
