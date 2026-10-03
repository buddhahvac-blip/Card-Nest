export function slugify(value:string){
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

export function cardPath(card:{cardNumber:number;name:string}){
  return `/cards/cn1-${String(card.cardNumber).padStart(3,'0')}-${slugify(card.name)}`;
}

export function themePath(theme:string){
  return `/themes/${slugify(theme)}`;
}
