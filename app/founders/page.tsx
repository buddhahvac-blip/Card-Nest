import Image from 'next/image';
import Link from 'next/link';
import {GuardianCard} from '../cards';
import styles from './founders.module.css';

const rewards=[
  {amount:'$5',name:'Flight Supporter',copy:'Founder badge, digital wallpaper, and supporter updates as NestRune grows.'},
  {amount:'$15',name:'Founding Collector',copy:'The complete fixed 21-card Founding Flight digital set after the campaign, plus the Flight Supporter rewards.'},
  {amount:'$35',name:'Nest Builder',copy:'The complete 21-card set, a Founder profile badge, and early access to future NestRune playtests.'},
  {amount:'$75',name:'Garden Patron',copy:'Everything above plus an optional name on the NestRune Founders Wall and invitation to a founder feedback session.'}
];

export const metadata={
  title:'Founding Flight — Help Build NestRune',
  alternates:{canonical:'/founders'},
  description:'Meet the first 21 NestRune Guardians and see how the Founding Flight crowdfunding campaign will help grow the Garden of Lands.'
};

export default function FoundersPage(){
  return <main className={styles.page}>
    <section className={styles.hero}>
      <Image src="/art/great-nest-world.webp" alt="The Garden of Lands" fill priority quality={95} className={styles.world}/>
      <div className={styles.shade}/>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>NESTRUNE · FOUNDING FLIGHT</span>
        <h1>Help the first<br/><em>21 Guardians</em><br/>take flight.</h1>
        <p>NestRune is opening its first collectible beta pool while we prepare crowdfunding to fund higher-resolution art, more Guardians, stronger Nest Battles, and the next areas of the Garden of Lands.</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/#packs">OPEN A FREE BETA PACK</Link>
          <Link className={styles.secondary} href="/feedback">HELP SHAPE NESTRUNE</Link>
        </div>
        <small>Free beta pulls are separate from crowdfunding rewards. Paid randomized packs remain closed while launch and compliance safeguards are completed.</small>
      </div>
      <div className={styles.cardFan} aria-label="Three Founding Flight Guardian cards">
        <div className={styles.cardA}><GuardianCard id="sproutling-001"/></div>
        <div className={styles.cardB}><GuardianCard id="emberwing-002"/></div>
        <div className={styles.cardC}><GuardianCard id="tidefin-003"/></div>
      </div>
    </section>

    <section className={styles.stats}>
      <div><strong>21</strong><span>Founding Guardians live in beta</span></div>
      <div><strong>369</strong><span>Season One slots planned</span></div>
      <div><strong>6</strong><span>Garden themes</span></div>
      <div><strong>V3</strong><span>Nest Battles in active development</span></div>
    </section>

    <section className={styles.story}>
      <div>
        <span className={styles.eyebrow}>WHY CROWDFUND NESTRUNE?</span>
        <h2>Build the world with the people who want to live in it.</h2>
      </div>
      <p>Instead of hiding NestRune until every one of the 369 Season One slots is finished, the Founding Flight lets the first community experience the world now. Funding can then be directed toward production-quality card art, animation, battle polish, infrastructure, legal/compliance review, and the next Guardian releases.</p>
    </section>

    <section className={styles.rewards}>
      <div className={styles.sectionHead}>
        <span className={styles.eyebrow}>PLANNED FIXED REWARDS</span>
        <h2>Support the world. Know what you receive.</h2>
        <p>These are the reward concepts we are preparing for the crowdfunding campaign. They are intentionally non-random.</p>
      </div>
      <div className={styles.rewardGrid}>{rewards.map(r=><article key={r.amount} className={styles.reward}>
        <span className={styles.amount}>{r.amount}</span>
        <h3>{r.name}</h3>
        <p>{r.copy}</p>
      </article>)}</div>
    </section>

    <section className={styles.pool}>
      <div>
        <span className={styles.eyebrow}>FOUNDING FLIGHT · 21-CARD POOL</span>
        <h2>The first Guardians are already waiting.</h2>
        <p>Signed-in beta collectors can pull from the current 21-card pool and save eligible cards to My Nest. These beta openings are our first live test of the collect → build → battle loop.</p>
      </div>
      <div className={styles.actions}>
        <Link className={styles.primary} href="/#packs">TRY THE FOUNDING POOL</Link>
        <Link className={styles.secondary} href="/season-one">SEE SEASON ONE</Link>
      </div>
    </section>

    <section className={styles.launch}>
      <span className={styles.eyebrow}>CROWDFUNDING STATUS</span>
      <h2>Campaign preparation is underway.</h2>
      <p>The public campaign link will be added here after the crowdfunding platform review is complete. Until then, explore the beta, collect the Founding Flight Guardians, and tell us what NestRune should build next.</p>
      <Link className={styles.primary} href="/">RETURN TO NESTRUNE</Link>
    </section>
  </main>;
}
