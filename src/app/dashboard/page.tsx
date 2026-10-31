'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Coins, 
  CalendarClock, 
  Store, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight,
  Bot,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';
import { useEventContext } from '@/context/EventContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/planning/budgetEngine';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip
} from 'recharts';

const COLORS = ['#7c3aed', '#d946ef', '#f59e0b', '#10b981', '#06b6d4', '#64748b'];

export default function DashboardPage() {
  const { currentPlan, metrics, toggleTaskStatus } = useEventContext();
  const [today, setToday] = React.useState<string>('2026-10-24');

  React.useEffect(() => {
    setToday(new Date().toISOString().split('T')[0]);
  }, []);

  const completedTasks = currentPlan.tasks.filter((t) => t.status === 'completed');
  const overdueTasks = currentPlan.tasks.filter((t) => t.status !== 'completed' && t.dueDate < today);
  const confirmedVendors = currentPlan.vendors.filter((v) => v.bookingStatus === 'confirmed');

  // Chart data for Budget Categories
  const categoryChartData = currentPlan.categories.map((c) => ({
    name: c.name.split('(')[0].trim(),
    value: c.allocatedAmount,
    isContingency: c.isContingency,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Event Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="purple" className="capitalize">{currentPlan.event.eventType} Plan</Badge>
            {currentPlan.event.isDemo && <Badge variant="outline">Interactive Plan</Badge>}
            {metrics.isOverBudget && <Badge variant="danger">Over Budget Alert</Badge>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {currentPlan.event.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-4 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-violet-600" />
              {currentPlan.event.eventDate} {currentPlan.event.eventTime ? `• ${currentPlan.event.eventTime}` : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-violet-600" />
              {currentPlan.event.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-violet-600" />
              {currentPlan.event.guestCount} Guests
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/recovery">
            <Button variant="outline" size="sm" className="font-semibold text-amber-700 border-amber-200 hover:bg-amber-50">
              <ShieldAlert className="mr-1.5 h-4 w-4 text-amber-600" />
              Simulate Crisis
            </Button>
          </Link>
          <Link href="/copilot">
            <Button size="sm" variant="gradient" className="font-bold shadow-soft hover:shadow-glow-purple">
              <Bot className="mr-1.5 h-4 w-4" />
              AI Copilot
            </Button>
          </Link>
        </div>
      </div>

      {/* Over-budget Alert Banner if applicable */}
      {metrics.isOverBudget && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-sm flex items-center justify-between shadow-soft-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            <div>
              <strong className="font-bold">Attention Required:</strong> Expenses currently exceed declared budget by {formatCurrency(metrics.overBudgetAmount, currentPlan.event.currency)}.
            </div>
          </div>
          <Link href="/budget">
            <Button size="sm" variant="danger">Rebalance Budget</Button>
          </Link>
        </div>
      )}

      {/* Clean KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Planned Budget</span>
            <div className="h-7 w-7 rounded-lg bg-purple-50 text-violet-600 flex items-center justify-center">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {formatCurrency(metrics.totalBudget, currentPlan.event.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Allocated: {formatCurrency(metrics.totalAllocated, currentPlan.event.currency)}
          </div>
        </Card>

        {/* KPI 2 */}
        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Committed Spend</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            {formatCurrency(metrics.totalSpent, currentPlan.event.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {metrics.utilizationPercentage}% of budget utilized
          </div>
        </Card>

        {/* KPI 3 */}
        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Remaining Balance</span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black ${metrics.isOverBudget ? 'text-rose-600' : 'text-slate-900'}`}>
            {formatCurrency(metrics.remainingBudget, currentPlan.event.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Contingency: {formatCurrency(metrics.contingencyReserve, currentPlan.event.currency)}
          </div>
        </Card>

        {/* KPI 4 */}
        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Task Progress</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarClock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {completedTasks.length} / {currentPlan.tasks.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {overdueTasks.length > 0 ? (
              <span className="text-rose-600 font-bold">{overdueTasks.length} milestone(s) overdue</span>
            ) : (
              <span className="text-emerald-700 font-semibold">All milestones on time</span>
            )}
          </div>
        </Card>
      </div>

      {/* Main Visualizations & Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Budget Visualizer */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-violet-600" />
                Budget Category Breakdown
              </span>
              <Link href="/budget" className="text-xs text-violet-700 hover:text-violet-800 font-semibold flex items-center">
                Open Workspace <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={55}
                    paddingAngle={3}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isContingency ? '#10b981' : COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                    formatter={(val: any) => [formatCurrency(Number(val) || 0, currentPlan.event.currency), 'Allocated']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-stone-100 text-xs">
              {currentPlan.categories.map((c, i) => (
                <div key={c.id} className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.isContingency ? '#10b981' : COLORS[i % COLORS.length] }}
                  />
                  <span className="truncate text-slate-700 font-medium">{c.name}:</span>
                  <span className="font-bold text-slate-900 ml-auto">{formatCurrency(c.allocatedAmount, currentPlan.event.currency)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Vendors Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <Store className="h-4 w-4 text-emerald-600" />
                Vendors ({confirmedVendors.length}/{currentPlan.vendors.length} Confirmed)
              </span>
              <Link href="/vendors" className="text-xs text-violet-700 hover:text-violet-800 font-semibold flex items-center">
                All Quotes <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentPlan.vendors.slice(0, 4).map((v) => (
              <div key={v.id} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{v.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{v.category} • {formatCurrency(v.quotedPrice, currentPlan.event.currency)}</p>
                </div>
                <Badge variant={v.bookingStatus === 'confirmed' ? 'success' : 'warning'}>
                  {v.bookingStatus}
                </Badge>
              </div>
            ))}
            {currentPlan.vendors.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No vendors added yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between w-full">
            <span className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-violet-600" />
              Upcoming Task Milestones
            </span>
            <Link href="/timeline" className="text-xs text-violet-700 hover:text-violet-800 font-semibold flex items-center">
              Gantt & DAG View <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {currentPlan.tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/80 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleTaskStatus(task.id)}
                    className="focus:outline-none"
                    aria-label={task.status === 'completed' ? 'Mark task incomplete' : 'Mark task complete'}
                  >
                    <CheckCircle2
                      className={`h-5 w-5 ${
                        task.status === 'completed' ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300 hover:text-slate-500'
                      }`}
                    />
                  </button>
                  <div>
                    <span className={`text-xs font-bold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.name}
                    </span>
                    <p className="text-[11px] text-slate-500 font-medium">Due: {task.dueDate} {task.owner ? `• ${task.owner}` : ''}</p>
                  </div>
                </div>

                <Badge
                  variant={
                    task.priority === 'critical'
                      ? 'danger'
                      : task.priority === 'high'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
