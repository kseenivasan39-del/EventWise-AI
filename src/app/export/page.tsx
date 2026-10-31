'use client';

import React, { useRef } from 'react';
import { 
  Printer, 
  Download, 
  Coins, 
  CalendarClock,
  Store
} from 'lucide-react';
import { useEventContext } from '@/context/EventContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/planning/budgetEngine';

export default function ExportPage() {
  const { currentPlan, metrics } = useEventContext();
  const printableRef = useRef<HTMLDivElement>(null);
  const [currentDateStr, setCurrentDateStr] = React.useState('2026-10-24');

  React.useEffect(() => {
    setCurrentDateStr(new Date().toLocaleDateString());
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentPlan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentPlan.event.name.replace(/\s+/g, '_')}_Plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Action Header - Hidden on Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200/80 print:hidden">
        <div>
          <Badge variant="purple" className="mb-1">Export & Documentation</Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Event Executive Summary
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Printable audit-ready briefing dossier for organizers, venues, and sponsors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleDownloadJson}>
            <Download className="mr-1.5 h-4 w-4" />
            Export JSON
          </Button>
          <Button size="sm" variant="gradient" onClick={handlePrint} className="font-bold shadow-soft hover:shadow-glow-purple">
            <Printer className="mr-1.5 h-4 w-4" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Printable Dossier Container */}
      <div ref={printableRef} className="space-y-6 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-soft-lg print:shadow-none print:border-none print:p-0">
        {/* Dossier Header */}
        <div className="border-b border-stone-200 pb-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-700 uppercase tracking-widest">
              EventWise AI Planning Dossier
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Generated: {currentDateStr}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {currentPlan.event.name}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs font-medium">
            <div>
              <span className="text-slate-400 block text-[11px]">Occasion Type</span>
              <strong className="text-slate-900 capitalize font-bold">{currentPlan.event.eventType}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Event Date</span>
              <strong className="text-slate-900 font-bold">{currentPlan.event.eventDate}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Location</span>
              <strong className="text-slate-900 font-bold">{currentPlan.event.location}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Guest Count</span>
              <strong className="text-slate-900 font-bold">{currentPlan.event.guestCount} Guests</strong>
            </div>
          </div>
        </div>

        {/* Financial Executive Summary */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Coins className="h-4 w-4 text-violet-600" />
            <span>Budget & Financial Allocations</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-slate-500 block mb-0.5">Declared Budget</span>
              <span className="text-base font-black text-slate-900">
                {formatCurrency(metrics.totalBudget, currentPlan.event.currency)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
              <span className="text-purple-700 block mb-0.5">Total Allocated</span>
              <span className="text-base font-black text-violet-800">
                {formatCurrency(metrics.totalAllocated, currentPlan.event.currency)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-emerald-700 block mb-0.5">Expenses Paid</span>
              <span className="text-base font-black text-emerald-800">
                {formatCurrency(metrics.totalSpent, currentPlan.event.currency)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
              <span className="text-amber-700 block mb-0.5">Contingency Reserve</span>
              <span className="text-base font-black text-amber-800">
                {formatCurrency(metrics.contingencyReserve, currentPlan.event.currency)}
              </span>
            </div>
          </div>

          <table className="w-full text-left text-xs divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden">
            <thead className="bg-stone-50 text-slate-500 font-bold">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Allocated</th>
                <th className="p-3 text-right">% Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {currentPlan.categories.map((c) => (
                <tr key={c.id}>
                  <td className="p-3 font-semibold text-slate-800">{c.name}</td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    {formatCurrency(c.allocatedAmount, currentPlan.event.currency)}
                  </td>
                  <td className="p-3 text-right text-slate-500 font-semibold">
                    {metrics.totalBudget > 0 ? Math.round((c.allocatedAmount / metrics.totalBudget) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Milestone Schedule */}
        <div className="pt-4 border-t border-stone-200">
          <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-violet-600" />
            <span>Master Milestone Schedule</span>
          </h3>

          <div className="space-y-2 text-xs">
            {currentPlan.tasks.map((task) => (
              <div key={task.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{task.name}</span>
                  <span className="text-[11px] text-slate-500 font-medium">Due: {task.dueDate} {task.owner ? `• ${task.owner}` : ''}</span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-slate-700">
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vendors Directory */}
        <div className="pt-4 border-t border-stone-200">
          <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Store className="h-4 w-4 text-emerald-600" />
            <span>Contracted & Quoted Vendors</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {currentPlan.vendors.map((vendor) => (
              <div key={vendor.id} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-slate-900 font-bold">{vendor.name}</strong>
                  <span className="font-bold text-emerald-700">
                    {formatCurrency(vendor.quotedPrice, currentPlan.event.currency)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">{vendor.category} • Status: {vendor.bookingStatus}</p>
                {vendor.contactPhone && <p className="text-[11px] text-slate-500 mt-1">📞 {vendor.contactPhone}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Verification Stamp */}
        <div className="pt-6 border-t border-stone-200 text-center text-xs text-slate-400 font-medium">
          Verified with EventWise AI Planning Pipeline & Invariant Checks.
        </div>
      </div>
    </div>
  );
}
