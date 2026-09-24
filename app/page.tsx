import Link from "next/link";

const cards = [
  {
    name: "Emberwing",
    type: "Fire",
    price: "$95+",
    icon: "🔥",
    description: "Collector classic",
    className: "fire",
  },
  {
    name: "Tidefin",
    type: "Water",
    price: "$42+",
    icon: "💧",
    description: "Ocean rare",
    className: "water",
  },
  {
    name: "Bloomtail",
    type: "Nature",
    price: "$28+",
    icon: "🌸",
    description: "Cute & collectible",
    className: "nature",
  },
];

const features = [
  { icon: "🛡️", title: "Secure Transactions" },
  { icon: "🤝", title: "Trusted Community" },
  { icon: "📦", title: "Fast & Safe Shipping" },
  { icon: "🎁", title: "Earn Rewards" },
];

export default function Home() {
  return (
    <main>
      <nav className="navbar">
        <Link className="brand" href="/">
          <span className="brandMascot">🐣</span>
          <span>Card</span>
          <strong>Nest</strong>
        </Link>

        <div className="navlinks">
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/sell">Sell</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/rewards">Rewards</Link>
          <button className="navIcon" aria-label="Search">⌕</button>
          <button className="navIcon" aria-label="Cart">🛒</button>
        </div>
      </nav>

      <section className="hero">
        <div className="heroText">
          <p className="eyebrow">COLLECT • TRADE • DISCOVER</p>

          <h1>
            Your cozy home for
            <span> collectible cards.</span>
          </h1>

          <p className="heroDescription">
            Buy and sell collectible cards through a marketplace designed
            around trust, transparent pricing, and delightful collecting.
          </p>

          <div className="heroButtons">
            <Link className="primaryButton" href="/marketplace">
              ✦ Explore cards →
            </Link>

            <Link className="secondaryButton" href="/sell">
              🏷️ Sell a card →
            </Link>
          </div>

          <div className="trustRow">
            <span>✓ Protected checkout</span>
            <span>✓ Collector focused</span>
            <span>✓ Transparent pricing</span>
          </div>
        </div>

        <div className="heroArt">
          <div className="sparkle sparkleOne">✦</div>
          <div className="sparkle sparkleTwo">✧</div>
          <div className="sparkle sparkleThree">✦</div>

          <div className="floatingCard cardBackOne">
            <span>🔥</span>
          </div>

          <div className="floatingCard cardBackTwo">
            <span>💧</span>
          </div>

          <div className="floatingCard cardBackThree">
            <span>🌿</span>
          </div>

          <div className="mascotScene">
            <div className="mascotGlow" />

            <div className="mascot">
              <div className="feathers">✦</div>
              <div className="mascotFace">
                <span className="eye">●</span>
                <span className="beak">◆</span>
                <span className="eye">●</span>
              </div>
              <div className="mascotBody">🐣</div>
            </div>

            <div className="egg">
              <span>♛</span>
            </div>

            <div className="nest">
              <span>〰〰〰〰〰</span>
            </div>
          </div>

          <div className="heroBadge">
            <span>✨</span>
            <div>
              <strong>CardNest</strong>
              <small>Find your next favorite</small>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        {features.map((feature) => (
          <div className="feature" key={feature.title}>
            <div className="featureIcon">{feature.icon}</div>
            <span>{feature.title}</span>
          </div>
        ))}
      </section>

      <section className="discover">
        <div className="sectionTop">
          <div>
            <p className="eyebrow gold">DISCOVER</p>
            <h2>Trending in the Nest</h2>
          </div>

          <Link className="viewAll" href="/marketplace">
            View Marketplace →
          </Link>
        </div>

        <div className="filters">
          <button className="activeFilter">All</button>
          <button>🔥 Fire</button>
          <button>💧 Water</button>
          <button>🌿 Nature</button>
          <button>⚡ Electric</button>
          <button>🔮 Psychic</button>
          <button>🌙 Dark</button>
        </div>

        <div className="cardGrid">
          {cards.map((card) => (
            <article className="listingCard" key={card.name}>
              <div className={`cardArtwork ${card.className}`}>
                <button className="heart" aria-label={`Favorite ${card.name}`}>
                  ♡
                </button>

                <div className="miniCard">
                  <div className="miniCardTop">
                    <small>CARDNEST</small>
                    <span>✦</span>
                  </div>

                  <div className="creature">{card.icon}</div>

                  <strong>{card.name}</strong>
                  <small>{card.type} • Rare</small>
                </div>
              </div>

              <div className="listingInfo">
                <div>
                  <p>{card.description}</p>
                  <h3>{card.name}</h3>
                </div>

                <strong className="price">{card.price}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="collectorBanner">
        <div>
          <p className="eyebrow">WELCOME TO THE NEST</p>
          <h2>Built for collectors.</h2>
          <p>
            Discover cards, build your collection, sell securely and earn
            rewards as CardNest grows.
          </p>
        </div>

        <Link className="primaryButton" href="/marketplace">
          Start collecting →
        </Link>
      </section>

      <footer>
        <Link className="brand footerBrand" href="/">
          <span>🐣</span>
          <span>Card</span>
          <strong>Nest</strong>
        </Link>

        <p>Collect • Trade • Discover</p>

        <div className="footerLinks">
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/sell">Sell</Link>
          <Link href="/rewards">Rewards</Link>
        </div>
      </footer>
    </main>
  );
}
