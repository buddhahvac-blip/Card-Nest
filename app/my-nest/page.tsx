export default function MyNestPage() {
  const rarities = [
    { name: "Common", owned: 0, total: 150 },
    { name: "Uncommon", owned: 0, total: 90 },
    { name: "Rare", owned: 0, total: 60 },
    { name: "Epic", owned: 0, total: 30 },
    { name: "Ultra", owned: 0, total: 19 },
    { name: "Legendary", owned: 0, total: 20 },
  ];

  const families = [
    { name: "Ember", icon: "🔥" },
    { name: "Tide", icon: "💧" },
    { name: "Bloom", icon: "🌿" },
    { name: "Volt", icon: "⚡" },
    { name: "Mystic", icon: "🔮" },
    { name: "Shadow", icon: "🌙" },
  ];

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
              <strong>0</strong>
              <span> / 369 collected</span>
            </div>

            <div className="myNestProgressBar">
              <div className="myNestProgressFill" />
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

          <span className="myNestSeasonBadge">0 / 369</span>
        </div>

        <div className="myNestFamilies">
          {families.map((family) => (
            <button className="myNestFamily" key={family.name}>
              <span>{family.icon}</span>
              <strong>{family.name}</strong>
              <small>View collection</small>
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
          {rarities.map((rarity) => (
            <article
              className={`myNestRarity myNest${rarity.name}`}
              key={rarity.name}
            >
              <span>{rarity.name}</span>

              <strong>
                {rarity.owned} / {rarity.total}
              </strong>

              <div className="myNestMiniBar">
                <div style={{ width: "0%" }} />
              </div>
            </article>
          ))}
        </div>
      </section>

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
    </main>
  );
}
