import { describe, it, expect } from 'vitest';
import { calculateBudgetMetrics, validateCategoryAllocations } from '../lib/planning/budgetEngine';
import { BudgetCategory, Expense } from '../types/event';

describe('BudgetEngine Deterministic Invariants', () => {
  const sampleCategories: BudgetCategory[] = [
    { id: '1', eventId: 'e1', name: 'Venue', allocatedAmount: 150000, spentAmount: 0, isContingency: false },
    { id: '2', eventId: 'e1', name: 'Catering', allocatedAmount: 150000, spentAmount: 0, isContingency: false },
    { id: '3', eventId: 'e1', name: 'Decor', allocatedAmount: 100000, spentAmount: 0, isContingency: false },
    { id: '4', eventId: 'e1', name: 'Contingency', allocatedAmount: 50000, spentAmount: 0, isContingency: true },
  ];

  it('correctly calculates total allocated, remaining budget, and contingency isolation', () => {
    const expenses: Expense[] = [
      { id: 'x1', eventId: 'e1', categoryId: '1', name: 'Venue Advance', amount: 50000, status: 'paid' },
      { id: 'x2', eventId: 'e1', categoryId: '2', name: 'Food Deposit', amount: 30000, status: 'deposit_paid' },
      { id: 'x3', eventId: 'e1', categoryId: '3', name: 'Cancelled Decor', amount: 20000, status: 'cancelled' },
    ];

    const metrics = calculateBudgetMetrics(500000, sampleCategories, expenses);

    expect(metrics.totalBudget).toBe(500000);
    expect(metrics.totalAllocated).toBe(450000); // 150k + 150k + 100k + 50k
    expect(metrics.unallocatedBudget).toBe(50000); // 500k - 450k
    expect(metrics.contingencyReserve).toBe(50000);
    expect(metrics.totalSpent).toBe(80000); // 50k + 30k (cancelled 20k excluded)
    expect(metrics.remainingBudget).toBe(420000); // 500k - 80k
    expect(metrics.isOverBudget).toBe(false);
    expect(metrics.overBudgetAmount).toBe(0);
  });

  it('detects over-budget conditions accurately when expenses exceed total budget', () => {
    const overExpenses: Expense[] = [
      { id: 'x1', eventId: 'e1', categoryId: '1', name: 'Luxury Hall', amount: 400000, status: 'paid' },
      { id: 'x2', eventId: 'e1', categoryId: '2', name: 'Exotic Banquet', amount: 150000, status: 'paid' },
    ];

    const metrics = calculateBudgetMetrics(500000, sampleCategories, overExpenses);
    expect(metrics.totalSpent).toBe(550000);
    expect(metrics.remainingBudget).toBe(-50000);
    expect(metrics.isOverBudget).toBe(true);
    expect(metrics.overBudgetAmount).toBe(50000);
  });

  it('validates category allocation bounds against total budget', () => {
    const valid = validateCategoryAllocations(500000, sampleCategories);
    expect(valid.isValid).toBe(true);
    expect(valid.totalAllocated).toBe(450000);

    const oversizedCategories: BudgetCategory[] = [
      ...sampleCategories,
      { id: '5', eventId: 'e1', name: 'Extras', allocatedAmount: 100000, spentAmount: 0, isContingency: false },
    ];

    const invalid = validateCategoryAllocations(500000, oversizedCategories);
    expect(invalid.isValid).toBe(false);
    expect(invalid.error).toContain('exceeds total budget');
  });
});
