// Physical shop calculations and adjustment policies. Digital Guardian packs are separate.
export type PhysicalStockSnapshot={onHand:number;reserved:number;lowStockThreshold:number};
export const adjustmentReasons=['receipt','return','live_sale','damage'] as const;
export type AdjustmentReason=(typeof adjustmentReasons)[number];
export function summarizePhysicalStock(input:PhysicalStockSnapshot){
  if(![input.onHand,input.reserved,input.lowStockThreshold].every(Number.isSafeInteger)||
    input.onHand<0||input.reserved<0||input.lowStockThreshold<0||input.reserved>input.onHand)
    throw new Error('Invalid physical stock snapshot');
  const available=input.onHand-input.reserved;
  return {available,isLow:available<=input.lowStockThreshold,isSoldOut:available===0};
}
export function signedStockDelta(reason:AdjustmentReason,quantity:number){
  if(!Number.isSafeInteger(quantity)||quantity<=0||quantity>1000)throw new Error('Invalid physical inventory quantity');
  return reason==='receipt'||reason==='return'?quantity:-quantity;
}
export function canApplyStockDelta(stock:Pick<PhysicalStockSnapshot,'onHand'|'reserved'>,delta:number){
  if(!Number.isSafeInteger(stock.onHand)||!Number.isSafeInteger(stock.reserved)||
    stock.onHand<0||stock.reserved<0||stock.reserved>stock.onHand||
    !Number.isSafeInteger(delta)||delta===0)return false;
  const next=stock.onHand+delta;
  return Number.isSafeInteger(next)&&next>=stock.reserved;
}
