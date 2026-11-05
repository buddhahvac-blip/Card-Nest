import type {Metadata} from 'next';
import Link from 'next/link';
import NestBattles from '../nest-battles';

export const metadata:Metadata={
 title:'Nest Battles',
 description:'Build a three-Guardian team and try the playable NestRune Nest Battles alpha.'
};

export default function PlayPage(){
 return <><main className="shell battle-page-shell"><NestBattles/></main><footer><Link className="brand" style={{fontSize:21}} href="/">✧ Nest<span>Rune</span></Link><span>Playable alpha · No paid advantage · Rules subject to playtesting</span><Link href="/terms">Terms</Link><Link href="/support">Support</Link></footer></>;
}
