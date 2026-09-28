import { NextResponse } from "next/server";

import { sql } from "@/app/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Development owner only for now.
    // We will replace this with the signed-in user's ID
    // when CardNest authentication is added.
    const ownerId = "development-test-user";

    const ownedCards = await sql`
      SELECT
        c.id AS card_id,
        c.card_number,
        c.name,
        c.nest_family,
        c.rarity,
        c.description,
        c.artwork_url,
        c.max_supply,
        e.id AS edition_id,
        e.edition_number,
        o.acquired_via,
        o.acquired_at,
        s.season_number,
        s.name AS season_name
      FROM cardnest_ownership o
      JOIN cardnest_editions e
        ON e.id = o.edition_id
      JOIN cardnest_cards c
        ON c.id = e.card_id
      JOIN cardnest_seasons s
        ON s.id = c.season_id
      WHERE o.owner_id = ${ownerId}
        AND o.is_current_owner = TRUE
        AND s.season_number = 1
      ORDER BY c.card_number ASC, e.edition_number ASC
    `;

    const rarityProgress = await sql`
      SELECT
        c.rarity,
        COUNT(DISTINCT c.card_number)::int AS collected
      FROM cardnest_ownership o
      JOIN cardnest_editions e
        ON e.id = o.edition_id
      JOIN cardnest_cards c
        ON c.id = e.card_id
      JOIN cardnest_seasons s
        ON s.id = c.season_id
      WHERE o.owner_id = ${ownerId}
        AND o.is_current_owner = TRUE
        AND s.season_number = 1
      GROUP BY c.rarity
    `;

    const familyProgress = await sql`
      SELECT
        c.nest_family,
        COUNT(DISTINCT c.card_number)::int AS collected
      FROM cardnest_ownership o
      JOIN cardnest_editions e
        ON e.id = o.edition_id
      JOIN cardnest_cards c
        ON c.id = e.card_id
      JOIN cardnest_seasons s
        ON s.id = c.season_id
      WHERE o.owner_id = ${ownerId}
        AND o.is_current_owner = TRUE
        AND s.season_number = 1
      GROUP BY c.nest_family
    `;

    const uniqueCards = new Set(
      ownedCards.map((card: any) => Number(card.card_number))
    );

    return NextResponse.json({
      ok: true,
      season: {
        number: 1,
        name: "Season 1 — Build Your Nest",
        collected: uniqueCards.size,
        total: 369,
      },
      rarityProgress,
      familyProgress,
      cards: ownedCards,
    });
  } catch (error) {
    console.error("My Nest API error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load My Nest collection.",
      },
      { status: 500 }
    );
  }
}
