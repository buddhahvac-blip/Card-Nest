import Link from "next/link";

const packs = [
  {image: "/Hatchling%20Pack.png",
    icon: "🥚",
    name: "Hatchling Pack",
    subtitle: "Begin Your Nest",
    description:
      "A welcoming first step into CardNest. Discover guardians and begin building your Season 1 collection.",
    badge: "STARTER",
    className: "hatchling",
  },
  {image: "/Nest%20Pack.png",
    icon: "🪺",
    name: "Nest Pack",
    subtitle: "Build Your Collection",
    description:
      "The signature CardNest pack. Hatch guardians from across the six Nest families and grow your collection.",
    badge: "SIGNATURE",
    className: "nestPack",
  },
  {image: "/Guardian%20Pack.png",
    icon: "🛡️",
    name: "Guardian Pack",
    subtitle: "Seek Rarer Guardians",
    description:
      "An enhanced CardNest experience designed around exciting discoveries and higher-tier guardians.",
    badge: "ENHANCED",
    className: "guardian",
  },
  {image: "/Royal%20Nest%20Pack.png",
    icon: "👑",
    name: "Royal Nest Pack",
    subtitle: "Enter the Royal Nest",
    description:
      "A premium collector experience celebrating CardNest's rarest discoveries and most prestigious guardians.",
    badge: "PREMIUM",
    className: "royal",
  },
];

export default function PacksPage() {
  return (
    <main className="packShopPage">
      <section className="packHero">
        <div className="packHeroGlow" />

        <div className="packHeroContent">
          <span className="packEyebrow">CARDNEST • SEASON 1</span>

          <h1>Hatch Your Next Guardian</h1>

          <p>
            Every nest begins with a discovery. Open CardNest packs, uncover
            guardians, and build your Season 1 collection.
          </p>

          <div className="packHeroActions">
            <a href="#packs" className="packPrimaryButton">
              Explore Packs
            </a>

            <Link href="/my-nest" className="packSecondaryButton">
              View My Nest
            </Link>
          </div>
        </div>

        <div className="packHeroNest" aria-hidden="true">
          <div className="packHeroCrown">♛</div>
          <div className="packHeroEgg">🥚</div>
          <div className="packHeroSpark sparkOne">✦</div>
          <div className="packHeroSpark sparkTwo">✧</div>
          <div className="packHeroSpark sparkThree">✦</div>
        </div>
      </section>

      <section className="packShopSection" id="packs">
        <div className="packSectionHeading">
          <div>
            <span className="packEyebrow">CHOOSE YOUR DISCOVERY</span>
            <h2>CardNest Packs</h2>
          </div>

          <p>
            Four ways to build your Nest. Final launch pricing and published
            pull odds will be added before paid packs are activated.
          </p>
        </div>

        <div className="packGrid">
          {packs.map((pack) => (
            <article
              className={`packCard ${pack.className}`}
              key={pack.name}
            >
              <div className="packBadge">{pack.badge}</div>

<div className="packArtwork packArtworkGuardian">
  <img
    src={pack.image}
    alt={`${pack.name} — CardNest Season 1`}
    className="packIndividualImage"
  />
</div>

              <div className="packCardContent">
                <span>{pack.subtitle}</span>
                <h3>{pack.name}</h3>
                <p>{pack.description}</p>

                <button type="button" className="packComingSoon" disabled>
                  Coming Soon
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="packDevSection">
        <div>
          <span className="packEyebrow">DEVELOPMENT NEST</span>
          <h2>Pack Opening Lab</h2>
          <p>
            CardNest's development pack will be used to test secure pack
            opening, numbered editions, reveals, and automatic delivery into
            My Nest before real purchases are enabled.
          </p>
        </div>

        <div className="packDevStatus">
          <span>●</span>
          Pack Engine Connected
        </div>
      </section>
    </main>
  );
}
