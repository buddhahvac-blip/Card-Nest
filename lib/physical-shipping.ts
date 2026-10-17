/**
 * Physical Pokémon merchandise shipping foundation.
 * Not connected to digital pack checkout or live payment collection.
 * Carrier quotes must come from a verified carrier/rate provider.
 */
export const PHYSICAL_SHIP_FROM_ZIP = '96737';
export const DEFAULT_HANDLING_CENTS = 400;

export type PhysicalFulfillment =
  | { kind: 'pickup'; pickupConfirmed: true }
  | { kind: 'ship'; destinationZip: string; carrierRateCents: number; handlingCents?: number };

export type PhysicalOrderCosts = {
  merchandiseRevenueCents: number;
  inventoryCostCents: number;
  packagingCostCents: number;
  paymentFeeCents: number;
  otherCostCents?: number;
  minimumProfitCents: number;
};

function nonnegativeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(label + ' must be a nonnegative integer of cents');
}

/** Server-side calculation only: never trust costs supplied by the buyer. */
export function quotePhysicalOrder(costs: PhysicalOrderCosts, fulfillment: PhysicalFulfillment) {
  for (const [label, value] of Object.entries(costs)) {
    if (value !== undefined) nonnegativeInteger(value, label);
  }
  const pickup = fulfillment.kind === 'pickup';
  if (pickup && !fulfillment.pickupConfirmed) throw new Error('Pickup must be confirmed');
  if (!pickup) {
    if (!/^\\d{5}$/.test(fulfillment.destinationZip)) throw new Error('A valid five-digit destination ZIP is required');
    nonnegativeInteger(fulfillment.carrierRateCents, 'carrierRateCents');
    nonnegativeInteger(fulfillment.handlingCents ?? DEFAULT_HANDLING_CENTS, 'handlingCents');
  }
  const carrierCents = pickup ? 0 : fulfillment.carrierRateCents;
  const handlingCents = pickup ? 0 : fulfillment.handlingCents ?? DEFAULT_HANDLING_CENTS;
  const shippingChargedCents = carrierCents + handlingCents;
  const totalChargedCents = costs.merchandiseRevenueCents + shippingChargedCents;
  const totalCostsCents = costs.inventoryCostCents + costs.packagingCostCents +
    costs.paymentFeeCents + (costs.otherCostCents ?? 0) + carrierCents;
  const estimatedProfitCents = totalChargedCents - totalCostsCents;
  return {
    originZip: PHYSICAL_SHIP_FROM_ZIP,
    fulfillment: fulfillment.kind,
    carrierCents,
    handlingCents,
    shippingChargedCents,
    totalChargedCents,
    estimatedProfitCents,
    eligibleForCheckout: estimatedProfitCents >= costs.minimumProfitCents,
    // Taxes, returns and post-purchase adjustments must be handled separately.
  };
}
