'use client';

import React, { useState } from 'react';
import { 
  Coins, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  Receipt, 
  Check, 
  Sparkles,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import { useEventContext } from '@/context/EventContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, validateCategoryAllocations } from '@/lib/planning/budgetEngine';

export default function BudgetPage() {
  const { currentPlan, metrics, updateCategory, addCategory, addExpense } = useEventContext();

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState<number>(0);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatAmount, setNewCatAmount] = useState('');
  const [showCatModal, setShowCatModal] = useState(false);

  // New Expense State
  const [expName, setExpName] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCatId, setExpCatId] = useState(currentPlan.categories[0]?.id || '');
  const [showExpModal, setShowExpModal] = useState(false);

  const startEdit = (catId: string, currentVal: number) => {
    setIsEditing(catId);
    setTempAmount(currentVal);
  };

  const saveEdit = (catId: string) => {
    updateCategory(catId, tempAmount);
    setIsEditing(null);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newCatAmount);
    if (!newCatName || isNaN(amount) || amount < 0) return;

    addCategory({
      name: newCatName,
      allocatedAmount: amount,
      spentAmount: 0,
      isContingency: false,
    });
    setNewCatName('');
    setNewCatAmount('');
    setShowCatModal(false);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expAmount);
    if (!expName || isNaN(amount) || amount <= 0 || !expCatId) return;

    addExpense({
      categoryId: expCatId,
      name: expName,
      amount,
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
    });
    setExpName('');
    setExpAmount('');
    setShowExpModal(false);
  };

  const allocationValidation = validateCategoryAllocations(currentPlan.event.budgetTotal, currentPlan.categories);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div>
          <Badge variant="purple" className="mb-1">Deterministic Planning Engine</Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Budget Optimization Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain strict fiscal invariants. Allocations, contingency reserves, and expenses are calculated deterministically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowExpModal(true)}>
            <Receipt className="mr-1.5 h-4 w-4 text-emerald-600" />
            Record Expense
          </Button>
          <Button size="sm" variant="gradient" onClick={() => setShowCatModal(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Over-budget or Over-allocation alerts */}
      {(!allocationValidation.isValid || metrics.isOverBudget) && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-sm flex items-start gap-3 shadow-soft-sm">
          <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Budget Invariant Alert:</strong>{' '}
            {!allocationValidation.isValid
              ? allocationValidation.error
              : `Total expenses exceed budget by ${formatCurrency(metrics.overBudgetAmount, currentPlan.event.currency)}`}
          </div>
        </div>
      )}

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Declared Total Budget</span>
          <span className="text-xl font-black text-slate-900">
            {formatCurrency(metrics.totalBudget, currentPlan.event.currency)}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Total Category Allocations</span>
          <span className="text-xl font-black text-violet-700">
            {formatCurrency(metrics.totalAllocated, currentPlan.event.currency)}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Actual Expenses Recorded</span>
          <span className="text-xl font-black text-emerald-700">
            {formatCurrency(metrics.totalSpent, currentPlan.event.currency)}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Contingency Reserve</span>
          <span className="text-xl font-black text-amber-700">
            {formatCurrency(metrics.contingencyReserve, currentPlan.event.currency)}
          </span>
        </Card>
      </div>

      {/* Categories Table / Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-violet-600" />
            <span>Configured Budget Allocations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-slate-500 border-b border-stone-200/80 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Allocated Amount</th>
                  <th className="py-3 px-4 text-right">% of Total</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {currentPlan.categories.map((cat) => {
                  const pct = metrics.totalBudget > 0 ? Math.round((cat.allocatedAmount / metrics.totalBudget) * 100) : 0;
                  return (
                    <tr key={cat.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {cat.name}
                        {cat.notes && <span className="block text-[11px] text-slate-400 font-normal">{cat.notes}</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {cat.isContingency ? (
                          <Badge variant="warning">Contingency Reserve</Badge>
                        ) : (
                          <Badge variant="default">Operational</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        {isEditing === cat.id ? (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <input
                              type="number"
                              min="0"
                              value={tempAmount}
                              onChange={(e) => setTempAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-28 bg-white border border-violet-500 rounded-lg px-2 py-1 text-right text-xs text-slate-900 font-bold"
                            />
                            <button
                              onClick={() => saveEdit(cat.id)}
                              className="p-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          formatCurrency(cat.allocatedAmount, currentPlan.event.currency)
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 font-semibold">
                        {pct}%
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isEditing !== cat.id && (
                          <button
                            onClick={() => startEdit(cat.id, cat.allocatedAmount)}
                            className="text-xs text-violet-700 hover:text-violet-800 font-bold"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expenses History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-emerald-600" />
            <span>Recorded Invoices & Outgoing Payments ({currentPlan.expenses.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPlan.expenses.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No expenses recorded yet. Click "Record Expense" to add paid receipts or deposits.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-slate-500 border-b border-stone-200/80 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Expense Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {currentPlan.expenses.map((exp) => {
                    const cat = currentPlan.categories.find((c) => c.id === exp.categoryId);
                    return (
                      <tr key={exp.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{exp.name}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{cat?.name || 'General'}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant={exp.status === 'paid' ? 'success' : 'purple'}>
                            {exp.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{exp.paidDate || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                          {formatCurrency(exp.amount, currentPlan.event.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Add Category */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-soft-lg">
            <h3 className="text-base font-bold text-slate-900">Add Budget Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="E.g., Audiovisual & Lighting"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Allocated Amount ({currentPlan.event.currency})</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newCatAmount}
                  onChange={(e) => setNewCatAmount(e.target.value)}
                  placeholder="25000"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCatModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" size="sm">
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Expense */}
      {showExpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-soft-lg">
            <h3 className="text-base font-bold text-slate-900">Record Paid Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  value={expName}
                  onChange={(e) => setExpName(e.target.value)}
                  placeholder="E.g., Catering 30% Booking Advance"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Category</label>
                <select
                  value={expCatId}
                  onChange={(e) => setExpCatId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {currentPlan.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Amount ({currentPlan.event.currency})</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="30000"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowExpModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" size="sm">
                  Record Transaction
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
