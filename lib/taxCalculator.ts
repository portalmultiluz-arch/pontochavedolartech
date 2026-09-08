/**
 * Utilitário para cálculo de tributos agregados e formação de preço de venda / serviços
 */

export interface ProductTaxCalculation {
  costPrice: number;
  icmsPercent: number;
  ipiPercent: number;
  pisPercent: number;
  cofinsPercent: number;
  otherTaxesPercent: number;
  totalTaxPercent: number;
  totalTaxAmount: number;
  costWithTaxes: number;
  profitMarginPercent: number;
  profitAmount: number;
  suggestedPrice: number;
}

export function calculateProductPrice(params: {
  costPrice?: number;
  icmsPercent?: number;
  ipiPercent?: number;
  pisPercent?: number;
  cofinsPercent?: number;
  otherTaxesPercent?: number;
  profitMarginPercent?: number;
}): ProductTaxCalculation {
  const cost = Number(params.costPrice) || 0;
  const icms = Number(params.icmsPercent) || 0;
  const ipi = Number(params.ipiPercent) || 0;
  const pis = Number(params.pisPercent) || 0;
  const cofins = Number(params.cofinsPercent) || 0;
  const other = Number(params.otherTaxesPercent) || 0;
  const margin = Number(params.profitMarginPercent) || 0;

  const totalTaxPercent = icms + ipi + pis + cofins + other;
  const totalTaxAmount = cost * (totalTaxPercent / 100);
  const costWithTaxes = cost + totalTaxAmount;
  const profitAmount = costWithTaxes * (margin / 100);
  const suggestedPrice = costWithTaxes + profitAmount;

  return {
    costPrice: cost,
    icmsPercent: icms,
    ipiPercent: ipi,
    pisPercent: pis,
    cofinsPercent: cofins,
    otherTaxesPercent: other,
    totalTaxPercent: Number(totalTaxPercent.toFixed(2)),
    totalTaxAmount: Number(totalTaxAmount.toFixed(2)),
    costWithTaxes: Number(costWithTaxes.toFixed(2)),
    profitMarginPercent: margin,
    profitAmount: Number(profitAmount.toFixed(2)),
    suggestedPrice: Number(suggestedPrice.toFixed(2)),
  };
}

export interface ServiceTaxCalculation {
  costPrice: number;
  issPercent: number;
  pisPercent: number;
  cofinsPercent: number;
  inssPercent: number;
  otherTaxesPercent: number;
  totalTaxPercent: number;
  totalTaxAmount: number;
  costWithTaxes: number;
  profitMarginPercent: number;
  profitAmount: number;
  suggestedPrice: number;
}

export function calculateServicePrice(params: {
  costPrice?: number;
  issPercent?: number;
  pisPercent?: number;
  cofinsPercent?: number;
  inssPercent?: number;
  otherTaxesPercent?: number;
  profitMarginPercent?: number;
}): ServiceTaxCalculation {
  const cost = Number(params.costPrice) || 0;
  const iss = Number(params.issPercent) || 0;
  const pis = Number(params.pisPercent) || 0;
  const cofins = Number(params.cofinsPercent) || 0;
  const inss = Number(params.inssPercent) || 0;
  const other = Number(params.otherTaxesPercent) || 0;
  const margin = Number(params.profitMarginPercent) || 0;

  const totalTaxPercent = iss + pis + cofins + inss + other;
  const totalTaxAmount = cost * (totalTaxPercent / 100);
  const costWithTaxes = cost + totalTaxAmount;
  const profitAmount = costWithTaxes * (margin / 100);
  const suggestedPrice = costWithTaxes + profitAmount;

  return {
    costPrice: cost,
    issPercent: iss,
    pisPercent: pis,
    cofinsPercent: cofins,
    inssPercent: inss,
    otherTaxesPercent: other,
    totalTaxPercent: Number(totalTaxPercent.toFixed(2)),
    totalTaxAmount: Number(totalTaxAmount.toFixed(2)),
    costWithTaxes: Number(costWithTaxes.toFixed(2)),
    profitMarginPercent: margin,
    profitAmount: Number(profitAmount.toFixed(2)),
    suggestedPrice: Number(suggestedPrice.toFixed(2)),
  };
}
