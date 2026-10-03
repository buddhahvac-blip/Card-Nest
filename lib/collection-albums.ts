import {seasonManifest} from './season-manifest';
export const collectionAlbums=[
 {id:'bloom-garden',name:'The Bloom Garden',theme:'Bloom',description:'A place for small companions, patient protectors and every kind of growing wonder.',numbers:[2,8,130,131,132,133,134,135,136,137,138,168]},
 {id:'storm-paths',name:'Paths Above the Storm',theme:'Volt',description:'Follow wind canyons and cloud gardens. A future connected-art study, with every Common welcome.',numbers:[6,190,191,192,193,194,195,196,197,198,199,229]},
 {id:'first-horizons',name:'Six First Horizons',theme:'Mixed Themes',description:'Six showcase guardians, six ways to find a world worth returning to.',numbers:[108,168,229,299,359,307]}
].map(album=>({...album,cards:album.numbers.map(n=>seasonManifest.find(c=>c.cardNumber===n)!)}));
export function albumProgress(ids:string[],numbers:number[]){const unique=new Set(ids);return numbers.filter(n=>{const c=seasonManifest.find(c=>c.cardNumber===n);return c&&unique.has(c.id)}).length}
export const nestTitles:Record<string,string>={Bloom:'Meadow Keeper',Ember:'Cinder Pathfinder',Tide:'Deepwater Explorer',Volt:'Skyway Guardian',Mystic:'Starfield Seeker',Shadow:'Moonpath Wanderer'};
