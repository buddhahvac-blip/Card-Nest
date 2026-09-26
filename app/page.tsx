import Link from "next/link";

const categories = [
  { icon: "✨", name: "All Cards", className: "all" },
  { icon: "🔥", name: "Fire", className: "fire" },
  { icon: "💧", name: "Water", className: "water" },
  { icon: "🌿", name: "Nature", className: "nature" },
  { icon: "⚡", name: "Electric", className: "electric" },
  { icon: "🔮", name: "Psychic", className: "psychic" },
  { icon: "🌙", name: "Dark", className: "dark" },
];

const cards = [
  {
    name: "Emberwing",
    type: "Fire",
    price: "$95+",
    icon: "🔥",
    creature: "🐉",
    description: "Collector classic",
    className: "fire",
  },
  {
    name: "Tidefin",
    type: "Water",
    price: "$42+",
    icon: "💧",
    creature: "🐬",
    description: "Ocean rare",
    className: "water",
  },
  {
    name: "Bloomtail",
    type: "Nature",
    price: "$28+",
    icon: "🌸",
    creature: "🦊",
    description: "Cute & collectible",
    className: "nature",
  },
  {
    name: "Voltbeak",
    type: "Electric",
    price: "$38+",
    icon: "⚡",
    creature: "🦅",
    description: "Charged collectible",
    className: "electric",
  },
  {
    name: "Mindfeather",
    type: "Psychic",
    price: "$62+",
    icon: "🔮",
    creature: "🦉",
    description: "Mystic rare",
    className: "psychic",
  },
  {
    name: "Shadowclaw",
    type: "Dark",
    price: "$48+",
    icon: "🌙",
    creature: "🐺",
    description: "Night collector",
    className: "dark",
  },
];

const benefits = [
  { icon: "🛡️", title: "Secure Transactions", text: "Built for safer collecting" },
  { icon: "🤝", title: "Trusted Community", text: "Collectors helping collectors" },
  { icon: "📦", title: "Fast & Safe Shipping", text: "Protect every delivery" },
  { icon: "🎁", title: "Earn Rewards", text: "Get more from the Nest" },
];

const memberships = [
  {
    badge: "🥚",
    name: "Nestling",
    price: "$4.99",
    contribution: "40%",
    className: "nestling",
  },
  {
    badge: "🪺",
    name: "Collector",
    price: "$9.99",
    contribution: "45%",
    className: "collector",
  },
  {
    badge: "👑",
    name: "Golden Nest",
    price: "$19.99",
    contribution: "50%",
    className: "golden",
  },
];

