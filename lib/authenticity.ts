const ALPHABET='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const MAX_128=1n<<128n;

function normalizeToken(token:string){
  return token.toUpperCase().replace(/O/g,'0').replace(/[IL]/g,'1');
}

function uuidToToken(uuid:string){
  const hex=uuid.replace(/-/g,'').toLowerCase();
  if(!/^[0-9a-f]{32}$/.test(hex))throw new Error('Invalid copy id');
  let value=BigInt('0x'+hex),out='';
  for(let i=0;i<26;i++){out=ALPHABET[Number(value&31n)]+out;value>>=5n}
  return out;
}

function tokenToUuid(raw:string){
  const token=normalizeToken(raw);
  if(!/^[0-9A-HJKMNP-TV-Z]{26}$/.test(token))return null;
  let value=0n;
  for(const ch of token){
    const n=ALPHABET.indexOf(ch);
    if(n<0)return null;
    value=(value<<5n)+BigInt(n);
  }
  if(value>=MAX_128)return null;
  const hex=value.toString(16).padStart(32,'0');
  return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
}

export function catalogCode(cardNumber:number){
  if(!Number.isInteger(cardNumber)||cardNumber<1||cardNumber>369)throw new Error('Invalid Season One card number');
  return 'CN1-'+String(cardNumber).padStart(3,'0');
}

export function catalogLabel(cardNumber:number){
  return catalogCode(cardNumber)+' / 369';
}

export function copySerial(copyId:string,cardNumber:number){
  return catalogCode(cardNumber)+'-'+uuidToToken(copyId);
}

export function parseCopySerial(serial:string){
  const match=/^CN1-(\d{3})-([0-9A-Z]{26})$/i.exec(serial.trim());
  if(!match)return null;
  const cardNumber=Number(match[1]);
  if(!Number.isInteger(cardNumber)||cardNumber<1||cardNumber>369)return null;
  const copyId=tokenToUuid(match[2]);
  return copyId?{cardNumber,copyId}:null;
}
