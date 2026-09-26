type CollectionCard = {
  card_id: number;
  card_number: number;
  name: string;
  nest_family: string;
  rarity: string;
  description: string | null;
  artwork_url: string | null;
  max_supply: number | null;
  edition_id: number;
  edition_number: number;
  acquired_via: string;
};

type ProgressRow = {
  rarity?: string;
  nest_family?: string;
  collected: number;
};

type MyNestData = {
  ok: boolean;
  season: {
    number: number;
    name: string;
    collected: number;
    total: number;
  };
  rarityProgress: ProgressRow[];
  familyProgress: ProgressRow[];
  cards: CollectionCard[];
};

const rarityTotals: Record<string, number> = {
  common: 150,
  uncommon: 90,
  rare: 60,
  epic: 30,
  ultra: 19,
  legendary: 20,
};

const families = [
  { name: "Ember", key: "ember", icon: "🔥" },
  { name: "Tide", key: "tide", icon: "💧" },
  { name: "Bloom", key: "bloom", icon: "🌿" },
  { name: "Volt", key: "volt", icon: "⚡" },
  { name: "Mystic", key: "mystic", icon: "🔮" },
  { name: "Shadow", key: "shadow", icon: "🌙" },
];

async function getCollection(): Promise<MyNestData> {
  const baseUrl =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/my-nest`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load My Nest.");
  }

  return response.json();
}

export default async function MyNestPage() {
  const data = await getCollection();

  const getRarityCount = (rarity: string) => {
    const row = data.rarityProgress.find(
      (item) => item.rarity?.toLowerCase() === rarity.toLowerCase()
    );

    return Number(row?.collected ?? 0);
  };

  const getFamilyCount = (family: string) => {
    const row = data.familyProgress.find(
      (item) => item.nest_family?.toLowerCase() === family.toLowerCase()
    );

    return Number(row?.collected ?? 0);
  };

  const progressPercent =
    data.season.total > 0
      ? (data.season.collected / data.season.total) * 100
      : 0;

  return (
    <main className="myNestPage">
      <section className="myNestHero">
        <div className="myNestHeroContent">
          <span className="myNestEyebrow">CARDNEST COLLECTION</span>

          <h1>My Nest</h1>

          <p>
            Build your collection, discover rare guardians, and complete
            Season 1.
          </p>

          <div className="myNestProgress">
            <div>
              <strong>{data.season.collected}</strong>
              <span> / {data.season.total} collected</span>
            </div>

            <div className="myNestProgressBar">
              <div
                className="myNestProgressFill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="myNestCrown">🪺</div>
      </section>

      <section className="myNestSection">
        <div className="myNestSectionHeading">
          <div>
            <span className="myNestEyebrow">SEASON 1</span>
            <h2>Build Your Nest</h2>
          </div>

          <span className="myNestSeasonBadge">
            {data.season.collected} / {data.season.total}
          </span>
        </div>

        <div className="myNestFamilies">
          {families.map((family) => (
            <button className="myNestFamily" key={family.key}>
              <span>{family.icon}</span>
              <strong>{family.name}</strong>
              <small>{getFamilyCount(family.key)} discovered</small>
            </button>
          ))}
        </div>
      </section>

      <section className="myNestSection">
        <div className="myNestSectionHeading">
          <div>
            <span className="myNestEyebrow">YOUR PROGRESS</span>
            <h2>Rarity Collection</h2>
          </div>
        </div>

        <div className="myNestRarityGrid">
          {Object.entries(rarityTotals).map(([rarity, total]) => {
            const collected = getRarityCount(rarity);
            const percent = total > 0 ? (collected / total) * 100 : 0;

            return (
              <article
                className={`myNestRarity myNest${
                  rarity.charAt(0).toUpperCase() + rarity.slice(1)
                }`}
                key={rarity}
              >
                <span>{rarity}</span>

                <strong>
                  {collected} / {total}
                </strong>

                <div className="myNestMiniBar">
                  <div style={{ width: `${percent}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {data.cards.length === 0 ? (
        <section className="myNestEmpty">
          <div className="myNestEmptyIcon">✨</div>

          <h2>Your Nest is waiting.</h2>

          <p>
            Open your first CardNest pack and your discovered guardians will
            appear here.
          </p>

          <a href="/marketplace" className="myNestOpenButton">
            Explore CardNest
          </a>
        </section>
      ) : (
        <section className="myNestSection">
          <div className="myNestSectionHeading">
            <div>
              <span className="myNestEyebrow">DISCOVERED</span>
              <h2>Your Guardians</h2>
            </div>
          </div>

          <div className="myNestRarityGrid">
            {data.cards.map((card) => (
              <article className="myNestRarity" key={card.edition_id}>
                <span>
                  #{String(card.card_number).padStart(3, "0")} · {card.rarity}
                </span>

                <strong>{card.name}</strong>

                <p>
                  Edition #{card.edition_number}
                  {card.max_supply ? ` / ${card.max_supply}` : ""}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
