import { test, expect } from "bun:test";
import { calculateRatios, scaleToUserAmount, type BudgetNumbers } from './budgetMath'

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
