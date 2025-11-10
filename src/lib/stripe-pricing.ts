// Filsti: src/lib/stripe-pricing.ts

const VAT_RATE = 0.25; // 25% MVA

// Tiered pricing basert på Stripe (priser INKLUDERT MVA)
export const PRICING_TIERS_INCL_VAT = [
  { min: 1, max: 1, pricePerSensor: 59.50 },
  { min: 2, max: 3, pricePerSensor: 56.30 },
  { min: 4, max: 5, pricePerSensor: 52.70 },
  { min: 6, max: 7, pricePerSensor: 49.80 },
  { min: 8, max: 9, pricePerSensor: 47.40 },
  { min: 10, max: 10, pricePerSensor: 45.90 },
  { min: 11, max: Infinity, pricePerSensor: 43.70 },
];

export function getPricePerSensorInclVAT(quantity: number): number {
  const tier = PRICING_TIERS_INCL_VAT.find(
    (t) => quantity >= t.min && quantity <= t.max
  );
  return tier?.pricePerSensor || 59.50;
}

export function getPricePerSensorExclVAT(quantity: number): number {
  const priceInclVAT = getPricePerSensorInclVAT(quantity);
  return priceInclVAT / (1 + VAT_RATE);
}

export function calculateTotalPrice(quantity: number, includeVat: boolean = true): number {
  if (includeVat) {
    const pricePerSensor = getPricePerSensorInclVAT(quantity);
    return pricePerSensor * quantity;
  } else {
    const pricePerSensor = getPricePerSensorExclVAT(quantity);
    return pricePerSensor * quantity;
  }
}

export function calculateVAT(quantity: number): number {
  const priceExclVAT = getPricePerSensorExclVAT(quantity);
  const subtotal = priceExclVAT * quantity;
  return subtotal * VAT_RATE;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getPriceBreakdown(quantity: number, includeVat: boolean = true) {
  let pricePerSensor: number;
  let subtotal: number;
  let vat: number;
  let total: number;
  
  if (includeVat) {
    pricePerSensor = getPricePerSensorInclVAT(quantity);
    total = pricePerSensor * quantity;
    subtotal = total / (1 + VAT_RATE);
    vat = total - subtotal;
  } else {
    pricePerSensor = getPricePerSensorExclVAT(quantity);
    subtotal = pricePerSensor * quantity;
    vat = subtotal * VAT_RATE;
    total = subtotal + vat;
  }
  
  return {
    pricePerSensor,
    subtotal,
    vat,
    total,
    totalExclVat: subtotal,
    totalInclVat: subtotal + vat,
    quantity,
  };
}