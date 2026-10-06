import Link from 'next/link';
import CollectionAlbums from '@/app/collection-albums';
export const metadata={title:'My Nest Albums · First Flight Studies'};
export default function AlbumsPage(){return <main className="shell"><Link className="brand" href="/">✧ Nest<span>Rune</span></Link><h1 className="page-title">A collection with a story.</h1><p className="intro">Find your Theme. Save your favorites. Explore the first album studies.</p><CollectionAlbums/><div className="actions"><Link className="outline" href="/#My%20Nest">My Nest</Link><Link className="outline" href="/showcase">The six-guardian showcase</Link></div></main>}
