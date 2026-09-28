import Link from "next/link";
import { sql } from "@/app/lib/db";

type Plan = {
  id: string;
  name: string;
  monthly_price: string;
  inventory_contribution_percent: string;
};

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const plans = (await sql`
    SELECT
      id,
      name,
      monthly_price,
      inventory_contribution_percent
    FROM subscription_plans
    ORDER BY monthly_price ASC
  `) as Plan[];

  return (
    <main className="rewardsPage">
      <section className="rewardsHero">
        <div className="rewardsEyebrow">CARDNEST MEMBERSHIP</div>

        <h1>
          Collect more.
          <br />
          <span>Earn more.</span>
        </h1>

        <p>
          Choose your place in the Nest. Membership helps unlock CardNest
          rewards and supports inventory growth across the marketplace.
        </p>

        <Link href="/marketplace" className="rewardsBack">
          ← Explore marketplace
        </Link>
      </section>

      <section className="plansSection">
        <div className="plansHeading">
          <div>
            <span className="plansLabel">CHOOSE YOUR NEST</span>
            <h2>Membership plans</h2>
          </div>

          <p>Simple monthly memberships designed for every collector.</p>
        </div>

        <div className="plansGrid">
          {plans.map((plan, index) => {
            const golden = plan.name === "Golden Nest";

            return (
              <article
                key={plan.id}
                className={`planCard ${golden ? "planCardFeatured" : ""}`}
              >
                {golden && <div className="popularBadge">MOST POPULAR ✨</div>}

                <div className="planIcon">
                  {index === 0 ? "🐣" : index === 1 ? "🪺" : "👑"}
                </div>

                <h3>{plan.name}</h3>

                <div className="planPrice">
                  <span>$</span>
                  {Number(plan.monthly_price).toFixed(2)}
                  <small>/ month</small>
                </div>

                <div className="planDivider" />

                <ul>
                  <li>✓ CardNest member rewards</li>
                  <li>✓ Collector marketplace benefits</li>
                  <li>✓ Member-only promotions</li>
                  <li>
                    ✓ {plan.inventory_contribution_percent}% inventory
                    contribution
                  </li>
                </ul>

                <button className="planButton">
                  Choose {plan.name}
                </button>

                <p className="planFinePrint">
                  Cancel anytime. Additional membership terms may apply.
                </p>
              </article>
            );
          })}
        </div>

        <div className="rewardsNotice">
          <span>🛡️</span>
          <div>
            <strong>Built for collectors</strong>
            <p>
              CardNest membership pricing is loaded directly from our secure
              production database.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
