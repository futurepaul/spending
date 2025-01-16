export interface BudgetNumbers {
  revenue: number;
  outlays: number;
  obligatedAmount: number;
}

export function calculateRatios(baseNumbers: BudgetNumbers): {
  outlaysRatio: number;
  obligatedRatio: number;
} {
  const outlaysRatio = baseNumbers.outlays / baseNumbers.revenue;
  const obligatedRatio = baseNumbers.obligatedAmount / baseNumbers.revenue;
  return { outlaysRatio, obligatedRatio };
}

export function scaleToUserAmount(
  baseNumbers: BudgetNumbers,
  userAmount: number,
  useUserAmount: boolean
): BudgetNumbers {
  if (!useUserAmount) {
    return baseNumbers;
  }

  const { outlaysRatio, obligatedRatio } = calculateRatios(baseNumbers);

  return {
    revenue: userAmount,
    outlays: userAmount * outlaysRatio,
    obligatedAmount: userAmount * obligatedRatio,
  };
}

export function calculateAgencyAmount(
  userAmount: number,
  agencyAmount: number,
  totalBudget: number,
  useUserAmount: boolean
): number {
  if (!useUserAmount || userAmount === 0) return 0;
  const percentage = agencyAmount / totalBudget;
  return userAmount * percentage;
} 