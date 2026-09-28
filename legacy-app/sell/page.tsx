"use client";

import Link from "next/link";
import { useState } from "react";

export default function SellPage() {
  const [price, setPrice] = useState("");
  const [cardName, setCardName] = useState("");

  return (
    <main className="sellPage">
      <nav className="sellNav">
        <Link className="brand" href="/">
          🐣 Card<strong>Nest</strong>
        </Link>

        <div className="navlinks">
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/sell">Sell</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/rewards">Rewards</Link>
        </div>
      </nav>

      <section className="sellHero">
        <div>
          <p className="eyebrow gold">SELL • EARN • GROW</p>
          <h1>
            Give your cards
            <br />
            a new <span>home.</span>
          </h1>

          <p className="sellIntro">
            Create a CardNest listing in just a few steps. Add your card
            details, choose its condition, set your price, and preview your
            listing before publishing.
          </p>
        </div>

        <div className="sellHeroArt">
          <div className="floatingCard cardOne">🔥</div>
          <div className="floatingCard cardTwo">💧</div>
          <div className="floatingCard cardThree">🌿</div>

          <div className="sellNest">
            <div className="sellEgg">🐣</div>
            <strong>Ready to sell?</strong>
            <span>Your collection can find its next home.</span>
          </div>
        </div>
      </section>

      <section className="sellerBenefits">
        <div>
          <span>🛡️</span>
          <strong>Protected Selling</strong>
          <small>Built for safer transactions</small>
        </div>

        <div>
          <span>💰</span>
          <strong>You Set the Price</strong>
          <small>Stay in control of your listing</small>
        </div>

        <div>
          <span>📦</span>
          <strong>Simple Shipping</strong>
          <small>Clear order workflow</small>
        </div>

        <div>
          <span>✨</span>
          <strong>Collector Community</strong>
          <small>Reach buyers looking for cards</small>
        </div>
      </section>

      <section className="listingBuilder">
        <div className="listingForm">
          <div className="formHeading">
            <div>
              <p className="eyebrow gold">CREATE A LISTING</p>
              <h2>Card details</h2>
            </div>
            <span className="stepBadge">Step 1 of 3</span>
          </div>

          <label>
            Card name
            <input
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Example: Charizard ex"
            />
          </label>

          <div className="formRow">
            <label>
              Game / Category
              <select defaultValue="">
                <option value="" disabled>
                  Select category
                </option>
                <option>Pokémon</option>
                <option>Magic: The Gathering</option>
                <option>Yu-Gi-Oh!</option>
                <option>Sports Cards</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Set / Series
              <input placeholder="Example: 151" />
            </label>
          </div>

          <div className="formRow">
            <label>
              Condition
              <select defaultValue="">
                <option value="" disabled>
                  Select condition
                </option>
                <option>Mint</option>
                <option>Near Mint</option>
                <option>Excellent</option>
                <option>Good</option>
                <option>Played</option>
              </select>
            </label>

            <label>
              Quantity
              <input type="number" min="1" defaultValue="1" />
            </label>
          </div>

          <div className="formRow">
            <label>
              Listing price
              <div className="priceInput">
                <span>$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </label>

            <label>
              Shipping
              <select defaultValue="seller">
                <option value="seller">Seller ships</option>
                <option value="local">Local pickup</option>
              </select>
            </label>
          </div>

          <label>
            Description
            <textarea
              rows={5}
              placeholder="Tell collectors about the card, its condition, and anything they should know..."
            />
          </label>

          <div className="photoUpload">
            <div className="uploadIcon">📸</div>
            <div>
              <strong>Add card photos</strong>
              <p>
                Front and back photos help buyers understand exactly what
                they're purchasing.
              </p>
            </div>
            <button type="button">Choose photos</button>
          </div>

          <div className="sellerNotice">
            🛡️ Never include passwords, payment information, or private contact
            details in a listing.
          </div>

          <button className="publishButton" type="button">
            Continue to preview →
          </button>
        </div>

        <aside className="listingPreview">
          <p className="eyebrow gold">LIVE PREVIEW</p>
          <h2>Your listing</h2>

          <div className="previewCard">
            <div className="previewArtwork">
              <div className="previewTradingCard">
                <span className="previewName">
                  {cardName || "Your card"}
                </span>
                <div className="previewCreature">✨</div>
                <small>CardNest collectible</small>
              </div>
            </div>

            <div className="previewDetails">
              <span className="conditionPill">Condition</span>
              <h3>{cardName || "Your card name"}</h3>
              <p>Your seller profile</p>

              <div className="previewPrice">
                {price ? `$${Number(price).toFixed(2)}` : "$0.00"}
              </div>
            </div>
          </div>

          <div className="previewTip">
            <span>💡</span>
            <div>
              <strong>Seller tip</strong>
              <p>
                Clear photos and accurate condition descriptions help
                collectors buy with confidence.
              </p>
            </div>
          </div>
        </aside>
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
