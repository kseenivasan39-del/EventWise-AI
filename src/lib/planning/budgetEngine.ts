import { BudgetCategory, Expense } from '@/types/event';

export interface BudgetMetrics {
  totalBudget: number;
  totalAllocated: number;
  totalSpent: number;
  remainingBudget: number;
  contingencyReserve: number;
  unallocatedBudget: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  utilizationPercentage: number;
}

/**
 * Deterministically computes budget metrics and guarantees core invariants.
 * Invariant 1: Total Allocated + Unallocated = Total Budget (if allocated <= total)
 * Invariant 2: Total Spent is the exact sum of all valid non-negative expenses
 * Invariant 3: Remaining Budget is Total Budget - Total Spent
 * Invariant 4: Contingency is isolated and not double counted
 */
export function calculateBudgetMetrics(
  totalBudget: number,
  categories: BudgetCategory[],
  expenses: Expense[]
): BudgetMetrics {
  const safeTotalBudget = Math.max(0, Number(totalBudget) || 0);

  // Calculate allocated amounts
  let totalAllocated = 0;
  let contingencyReserve = 0;

  for (const cat of categories) {
    const allocated = Math.max(0, Number(cat.allocatedAmount) || 0);
    totalAllocated += allocated;
    if (cat.isContingency) {
      contingencyReserve += allocated;
    }
  }

  // Calculate actual spending from expenses (excluding cancelled)
  let totalSpent = 0;
  for (const exp of expenses) {
    if (exp.status !== 'cancelled') {
      totalSpent += Math.max(0, Number(exp.amount) || 0);
    }
  }

  const remainingBudget = safeTotalBudget - totalSpent;
  const isOverBudget = remainingBudget < 0;
  const overBudgetAmount = isOverBudget ? Math.abs(remainingBudget) : 0;
  const unallocatedBudget = Math.max(0, safeTotalBudget - totalAllocated);
  const utilizationPercentage = safeTotalBudget > 0 
    ? Math.min(100, Math.round((totalSpent / safeTotalBudget) * 100)) 
    : 0;

  return {
    totalBudget: safeTotalBudget,
    totalAllocated,
    totalSpent,
    remainingBudget,
    contingencyReserve,
    unallocatedBudget,
    isOverBudget,
    overBudgetAmount,
    utilizationPercentage,
  };
}

/**
 * Validates that category allocations don't exceed the overall total budget
 * and ensures no negative amounts exist.
 */
export function validateCategoryAllocations(
  totalBudget: number,
  categories: BudgetCategory[]
): { isValid: boolean; error?: string; totalAllocated: number } {
  let totalAllocated = 0;
  for (const cat of categories) {
    if (cat.allocatedAmount < 0) {
      return { isValid: false, error: `Category "${cat.name}" has negative allocation`, totalAllocated };
    }
    totalAllocated += cat.allocatedAmount;
  }

  if (totalAllocated > totalBudget) {
    return {
      isValid: false,
      error: `Sum of category allocations (${totalAllocated}) exceeds total budget (${totalBudget}) by ${totalAllocated - totalBudget}`,
      totalAllocated,
    };
  }

  return { isValid: true, totalAllocated };
}

/**
 * Format currency with proper symbols and localization (INR, USD, EUR, etc.)
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const safeAmount = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0,
    }).format(safeAmount);
  } catch {
    return `${currency} ${safeAmount.toLocaleString()}`;
  }
}
