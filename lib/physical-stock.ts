// Pure physical stock calculations; never infer buyability from these alone.
export type PhysicalStockSnapshot={
  onHand:number;
  reserved:number;
  lowStockThreshold:number;
};
export function summarizePhysicalStock(input:PhysicalStockSnapshot){
  if(![input.onHand,input.reserved,input.lowStockThreshold].every(Number.isSafeInteger)||
     input.onHand<0||input.reserved<0||input.lowStockThreshold<0||input.reserved>input.onHand)
    throw new Error('Invalid physical stock snapshot');
  const available=input.onHand-input.reserved;
  return {available,isLow:available<=input.lowStockThreshold,isSoldOut:available===0};
}
