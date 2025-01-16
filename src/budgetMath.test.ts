import { test, expect } from "bun:test";
import { calculateRatios, scaleToUserAmount, calculatePercentage, calculateUserPortion, type BudgetNumbers } from './budgetMath'

test('calculateRatios - simple numbers', () => {
  const base: BudgetNumbers = {
    revenue: 1,
    outlays: 2,
    obligatedAmount: 3
  }
  
  const ratios = calculateRatios(base)
  expect(ratios.outlaysRatio).toBe(2)
  expect(ratios.obligatedRatio).toBe(3)
})

test('scaleToUserAmount - returns original numbers when disabled', () => {
  const base: BudgetNumbers = {
    revenue: 1,
    outlays: 2,
    obligatedAmount: 3
  }
  const result = scaleToUserAmount(base, 5, false)
  expect(result).toEqual(base)
})

test('scaleToUserAmount - scales numbers correctly when enabled', () => {
  const base: BudgetNumbers = {
    revenue: 1,
    outlays: 2,
    obligatedAmount: 3
  }
  const result = scaleToUserAmount(base, 5, true)
  expect(result.revenue).toBe(5)
  expect(result.outlays).toBe(10)
  expect(result.obligatedAmount).toBe(15)
})

test('scaleToUserAmount - handles zero user amount', () => {
  const base: BudgetNumbers = {
    revenue: 1,
    outlays: 2,
    obligatedAmount: 3
  }
  const result = scaleToUserAmount(base, 0, true)
  expect(result.revenue).toBe(0)
  expect(result.outlays).toBe(0)
  expect(result.obligatedAmount).toBe(0)
})

test('calculates correct percentages and user portions for agency 806 and account 5452', () => {
  // Given values
  const userAmount = 1000;
  const totalBudget = 9.7e12; // 9.7T
  const agency806Amount = 2.43e12; // 2.43T
  const account5452Amount = 19.31e9; // 19.31B

  // Calculate percentages
  const agency806Percentage = calculatePercentage(agency806Amount, totalBudget);
  const account5452Percentage = calculatePercentage(account5452Amount, totalBudget);

  // Verify percentages
  expect(agency806Percentage).toBeCloseTo(25.05, 2); // 2.43T is 25.05% of 9.7T
  expect(account5452Percentage).toBeCloseTo(0.199, 3); // 19.31B is 0.199% of 9.7T

  // Calculate user portions
  const userAgencyPortion = calculateUserPortion(userAmount, agency806Amount, totalBudget);
  const userAccountPortion = calculateUserPortion(userAmount, account5452Amount, totalBudget);

  // Verify user portions
  expect(userAgencyPortion).toBeCloseTo(250.52, 2); // User contributed $250.52 to agency 806
  expect(userAccountPortion).toBeCloseTo(1.99, 2); // User contributed $1.99 to account 5452
});
