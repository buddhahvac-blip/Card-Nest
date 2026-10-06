export const API_BASE_URL='https://nestrune.vercel.app';

export type CatalogCard={
 id:string;
 number:number;
 name:string;
 rarity:string;
 family:string;
 art:string|null;
 status:string;
};

export type CatalogResponse={
 cards:CatalogCard[];
 packs:Array<{id:string;name:string;count:number;sale_enabled:boolean}>;
 paymentsEnabled:boolean;
 paymentMode:string;
 plannedTotal:number;
};

async function request<T>(path:string,init?:RequestInit):Promise<T>{
 const response=await fetch(API_BASE_URL+path,{
  ...init,
  headers:{Accept:'application/json',...(init?.headers||{})}
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(typeof (data as any)?.error==='string'?(data as any).error:'NestRune service unavailable');
 return data as T;
}

export const api={
 health:()=>request<{ok:boolean;database:string;plannedTotal:number}>('/api/health'),
 catalog:()=>request<CatalogResponse>('/api/catalog')
};
