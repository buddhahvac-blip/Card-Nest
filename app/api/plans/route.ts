import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";

export async function GET() {
  try {
    const plans = await sql`
      SELECT
        id,
        name,
        monthly_price,
        inventory_contribution_percent
      FROM subscription_plans
      ORDER BY monthly_price ASC
    `;

    return NextResponse.json({
      ok: true,
      plans,
    });
  } catch (error) {
    console.error("CardNest plans API error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load membership plans.",
      },
      { status: 500 }
    );
  }
}
