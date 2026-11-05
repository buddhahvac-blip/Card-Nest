import type {NextRequest} from 'next/server';

// Original, item-specific vector art for NestRune's physical One Piece catalog.
// These are NOT depictions of exact packaging, contents, condition, or slab labels.
type Art={title:string;short:string;edition:string;kind:'box'|'deck'|'pack'|'slab';primary:string;secondary:string;accent:string;grade?:string;motif:number};
const art:Record<string,Art>={
  'OP-ILL-KID-KILLER':{title:'Kid / Killer Illustration Box',short:'KID + KILLER',edition:'SEALED ILLUSTRATION BOX',kind:'box',primary:'#68274e',secondary:'#1d4b7a',accent:'#e9a5ef',motif:1},
  'OP-ILL-RAYLEIGH-SHAKUYAKU':{title:'Rayleigh / Shakuyaku Illustration Box',short:'RAYLEIGH + SHAKUYAKU',edition:'SEALED ILLUSTRATION BOX',kind:'box',primary:'#746036',secondary:'#534c71',accent:'#f6d98c',motif:2},
  'OP-ST-34':{title:'Charlotte Katakuri Starter Deck',short:'KATAKURI',edition:'STARTER DECK · ST-34',kind:'deck',primary:'#7a315e',secondary:'#402b69',accent:'#ffb8d3',motif:3},
  'OP-16-EN':{title:'OP-16 English Booster Pack',short:'OP-16',edition:'ENGLISH BOOSTER',kind:'pack',primary:'#9b5731',secondary:'#a83c24',accent:'#ffd98a',motif:4},
  'EB-04-JP':{title:'EB-04 Japanese Booster Pack',short:'EB-04',edition:'JAPANESE BOOSTER',kind:'pack',primary:'#ae4769',secondary:'#4f3877',accent:'#ffbaca',motif:5},
  'OP-15-JP':{title:'OP-15 Japanese Booster Pack',short:'OP-15',edition:'JAPANESE BOOSTER',kind:'pack',primary:'#963d38',secondary:'#491a2d',accent:'#ffd3ab',motif:6},
  'OP-09-JP':{title:'OP-09 Japanese Booster Pack',short:'OP-09',edition:'JAPANESE BOOSTER',kind:'pack',primary:'#2d6f9c',secondary:'#563c80',accent:'#bde8ff',motif:7},
  'OP-17-JP':{title:'OP-17 Japanese Booster Pack',short:'OP-17',edition:'JAPANESE BOOSTER',kind:'pack',primary:'#23797a',secondary:'#1e5975',accent:'#abf2e4',motif:8},
  'OPC-01-JP':{title:'Carddass OPC-01 Japanese Booster Pack',short:'OPC-01',edition:'CARDDASS · JAPANESE',kind:'pack',primary:'#a47626',secondary:'#744c30',accent:'#ffdf91',motif:9},
  'OP-SLAB-BACCARAT':{title:'Baccarat Graded Card',short:'BACCARAT',edition:'CROWN',kind:'slab',primary:'#7a4a8c',secondary:'#243b6e',accent:'#e7b7fd',grade:'GEM 10',motif:10},
  'OP-SLAB-CAMIE':{title:'Camie Graded Card',short:'CAMIE',edition:'CROWN',kind:'slab',primary:'#a35785',secondary:'#315b89',accent:'#ffc6ed',grade:'GEM 10',motif:11},
  'OP-SLAB-DON':{title:'DON!! Graded Card',short:'DON!! CARD',edition:'CROWN',kind:'slab',primary:'#9a7531',secondary:'#573853',accent:'#ffe39c',grade:'GEM MINT 9.5',motif:12},
  'OP-SLAB-BELLMERE':{title:'Bell-mère Graded Card',short:'BELL-MÈRE',edition:'CROWN',kind:'slab',primary:'#3f896d',secondary:'#776048',accent:'#d3e9aa',grade:'GEM MINT 9.5',motif:13},
  'OP-SLAB-TEACH':{title:'Marshall D. Teach Graded Card',short:'MARSHALL D. TEACH',edition:'CROWN',kind:'slab',primary:'#423654',secondary:'#7b443b',accent:'#d2c0ee',grade:'MINT 9',motif:14}
};
function esc(s:string){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]||c));}
function T(x:number,y:number,value:string,size:number,color='#ffffff',weight=700,anchor='middle'){
  return '<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="'+color+'" font-family="Arial, Helvetica, sans-serif" font-size="'+size+'" font-weight="'+weight+'" letter-spacing="1.3">'+esc(value)+'</text>';
}
function waves(seed:number){
  let s='';
  for(let i=0;i<7;i++){
    const y=208+i*24+(seed%4)*3;
    s+='<path d="M 112 '+y+' Q 230 '+(y-59)+' 346 '+y+' T 584 '+y+'" stroke="#eff8ec" stroke-opacity="'+(.04+i*.012)+'" stroke-width="'+(i%2?3:2)+'" fill="none"/>';
  }
  return s;
}
function rays(n:number){
  let s='';
  for(let i=0;i<18;i++){
    const a=(i*20+n*7)*Math.PI/180;
    const x1=350+84*Math.cos(a),y1=246+84*Math.sin(a),x2=350+260*Math.cos(a),y2=246+260*Math.sin(a);
    s+='<path d="M '+x1.toFixed(1)+' '+y1.toFixed(1)+' L '+x2.toFixed(1)+' '+y2.toFixed(1)+'" stroke="url(#metal)" stroke-opacity=".10" stroke-width="'+(i%3+1)+'"/>';
  }
  return s;
}
function crest(a:Art){
  return '<g opacity=".7" stroke="'+a.accent+'" fill="none"><circle cx="350" cy="230" r="91" stroke-width="3"/><circle cx="350" cy="230" r="65" stroke-width="1.7" stroke-dasharray="3 9"/><path d="M350 123 L368 208 L450 230 L368 252 L350 335 L332 252 L250 230 L332 208Z" stroke-width="3" fill="#ffffff" fill-opacity=".03"/><path d="M350 159 V298 M281 230 H419" stroke-width="2"/></g>';
}
function packageArtwork(a:Art){
  const inner='<rect x="0" y="0" width="380" height="275" fill="url(#front)"/><path d="M20 237Q98 145 180 213 T365 183" fill="none" stroke="'+a.accent+'" stroke-opacity=".60" stroke-width="15"/><path d="M35 222Q100 140 190 200 T365 160" fill="none" stroke="#ffffff" stroke-opacity=".25" stroke-width="4"/><circle cx="258" cy="110" r="87" fill="url(#holo)" opacity=".75"/><path d="M155 179Q202 110 251 179L278 258H123Z" fill="#051f2b" opacity=".58"/><path d="M195 133 L222 71 L246 130" fill="none" stroke="'+a.accent+'" stroke-width="9"/><path d="M45 24 L84 42 L38 68 M320 42 L351 69 L301 77" fill="none" stroke="#ffffff" opacity=".4" stroke-width="4"/>';
  if(a.kind==='pack'){
    return '<g filter="url(#shadow)"><path d="M227 85L473 85L485 111L477 391L463 415H237L223 390L217 111Z" fill="url(#silver)" stroke="#ffeca3" stroke-width="6"/><path d="M232 111H467V394H232Z" fill="url(#front)" stroke="#eac77b" stroke-width="2"/>'+
      '<path d="M232 118L467 118M232 383L467 383" stroke="#eecb88" stroke-width="2"/><g transform="translate(232 130) scale(.62 0.88)">'+inner+'</g>'+
      '<path d="M238 105H461M238 398H461" stroke="#ffffff" stroke-opacity=".65" stroke-width="5" stroke-dasharray="9 7"/>'+
      T(350,330,a.short,46,'#fff8df',900)+T(350,363,'ILLUSTRATED COLLECTOR ART',12,'#ffe6af',800)+
      '</g>';
  }
  if(a.kind==='deck'){
    return '<g filter="url(#shadow)"><path d="M232 108L469 108L495 136L495 390L469 416L232 416L210 391L210 139Z" fill="url(#silver)" stroke="#dfb971" stroke-width="4"/><rect x="232" y="130" width="237" height="270" fill="url(#front)" stroke="#ffffff" stroke-opacity=".6"/><g transform="translate(224 145) scale(.63 .75)">'+inner+'</g>'+
      T(350,319,'ST-34',47,'#ffefb9',900)+T(350,355,a.short,20,'#ffffff',800)+T(350,384,'STARTER DECK CONCEPT',11,'#ffe1b5',700)+'</g>';
  }
  return '<g filter="url(#shadow)"><path d="M165 135L207 101H584L543 135Z" fill="'+a.accent+'" opacity=".66" stroke="#edcc92" stroke-width="3"/><path d="M543 135L584 101V370L543 401Z" fill="#07161d" stroke="#edcc92" stroke-width="3"/><rect x="165" y="135" width="378" height="266" rx="4" fill="url(#front)" stroke="#edcc92" stroke-width="5"/><g transform="translate(165 135)">'+inner+'</g>'+
      '<rect x="175" y="345" width="359" height="47" fill="#061c24" fill-opacity=".85" stroke="#f9e6ac" stroke-opacity=".5"/>'+
      T(355,373,a.short,a.short.length>19?20:26,'#fff3d0',900)+T(355,158,'COLLECTOR ILLUSTRATION',12,'#fbe2a5',800)+'</g>';
}
function slabArtwork(a:Art){
  const dots=Array.from({length:16},(_,i)=>'<circle cx="'+(269+(i%4)*52)+'" cy="'+(164+Math.floor(i/4)*45)+'" r="'+(3+(i%3)*3)+'" fill="'+a.accent+'" fill-opacity=".25"/>').join('');
  return '<g filter="url(#shadow)"><rect x="222" y="51" width="256" height="388" rx="18" fill="url(#silver)" stroke="#f6ffff" stroke-width="5"/>'+
    '<rect x="232" y="64" width="236" height="365" rx="12" fill="#a6c0c4" fill-opacity=".15" stroke="#48636c" stroke-width="2"/>'+
    '<rect x="239" y="73" width="222" height="64" rx="6" fill="#0d1723" stroke="#d4b770" stroke-width="2"/>'+
    T(279,97,'CROWN',17,'#f8d99a',900,'start')+T(439,97,a.grade||'',14,'#ffefc4',900,'end')+
    '<path d="M263 111H437" stroke="#eed290" stroke-opacity=".6"/>'+T(349,125,'ILLUSTRATED SLAB CONCEPT',9,'#ffffff',500)+
    '<rect x="254" y="148" width="192" height="259" rx="7" fill="url(#front)" stroke="#d6e1d9" stroke-width="5"/>'+
    dots+'<circle cx="350" cy="248" r="92" fill="url(#holo)" opacity=".65"/>'+
    '<path d="M281 317Q351 191 419 317" fill="none" stroke="'+a.accent+'" stroke-width="19" stroke-opacity=".9"/>'+
    '<path d="M302 300L350 211L398 300Z" fill="#071e27" fill-opacity=".55"/>'+
    '<path d="M279 173L421 380M421 170L278 371" stroke="#ffffff" stroke-opacity=".10" stroke-width="6"/>'+
    '<rect x="261" y="358" width="178" height="42" fill="#061d26" fill-opacity=".90"/>'+
    T(350,383,a.short,a.short.length>17?12:17,'#fff3d2',800)+'</g>';
}
function svg(a:Art){
  return '<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+esc(a.title)+' original AI-designed concept artwork, not actual product photograph" viewBox="0 0 700 500" width="700" height="500">'+
  '<defs><radialGradient id="bg"><stop offset="0" stop-color="#16464a"/><stop offset="1" stop-color="#061920"/></radialGradient>'+
  '<linearGradient id="front" x1="0" x2="1" y1="0" y2="1"><stop stop-color="'+a.primary+'"/><stop offset=".52" stop-color="'+a.secondary+'"/><stop offset="1" stop-color="#061f27"/></linearGradient>'+
  '<linearGradient id="silver"><stop stop-color="#bed5d0"/><stop offset=".18" stop-color="#fff8e5"/><stop offset=".5" stop-color="#738d9c"/><stop offset=".8" stop-color="#eee8d5"/><stop offset="1" stop-color="#849fa5"/></linearGradient>'+
  '<linearGradient id="metal"><stop stop-color="#f9dfa4"/><stop offset=".5" stop-color="#917033"/><stop offset="1" stop-color="#fff1b9"/></linearGradient>'+
  '<radialGradient id="holo"><stop stop-color="'+a.accent+'" stop-opacity=".9"/><stop offset=".63" stop-color="'+a.primary+'" stop-opacity=".2"/><stop offset="1" stop-color="'+a.secondary+'" stop-opacity="0"/></radialGradient>'+
  '<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="20" stdDeviation="18" flood-color="#000" flood-opacity=".6"/></filter></defs>'+
  '<rect width="700" height="500" fill="url(#bg)"/><path d="M0 0H700V500H0Z" fill="none" stroke="#be9d56" stroke-width="7"/>'+
  rays(a.motif)+waves(a.motif)+crest(a)+
  '<path d="M42 45H148M552 45H658M42 45V122M658 45V122" fill="none" stroke="#e9c782" stroke-opacity=".7" stroke-width="3"/>'+
  '<rect x="40" y="25" width="210" height="38" rx="19" fill="#081f27" stroke="#e2bf79" stroke-width="1.5"/>'+
  T(145,48,'NESTRUNE · ONE PIECE',12,'#f7d690',800)+
  (a.kind==='slab'?slabArtwork(a):packageArtwork(a))+
  '<rect x="0" y="449" width="700" height="51" fill="#06191d" fill-opacity=".97"/><path d="M0 448H700" stroke="#e5bf73" stroke-width="2"/>'+
  T(350,472,'AI-DESIGNED ILLUSTRATION · NOT AN ITEM PHOTOGRAPH',12,'#f5ddaa',800)+
  T(350,489,'ACTUAL PACKAGING, LABELS & CONDITION REQUIRE CONFIRMATION',9,'#b8c9bd',500)+
  '</svg>';
}
export async function GET(_request:NextRequest,context:{params:Promise<{sku:string}>}){
  const {sku}=await context.params;
  const item=art[sku];
  if(!item)return new Response('Unknown collectible',{status:404,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  return new Response(svg(item),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=86400, s-maxage=604800','X-Content-Type-Options':'nosniff'}});
}