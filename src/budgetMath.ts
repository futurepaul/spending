export interface BudgetNumbers {
  revenue: number;
  outlays: number;
  obligatedAmount: number;
}

export function calculateRatios(baseNumbers: BudgetNumbers): {
  outlaysRatio: number;
  obligatedRatio: number;
  remainingObligatedRatio: number;
} {
  const outlaysRatio = baseNumbers.outlays / baseNumbers.revenue;
  const obligatedRatio = baseNumbers.obligatedAmount / baseNumbers.revenue;
  const remainingObligatedRatio = (baseNumbers.obligatedAmount - baseNumbers.outlays) / baseNumbers.revenue;
  return { outlaysRatio, obligatedRatio, remainingObligatedRatio };
}

export function scaleToUserAmount(
  baseNumbers: BudgetNumbers,
  userAmount: number,
  useUserAmount: boolean
): BudgetNumbers & { remainingObligated: number } {
  if (!useUserAmount) {
    return {
      ...baseNumbers,
      remainingObligated: baseNumbers.obligatedAmount - baseNumbers.outlays
    };
  }

  const { outlaysRatio, obligatedRatio } = calculateRatios(baseNumbers);
  const scaled = {
    revenue: userAmount,
    outlays: userAmount * outlaysRatio,
    obligatedAmount: userAmount * obligatedRatio,
  };
  return {
    ...scaled,
    remainingObligated: scaled.obligatedAmount - scaled.outlays
  };
}

export function calculatePercentage(amount: number, total: number): number {
  return (amount / total) * 100;
}

export function calculateUserPortion(
  userAmount: number,
  itemAmount: number,
  totalBudget: number,
  parentAmount?: number
): number {
  // First calculate the percentage of the total budget (or parent if provided)
  const baseAmount = parentAmount || totalBudget;
  const percentage = itemAmount / baseAmount;
  
  // Then apply that percentage to the user's amount
  return userAmount * percentage;
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