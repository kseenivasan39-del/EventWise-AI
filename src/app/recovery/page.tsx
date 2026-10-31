'use client';

import React, { useState } from 'react';
import { 
  CloudRain, 
  Building2, 
  TrendingUp, 
  Scissors, 
  Sparkles, 
  CheckCircle2, 
  GitCommit,
  Check
} from 'lucide-react';
import { useEventContext } from '@/context/EventContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { IncidentType, RecoveryProposal } from '@/types/event';
import { formatCurrency } from '@/lib/planning/budgetEngine';

export default function RecoveryPage() {
  const { currentPlan, addIncident, applyRecovery } = useEventContext();

  const [isSimulating, setIsSimulating] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState<any | null>(null);
  const [appliedProposalId, setAppliedProposalId] = useState<string | null>(null);

  const runSimulation = async (type: IncidentType) => {
    setIsSimulating(true);
    setAppliedProposalId(null);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate_crisis',
          payload: {
            plan: currentPlan,
            incidentType: type,
            details: {
              priceIncreasePercent: 20,
              budgetCutAmount: 50000,
            },
          },
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setActiveSimulation(json.data);
        addIncident(json.data.incident);
      }
    } catch (e) {
      console.error('Failed to simulate recovery scenario', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApplyProposal = async (incidentId: string, proposalId: string) => {
    await applyRecovery(incidentId, proposalId);
    setAppliedProposalId(proposalId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-stone-200/80">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="purple">Signature Competition Differentiator</Badge>
          <Badge variant="warning">Event Recovery Intelligence</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Adaptive Crisis Recovery Workspace
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          When requirements change or sudden disruptions occur, EventWise AI deterministically recalculates affected task dependencies and financial impacts, proposing prioritized recovery alternatives with transparent trade-offs.
        </p>
      </div>

      {/* Scenario Triggers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scenario 1: Venue Cancellation */}
        <Card
          className="cursor-pointer hover:border-violet-400 hover:shadow-soft-lg transition-all p-5 flex flex-col justify-between group"
          onClick={() => runSimulation('venue_cancellation')}
        >
          <div>
            <div className="h-10 w-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Venue Cancellation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mandapam/Venue booking cancels abruptly. Cascades across staging, catering, and guest accommodation.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 w-full text-xs font-semibold group-hover:bg-rose-50 group-hover:text-rose-700 group-hover:border-rose-200"
            isLoading={isSimulating}
          >
            Simulate Venue Crisis
          </Button>
        </Card>

        {/* Scenario 2: Weather Risk */}
        <Card
          className="cursor-pointer hover:border-violet-400 hover:shadow-soft-lg transition-all p-5 flex flex-col justify-between group"
          onClick={() => runSimulation('weather_risk')}
        >
          <div>
            <div className="h-10 w-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <CloudRain className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Heavy Rain Forecast</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              85% precipitation risk. Simulates weatherproofing canopies vs consolidating indoor layouts.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 w-full text-xs font-semibold group-hover:bg-sky-50 group-hover:text-sky-700 group-hover:border-sky-200"
            isLoading={isSimulating}
          >
            Simulate Weather Risk
          </Button>
        </Card>

        {/* Scenario 3: Vendor Price Hike */}
        <Card
          className="cursor-pointer hover:border-violet-400 hover:shadow-soft-lg transition-all p-5 flex flex-col justify-between group"
          onClick={() => runSimulation('vendor_price_hike')}
        >
          <div>
            <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Vendor Price Hike (+20%)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Key caterer or decor vendor raises prices. Evaluates contingency absorption vs scope rationalization.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 w-full text-xs font-semibold group-hover:bg-amber-50 group-hover:text-amber-800 group-hover:border-amber-200"
            isLoading={isSimulating}
          >
            Simulate Price Hike
          </Button>
        </Card>

        {/* Scenario 4: Sudden Budget Cut */}
        <Card
          className="cursor-pointer hover:border-violet-400 hover:shadow-soft-lg transition-all p-5 flex flex-col justify-between group"
          onClick={() => runSimulation('budget_cut')}
        >
          <div>
            <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Scissors className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Budget Cut (-₹50,000)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sponsor or family reduces budget ceiling. Rebalances non-essential tiers while protecting core catering.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 w-full text-xs font-semibold group-hover:bg-purple-50 group-hover:text-purple-800 group-hover:border-purple-200"
            isLoading={isSimulating}
          >
            Simulate Budget Cut
          </Button>
        </Card>
      </div>

      {/* Active Incident & Proposals Comparison View */}
      {activeSimulation && (
        <Card className="border-purple-200 bg-white shadow-soft-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
              <div>
                <Badge variant="danger" className="mb-1 uppercase">
                  Active Incident: {activeSimulation.incident.incidentType}
                </Badge>
                <CardTitle className="text-lg font-black text-slate-900">
                  {activeSimulation.incident.title}
                </CardTitle>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block font-medium">Direct Cost Impact:</span>
                <span className="text-base font-black text-rose-600">
                  {formatCurrency(activeSimulation.directCostImpact, currentPlan.event.currency)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xs text-slate-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200 font-medium">
              {activeSimulation.incident.description}
            </p>

            {/* Impacted Resources Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200">
                <span className="text-slate-500 font-medium block mb-1">Affected Downstream Tasks:</span>
                <span className="font-bold text-slate-900">
                  {activeSimulation.affectedTaskIds.length} Milestone Tasks Impacted
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200">
                <span className="text-slate-500 font-medium block mb-1">Budget Impact Status:</span>
                <span className={`font-bold ${activeSimulation.isBudgetExceeded ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {activeSimulation.isBudgetExceeded ? 'Exceeds Declared Budget Limit' : 'Absorbable within Contingency Buffer'}
                </span>
              </div>
            </div>

            {/* Mitigation Proposals */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                <span>Generated Recovery Proposals (Review & Apply)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSimulation.proposals.map((proposal: RecoveryProposal) => {
                  const isApplied = appliedProposalId === proposal.id || proposal.isApplied;
                  return (
                    <Card key={proposal.id} className="p-5 border-stone-200 bg-stone-50/50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="purple">
                            Feasibility: {Math.round(proposal.feasibilityScore * 100)}%
                          </Badge>
                          <span className="text-xs font-bold text-slate-900">
                            Net Delta: {formatCurrency(proposal.financialImpact, currentPlan.event.currency)}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mb-1.5">{proposal.title}</h4>
                        <p className="text-xs text-slate-600 mb-3 leading-relaxed">{proposal.strategy}</p>

                        <div className="p-3 rounded-xl bg-white border border-stone-200 text-[11px] text-slate-600 mb-4 shadow-soft-sm">
                          <strong className="text-slate-900 block mb-0.5">Explicit Trade-off:</strong>
                          {proposal.tradeoffs}
                        </div>

                        <div className="space-y-1 mb-4 text-[11px] text-slate-600">
                          <span className="font-bold text-slate-900 block mb-1">Actions to Execute:</span>
                          {proposal.actions.map((act, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span className="text-violet-600 font-bold">•</span>
                              <span>{act.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {isApplied ? (
                        <div className="w-full py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5">
                          <Check className="h-4 w-4" /> Applied to Persistent Records
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="gradient"
                          onClick={() => handleApplyProposal(activeSimulation.incident.id, proposal.id)}
                          className="w-full font-bold shadow-soft hover:shadow-glow-purple"
                        >
                          <CheckCircle2 className="mr-1.5 h-4 w-4" />
                          Approve & Apply Recovery Plan
                        </Button>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Incidents & Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-4 w-4 text-slate-500" />
            <span>Incident Audit History & Applied Recovery Actions ({currentPlan.auditLogs.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPlan.auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No incident records yet. Simulate an event crisis above to test the recovery engine.</p>
          ) : (
            <div className="space-y-3">
              {currentPlan.auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 uppercase text-[11px]">{log.action}</span>
                    <p className="text-slate-600 mt-0.5">
                      {typeof log.details?.proposalTitle === 'string'
                        ? log.details.proposalTitle
                        : typeof log.details?.message === 'string'
                        ? log.details.message
                        : JSON.stringify(log.details)}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap ml-4 font-medium">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
