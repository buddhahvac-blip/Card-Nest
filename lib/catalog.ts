export const catalog=[
{id:'sproutling-001',name:'Sproutling',family:'Bloom',color:'#80d995',lore:'A curious guardian who brings new life to the Great Nest.',tile:-1},
{id:'emberwing-002',name:'Emberwing',family:'Ember',color:'#ffa76e',lore:'A warm-hearted explorer lighting the way to the next adventure.',tile:0},
{id:'tidefin-003',name:'Tidefin',family:'Tide',color:'#72d5f2',lore:'A river guardian following the stories carried by every current.',tile:1},
{id:'bloomtail-004',name:'Bloomtail',family:'Bloom',color:'#b3df79',lore:'A gentle garden keeper who sees possibility in the smallest seed.',tile:2},
{id:'voltbeak-005',name:'Voltbeak',family:'Volt',color:'#ffda75',lore:'A spirited skywatcher with a spark of courage to share.',tile:3},
{id:'mindfeather-006',name:'Mindfeather',family:'Mystic',color:'#c4a0ee',lore:'A thoughtful night guide finding patterns among the stars.',tile:4},
{id:'shadowclaw-007',name:'Shadowclaw',family:'Shadow',color:'#b0afea',lore:'A quiet protector watching over the nest while the world dreams.',tile:5}];
export const packDefinitions=[{id:'hatchling',name:'Hatchling',file:'Hatchling Pack.webp',count:1},{id:'nest',name:'Nest',file:'Nest Pack.webp',count:3},{id:'guardian',name:'Guardian',file:'Guardian Pack.webp',count:5},{id:'royal',name:'Royal Nest',file:'Royal Nest Pack.webp',count:7}];
export function chooseCards(pack:string){const p=packDefinitions.find(x=>x.id===pack);if(!p)throw Error('Unknown pack');if(pack==='hatchling')return ['sproutling-001'];const ids=catalog.map(c=>c.id);for(let i=ids.length-1;i>0;i--){const max=4294967296-(4294967296%(i+1));let n:number;do{n=crypto.getRandomValues(new Uint32Array(1))[0]}while(n>=max);const j=n%(i+1);[ids[i],ids[j]]=[ids[j],ids[i]]}return ids.slice(0,p.count)}
