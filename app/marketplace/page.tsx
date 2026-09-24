import Link from "next/link";

const cards = [
  {
    id: 1,
    name: "Emberwing",
    type: "Fire",
    condition: "Near Mint",
    price: "$95.00",
    seller: "NestCollector",
    rating: "4.9",
    icon: "🔥",
    className: "marketFire",
  },
  {
    id: 2,
    name: "Tidefin",
    type: "Water",
    condition: "Mint",
    price: "$42.00",
    seller: "IslandCards",
    rating: "5.0",
    icon: "💧",
    className: "marketWater",
  },
  {
    id: 3,
    name: "Bloomtail",
    type: "Nature",
    condition: "Near Mint",
    price: "$28.00",
    seller: "CardGarden",
    rating: "4.8",
    icon: "🌸",
    className: "marketNature",
  },
  {
    id: 4,
    name: "Voltcrest",
    type: "Electric",
    condition: "Mint",
    price: "$68.00",
    seller: "RareFinds",
    rating: "4.9",
    icon: "⚡",
    className: "marketElectric",
  },
  {
    id: 5,
    name: "Moonpaw",
    type: "Mystic",
    condition: "Excellent",
    price: "$34.00",
    seller: "MoonVault",
    rating: "4.7",
    icon: "🌙",
    className: "marketMystic",
  },
  {
    id: 6,
    name: "Flarehorn",
    type: "Fire",
    condition: "Near Mint",
    price: "$120.00",
    seller: "NestCollector",
    rating: "4.9",
    icon: "✨",
    className: "marketFire",
  },
];

export default function Marketplace() {
  return (
    <main className="marketplacePage">
      <nav className="navbar">
        <Link className="brand" href="/">
          <span className="brandMascot">🐣</span>
          Card<strong>Nest</strong>
        </Link>

        <div className="navlinks">
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/sell">Sell</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/rewards">Rewards</Link>
          <button className="navIcon" aria-label="Search">
            ⌕
          </button>
          <button className="navIcon" aria-label="Shopping cart">
            🛒
          </button>
        </div>
      </nav>

      <section className="marketHero">
        <div>
          <p className="eyebrow gold">THE CARDNEST MARKETPLACE</p>
          <h1>
            Find your next
            <span> favorite card.</span>
          </h1>

          <p>
            Browse collectible cards from sellers across the Nest. Compare
            condition, pricing and seller information before you buy.
          </p>
        </div>

        <Link className="secondaryButton" href="/sell">
          🏷️ Sell a card →
        </Link>
      </section>

      <section className="marketControls">
        <div className="marketSearch">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search cards, sets, sellers..."
            aria-label="Search marketplace"
          />
        </div>

        <select aria-label="Card condition">
          <option>All conditions</option>
          <option>Mint</option>
          <option>Near Mint</option>
          <option>Excellent</option>
          <option>Good</option>
        </select>

        <select aria-label="Sort marketplace">
          <option>Featured</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Newest</option>
        </select>
      </section>

      <section className="marketBody">
        <aside className="marketSidebar">
          <div className="filterHeading">
            <strong>Filters</strong>
            <button>Clear</button>
          </div>

          <div className="filterGroup">
            <p>Category</p>
            <label>
              <input type="checkbox" /> 🔥 Fire
            </label>
            <label>
              <input type="checkbox" /> 💧 Water
            </label>
            <label>
              <input type="checkbox" /> 🌿 Nature
            </label>
            <label>
              <input type="checkbox" /> ⚡ Electric
            </label>
            <label>
              <input type="checkbox" /> 🌙 Mystic
            </label>
          </div>

          <div className="filterGroup">
            <p>Price</p>
            <div className="priceInputs">
              <input placeholder="$ Min" />
              <input placeholder="$ Max" />
            </div>
          </div>

          <div className="filterGroup">
            <p>Condition</p>
            <label>
              <input type="checkbox" /> Mint
            </label>
            <label>
              <input type="checkbox" /> Near Mint
            </label>
            <label>
              <input type="checkbox" /> Excellent
            </label>
          </div>

          <div className="buyerProtection">
            <span>🛡️</span>
            <div>
              <strong>CardNest Protection</strong>
              <p>Protected checkout on eligible marketplace purchases.</p>
            </div>
          </div>
        </aside>

        <div className="marketResults">
          <div className="resultsHeader">
            <div>
              <p className="eyebrow">DISCOVER</p>
              <h2>Marketplace</h2>
            </div>
            <span>{cards.length} cards</span>
          </div>

          <div className="marketGrid">
            {cards.map((card) => (
              <article className="marketCard" key={card.id}>
                <div className={`marketArtwork ${card.className}`}>
                  <button
                    className="marketHeart"
                    aria-label={`Favorite ${card.name}`}
                  >
                    ♡
                  </button>

                  <div className="collectibleCard">
                    <div className="collectibleTop">
                      <strong>{card.name}</strong>
                      <span>{card.icon}</span>
                    </div>

                    <div className="collectibleCreature">{card.icon}</div>

                    <div className="collectibleBottom">
                      <strong>{card.type}</strong>
                      <small>CardNest collectible</small>
                    </div>
                  </div>
                </div>

                <div className="marketCardInfo">
                  <div className="conditionRow">
                    <span>{card.condition}</span>
                    <span>★ {card.rating}</span>
                  </div>

                  <h3>{card.name}</h3>
                  <p>
                    Sold by <strong>{card.seller}</strong>
                  </p>

                  <div className="marketPurchase">
                    <strong>{card.price}</strong>
                    <button aria-label={`Add ${card.name} to cart`}>
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketCTA">
        <div>
          <p className="eyebrow gold">JOIN THE NEST</p>
          <h2>Have cards to sell?</h2>
          <p>
            Create a listing and reach collectors looking for their next card.
          </p>
        </div>

        <Link className="primaryButton" href="/sell">
          Start selling →
        </Link>
      </section>

      <footer>
        <div>
          <Link className="brand" href="/">
            🐣 Card<strong>Nest</strong>
          </Link>
          <p>Collect • Trade • Discover</p>
        </div>

        <div className="footerLinks">
          <Link href="/">Home</Link>
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/sell">Sell</Link>
        </div>
      </footer>
    </main>
  );
}
