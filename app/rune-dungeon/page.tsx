import type {Metadata} from 'next';
import Link from 'next/link';
import RuneDungeon from '../rune-dungeon-client';

export const metadata:Metadata={
 title:'Rune Dungeon',
 description:'Explore three NestRune Rune Worlds with 30 total dungeon levels, world bosses, Rune Energy rewards and a final Runeheart battle.'
};

export default function RuneDungeonPage(){
 return <><header><Link className="brand" href="/">✧ Nest<span>Rune</span></Link><nav aria-label="Game navigation"><Link href="/">Explore</Link><Link href="/season-one">Season 1</Link><Link href="/play">Nest Battles</Link><Link className="active" href="/rune-dungeon">Rune Dungeon</Link><Link href="/albums">Albums</Link></nav><Link className="account" href="/#My%20Nest">My Nest ◇</Link></header><main className="shell battle-page-shell"><RuneDungeon/></main><footer><Link className="brand" style={{fontSize:21}} href="/">✧ Nest<span>Rune</span></Link><span>Rune Dungeon beta · Account-bound rewards · No paid Energy</span><Link href="/terms">Terms</Link><Link href="/support">Support</Link></footer></>;
}