export default function Home() {
  return (
    <main className="cnHome">
      <nav className="cnNav">
        <Link className="cnBrand" href="/">
          <span className="cnBrandMark">🪺</span>
          <span>
            Card<strong>Nest</strong>
          </span>
        </Link>

        <div className="cnNavLinks">
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/sell">Sell</Link>
          <Link href="/rewards">Rewards</Link>
        </div>

        <Link className="cnNavButton" href="/marketplace">
          Explore Cards
        </Link>
      </nav>

      <section className="cnHero">
        <div className="cnHeroGlow cnGlowOne" />
        <div className="cnHeroGlow cnGlowTwo" />

        <div className="cnHeroContent">
          <p className="cnEyebrow">WELCOME TO THE NEST</p>

          <h1>
            Collect.
            <br />
            Trade. <span>Discover.</span>
          </h1>

          <p className="cnHeroText">
            Your home for collectible cards. Discover new favorites, build your
            collection, sell securely and earn rewards along the way.
          </p>

          <div className="cnHeroButtons">
            <Link className="cnPrimary" href="/marketplace">
              Explore Cards →
            </Link>

            <Link className="cnSecondary" href="/sell">
              Start Selling
            </Link>
          </div>

          <div className="cnHeroTrust">
            <span>🛡️ Protected checkout</span>
            <span>✨ Collector focused</span>
            <span>💎 Transparent pricing</span>
          </div>
        </div>

        <div className="cnHeroArt" aria-label="CardNest mascot artwork">
          <div className="cnFloatingCard cnCardOne">
            <span>🔥</span>
            <strong>EMBER</strong>
          </div>

          <div className="cnFloatingCard cnCardTwo">
            <span>💧</span>
            <strong>TIDE</strong>
          </div>

          <div className="cnFloatingCard cnCardThree">
            <span>⚡</span>
            <strong>VOLT</strong>
          </div>

          <div className="cnMagicSpark cnSparkOne">✦</div>
          <div className="cnMagicSpark cnSparkTwo">✧</div>
          <div className="cnMagicSpark cnSparkThree">✦</div>

          <div className="cnMascot">
            <div className="cnCrown">♛</div>
            <div className="cnOwlHead">
              <span className="cnOwlEye">●</span>
              <span className="cnOwlBeak">◆</span>
              <span className="cnOwlEye">●</span>
            </div>
            <div className="cnOwlBody">🪽</div>
          </div>

          <div className="cnEggs">
            <span>🥚</span>
            <span>🥚</span>
            <span>🥚</span>
          </div>

          <div className="cnNest">🪹</div>

          <div className="cnHeroBadge">
            <small>THE COLLECTOR&apos;S HOME</small>
            <strong>CardNest</strong>
          </div>
        </div>
      </section>

      <section className="cnBenefits">
        {benefits.map((benefit) => (
          <div className="cnBenefit" key={benefit.title}>
            <span>{benefit.icon}</span>
            <div>
              <strong>{benefit.title}</strong>
              <small>{benefit.text}</small>
            </div>
          </div>
        ))}
      </section>

      <section className="cnSection cnCategories">
        <div className="cnSectionHeading">
          <div>
            <p className="cnEyebrow">FIND YOUR ELEMENT</p>
            <h2>Explore the Nest</h2>
          </div>

          <Link href="/marketplace">View Marketplace →</Link>
        </div>

        <div className="cnCategoryGrid">
          {categories.map((category) => (
            <Link
              href="/marketplace"
              className={`cnCategory ${category.className}`}
              key={category.name}
            >
              <span>{category.icon}</span>
              <strong>{category.name}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="cnSection cnTrending">
        <div className="cnSectionHeading">
          <div>
            <p className="cnEyebrow">DISCOVER</p>
            <h2>Trending in the Nest</h2>
          </div>

          <Link href="/marketplace">See all cards →</Link>
        </div>

        <div className="cnCardGrid">
          {cards.map((card) => (
            <article className="cnListing" key={card.name}>
              <div className={`cnCardArtwork ${card.className}`}>
                <button
                  className="cnHeart"
                  aria-label={`Favorite ${card.name}`}
                >
                  ♡
                </button>

                <div className="cnTradingCard">
                  <div className="cnTradingTop">
                    <small>CARDNEST</small>
                    <span>{card.icon}</span>
                  </div>

                  <div className="cnCreature">{card.creature}</div>

                  <strong>{card.name}</strong>
                  <small>{card.type} • Rare</small>
                </div>
              </div>

              <div className="cnListingInfo">
                <div>
                  <p>{card.description}</p>
                  <h3>{card.name}</h3>
                </div>

                <strong className="cnPrice">{card.price}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cnMembership">
        <div className="cnMembershipIntro">
          <p className="cnEyebrow">CARDNEST MEMBERSHIP</p>
          <h2>Grow with the Nest.</h2>
          <p>
            Unlock collector rewards, marketplace benefits and membership
            advantages designed to grow with your collection.
          </p>
        </div>

        <div className="cnMembershipGrid">
          {memberships.map((plan) => (
            <article
              className={`cnMembershipCard ${plan.className}`}
              key={plan.name}
            >
              <div className="cnMembershipBadge">{plan.badge}</div>
              <h3>{plan.name}</h3>

              <div className="cnMembershipPrice">
                <strong>{plan.price}</strong>
                <span>/ month</span>
              </div>

              <ul>
                <li>✓ CardNest member rewards</li>
                <li>✓ Collector marketplace benefits</li>
                <li>✓ Member-only promotions</li>
                <li>✓ {plan.contribution} inventory contribution</li>
              </ul>

              <Link href="/rewards">View membership →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="cnCollectorBanner">
        <div>
          <p className="cnEyebrow">WELCOME HOME, COLLECTOR</p>
          <h2>Build your collection. Grow your Nest.</h2>
          <p>
            Buy, sell and discover collectible cards in a marketplace built
            around collectors.
          </p>
        </div>

        <div className="cnBannerButtons">
          <Link className="cnPrimary" href="/marketplace">
            Start Collecting →
          </Link>
          <Link className="cnSecondary light" href="/sell">
            Sell a Card
          </Link>
        </div>
      </section>

      <footer className="cnFooter">
        <div>
          <Link className="cnBrand" href="/">
            <span className="cnBrandMark">🪺</span>
            <span>
              Card<strong>Nest</strong>
            </span>
          </Link>
          <p>Collect • Trade • Discover</p>
        </div>

        <div className="cnFooterLinks">
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/sell">Sell</Link>
          <Link href="/rewards">Rewards</Link>
        </div>

        <p className="cnCopyright">
          © 2026 CardNest. Built for collectors.
        </p>
      </footer>
    </main>
  );
}
