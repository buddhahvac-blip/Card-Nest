import { NextResponse } from "next/server";
import { sql } from "../../lib/db";

export async function GET() {
  try {
    const plans = await sql`
      SELECT name, monthly_price
      FROM subscription_plans
      ORDER BY monthly_price
    `;

    return NextResponse.json({
      ok: true,
      database: "connected",
      plans,
    });
  } catch (error) {
    console.error("CardNest database health check failed:", error);

    return NextResponse.json(
      {
        ok: false,
        database: "connection failed",
      },
      { status: 500 }
    );
  }
}
