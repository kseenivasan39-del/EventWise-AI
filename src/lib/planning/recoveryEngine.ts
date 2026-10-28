import { 
  FullEventPlan, 
  Incident, 
  RecoveryProposal, 
  IncidentType, 
  RecoveryAction 
} from '@/types/event';
import { getDownstreamImpact } from './dependencyEngine';
import { calculateBudgetMetrics } from './budgetEngine';

export interface RecoverySimulationResult {
  incident: Incident;
  directCostImpact: number;
  indirectCostImpact: number;
  totalCostImpact: number;
  affectedTaskIds: string[];
  affectedVendorIds: string[];
  proposals: RecoveryProposal[];
  isBudgetExceeded: boolean;
  projectedNewTotalSpent: number;
}

/**
 * Deterministic Crisis Recovery Intelligence Engine.
 * Analyzes an incident, traces task graph impacts, recomputes financial repercussions,
 * and generates constraint-aware mitigation proposals with explicit trade-offs.
 */
export function simulateCrisisRecovery(
  plan: FullEventPlan,
  type: IncidentType,
  details: {
    title?: string;
    description?: string;
    targetVendorId?: string;
    targetTaskId?: string;
    priceIncreasePercent?: number; // e.g. 20 for 20%
    budgetCutAmount?: number;
    delayDays?: number;
  }
): RecoverySimulationResult {
  const incidentId = crypto.randomUUID();
  const currentMetrics = calculateBudgetMetrics(plan.event.budgetTotal, plan.categories, plan.expenses);

  let directCostImpact = 0;
  let affectedTaskIds: string[] = [];
  let affectedVendorIds: string[] = [];
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let defaultTitle = '';
  let defaultDesc = '';

  const proposals: RecoveryProposal[] = [];

  switch (type) {
    case 'venue_cancellation': {
      severity = 'critical';
      defaultTitle = 'Venue Booking Abruptly Cancelled';
      defaultDesc = 'The primary venue cancelled the booking. All on-site staging, catering setup, and guest accommodations are frozen.';
      
      const venueVendor = plan.vendors.find((v) => v.category.toLowerCase().includes('venue')) || plan.vendors[0];
      if (venueVendor) {
        affectedVendorIds.push(venueVendor.id);
      }
      
      const venueTasks = plan.tasks.filter((t) => 
        t.name.toLowerCase().includes('venue') || 
        t.description?.toLowerCase().includes('venue') ||
        (venueVendor && t.vendorId === venueVendor.id)
      );

      const allAffectedTasks = new Set<string>();
      venueTasks.forEach((vt) => {
        allAffectedTasks.add(vt.id);
        const impact = getDownstreamImpact(vt.id, plan.tasks);
        impact.downstreamTaskIds.forEach((id) => allAffectedTasks.add(id));
      });
      affectedTaskIds = Array.from(allAffectedTasks);

      // Proposal 1: Emergency Rebooking + Contingency Draw
      const contingencyAvailable = currentMetrics.contingencyReserve;
      const expectedPremium = 35000;
      directCostImpact = expectedPremium;

      proposals.push({
        id: crypto.randomUUID(),
        incidentId,
        title: 'Emergency Partner Venue Activation & Contingency Reserve',
        strategy: 'Contract pre-vetted indoor banquet partner within 5km radius. Draw ₹35,000 from contingency reserve to cover express turnaround and retain all dates.',
        feasibilityScore: 0.92,
        financialImpact: expectedPremium,
        timelineImpactDays: 1,
        tradeoffs: 'Consumes ₹35,000 contingency reserve, but preserves date, decor commitments, and avoids guest rescheduling.',
        actions: [
          {
            actionType: 'activate_contingency',
            description: `Transfer ₹${expectedPremium.toLocaleString('en-IN')} from Contingency to Venue allocation`,
            costDelta: expectedPremium,
          },
          {
            actionType: 'replace_vendor',
            description: 'Issue immediate RFP to pre-verified partner venue',
            costDelta: 0,
            targetId: venueVendor?.id,
          },
        ],
        isApplied: false,
      });

      // Proposal 2: Date Reschedule
      proposals.push({
        id: crypto.randomUUID(),
        incidentId,
        title: 'Schedule Shift to Off-Peak Weekend Date',
        strategy: 'Postpone event by 14 days to secure venue at standard contract rate without premium markup.',
        feasibilityScore: 0.78,
        financialImpact: 0,
        timelineImpactDays: 14,
        tradeoffs: 'Zero financial cost increase, but requires sending change-of-date notifications to all guests.',
        actions: [
          {
            actionType: 'shift_timeline',
            description: 'Postpone overall event date by 14 days and propagate deadlines',
            costDelta: 0,
          },
        ],
        isApplied: false,
      });
      break;
    }

    case 'weather_risk': {
      severity = 'high';
      defaultTitle = 'Heavy Rain Forecast (Outdoor Area Compromised)';
      defaultDesc = 'Meteorological risk: 85% probability of heavy precipitation during the event window. Outdoor areas cannot be safely utilized.';
      
      const outdoorTasks = plan.tasks.filter((t) => 
        t.name.toLowerCase().includes('decor') || 
        t.name.toLowerCase().includes('stage') ||
        t.name.toLowerCase().includes('outdoor')
      );
      affectedTaskIds = outdoorTasks.map((t) => t.id);

      const waterproofCanopyCost = 20000;
      directCostImpact = waterproofCanopyCost;

      // Proposal 1: Rapid Weatherproofing
      proposals.push({
        id: crypto.randomUUID(),
        incidentId,
        title: 'Install Modular German Waterproof Canopy & Industrial Flooring',
        strategy: 'Deploy heavy-duty waterproof hanger structures with elevated wooden platform flooring for all guest dining and seating sections.',
        feasibilityScore: 0.95,
        financialImpact: waterproofCanopyCost,
        timelineImpactDays: 0,
        tradeoffs: 'Adds ₹20,000 infrastructure cost; leaves outdoor schedule 100% on time regardless of weather.',
        actions: [
          {
            actionType: 'reallocate_budget',
            description: 'Allocate ₹20,000 from Contingency to Logistics/Equipment for all-weather structures',
            costDelta: waterproofCanopyCost,
          },
        ],
        isApplied: false,
      });

      // Proposal 2: Pivot to Full Indoor Layout
      proposals.push({
        id: crypto.randomUUID(),
        incidentId,
        title: 'Compress Layout into Covered Ballroom / Indoor Hall',
        strategy: 'Eliminate outdoor lawns and redesign seating inside existing indoor hall space.',
        feasibilityScore: 0.84,
        financialImpact: -5000,
        timelineImpactDays: 0,
        tradeoffs: 'Saves ₹5,000 in outdoor lighting rentals, but guest lounge area will feel more intimate/compact.',
        actions: [
          {
            actionType: 'reduce_scope',
            description: 'Cancel outdoor lawn lighting setup and consolidate in Main Hall',
            costDelta: -5000,
          },
        ],
        isApplied: false,
      });
      break;
    }

    case 'vendor_price_hike': {
      severity = 'medium';
      const pct = details.priceIncreasePercent || 20;
      const targetVendor = plan.vendors.find((v) => v.id === details.targetVendorId) || plan.vendors[0];
      
      if (targetVendor) {
        affectedVendorIds.push(targetVendor.id);
        const originalQuote = targetVendor.quotedPrice;
        const hikeAmount = Math.round((originalQuote * pct) / 100);
        directCostImpact = hikeAmount;

        defaultTitle = `Quote Revision: ${targetVendor.name} (+${pct}%)`;
        defaultDesc = `Vendor ${targetVendor.name} submitted an unnegotiated price hike of ₹${hikeAmount.toLocaleString('en-IN')} (+${pct}%) citing supply chain surge.`;

        // Proposal 1: Renegotiate Scope to absorb hike
        proposals.push({
          id: crypto.randomUUID(),
          incidentId,
          title: 'Scope Rationalization (Neutral Budget)',
          strategy: `Reduce secondary deliverables with ${targetVendor.name} to maintain the original contract ceiling.`,
          feasibilityScore: 0.90,
          financialImpact: 0,
          timelineImpactDays: 0,
          tradeoffs: `Retains vendor relationship without budget expansion; eliminates auxiliary tier deliverables.`,
          actions: [
            {
              actionType: 'reduce_scope',
              description: `Cap ${targetVendor.name} contract at original quote: ₹${originalQuote.toLocaleString('en-IN')}`,
              costDelta: 0,
              targetId: targetVendor.id,
            },
          ],
          isApplied: false,
        });

        // Proposal 2: Absorb into Contingency
        proposals.push({
          id: crypto.randomUUID(),
          incidentId,
          title: 'Absorb Price Hike via Category Contingency Reserve',
          strategy: `Approve the ₹${hikeAmount.toLocaleString('en-IN')} increase and offset it using the unallocated or contingency reserve.`,
          feasibilityScore: 0.98,
          financialImpact: hikeAmount,
          timelineImpactDays: 0,
          tradeoffs: `Zero impact on service delivery quality; decreases remaining contingency by ₹${hikeAmount.toLocaleString('en-IN')}.`,
          actions: [
            {
              actionType: 'activate_contingency',
              description: `Offset ₹${hikeAmount.toLocaleString('en-IN')} quote increase via contingency reserve`,
              costDelta: hikeAmount,
              targetId: targetVendor.id,
            },
          ],
          isApplied: false,
        });
      }
      break;
    }

    case 'budget_cut': {
      severity = 'high';
      const cut = details.budgetCutAmount || 50000;
      directCostImpact = -cut;
      defaultTitle = `Budget Revision: -₹${cut.toLocaleString('en-IN')}`;
      defaultDesc = `Event sponsor or family requested an immediate ₹${cut.toLocaleString('en-IN')} budget consolidation.`;

      // Proposal 1: Optimize Non-Core Categories (Decor & Favors)
      proposals.push({
        id: crypto.randomUUID(),
        incidentId,
        title: 'Targeted Trimming of Non-Core Enhancements',
        strategy: `Trim decor extravagance, invitations, and discretionary photography packages by ₹${cut.toLocaleString('en-IN')} while keeping food and venue completely uncompromised.`,
        feasibilityScore: 0.92,
        financialImpact: -cut,
        timelineImpactDays: 0,
        tradeoffs: 'Protects core dining and hospitality experience 100%; decor transitions from premium floral to elegant minimalist aesthetic.',
        actions: [
          {
            actionType: 'reduce_scope',
            description: `Reduce Decor allocation by ₹${Math.round(cut * 0.6).toLocaleString('en-IN')} and Invitations/Favors by ₹${Math.round(cut * 0.4).toLocaleString('en-IN')}`,
            costDelta: -cut,
          },
        ],
        isApplied: false,
      });
      break;
    }

    default: {
      defaultTitle = details.title || 'Operational Conflict Identified';
      defaultDesc = details.description || 'An operational contingency requires automated plan recalculation.';
      severity = 'medium';
    }
  }

  const incident: Incident = {
    id: incidentId,
    eventId: plan.event.id,
    incidentType: type,
    severity,
    title: details.title || defaultTitle,
    description: details.description || defaultDesc,
    costImpact: directCostImpact,
    status: 'active',
    affectedTaskIds,
    affectedVendorIds,
    proposals,
    createdAt: new Date().toISOString(),
  };

  const projectedNewTotalSpent = currentMetrics.totalSpent + directCostImpact;
  const isBudgetExceeded = projectedNewTotalSpent > plan.event.budgetTotal;

  return {
    incident,
    directCostImpact,
    indirectCostImpact: 0,
    totalCostImpact: directCostImpact,
    affectedTaskIds,
    affectedVendorIds,
    proposals,
    isBudgetExceeded,
    projectedNewTotalSpent,
  };
}

/**
 * Transactionally applies an approved recovery proposal to the plan,
 * updating budgets, category allocations, tasks, and creating an audit record.
 */
export function applyRecoveryProposal(
  plan: FullEventPlan,
  incidentId: string,
  proposalId: string
): FullEventPlan {
  const incidentIndex = plan.incidents.findIndex((i) => i.id === incidentId);
  if (incidentIndex === -1) {
    throw new Error(`Incident ${incidentId} not found`);
  }

  const incident = plan.incidents[incidentIndex];
  const proposalIndex = incident.proposals.findIndex((p) => p.id === proposalId);
  if (proposalIndex === -1) {
    throw new Error(`Recovery proposal ${proposalId} not found`);
  }

  const proposal = incident.proposals[proposalIndex];
  const updatedCategories = [...plan.categories];
  const updatedExpenses = [...plan.expenses];
  const updatedTasks = [...plan.tasks];
  const updatedVendors = [...plan.vendors];

  // Execute each action
  for (const action of proposal.actions) {
    if (action.actionType === 'activate_contingency') {
      const contingencyCat = updatedCategories.find((c) => c.isContingency);
      if (contingencyCat && action.costDelta > 0) {
        contingencyCat.allocatedAmount = Math.max(0, contingencyCat.allocatedAmount - action.costDelta);
      }
    } else if (action.actionType === 'replace_vendor' && action.targetId) {
      const vendor = updatedVendors.find((v) => v.id === action.targetId);
      if (vendor) {
        vendor.bookingStatus = 'cancelled';
        vendor.notes = `${vendor.notes || ''} [Cancelled due to incident: ${incident.title}]`;
      }
    } else if (action.actionType === 'shift_timeline') {
      // Shift dates if required
      updatedTasks.forEach((t) => {
        if (incident.affectedTaskIds.includes(t.id)) {
          const date = new Date(t.dueDate);
          date.setDate(date.getDate() + proposal.timelineImpactDays);
          t.dueDate = date.toISOString().split('T')[0];
        }
      });
    }
  }

  // Update proposal status
  const updatedProposals = incident.proposals.map((p, idx) => 
    idx === proposalIndex ? { ...p, isApplied: true, appliedAt: new Date().toISOString() } : p
  );

  const updatedIncident = {
    ...incident,
    status: 'mitigated' as const,
    proposals: updatedProposals,
  };

  const updatedIncidents = [...plan.incidents];
  updatedIncidents[incidentIndex] = updatedIncident;

  const auditRecord = {
    id: crypto.randomUUID(),
    eventId: plan.event.id,
    action: 'APPLY_RECOVERY_PROPOSAL',
    details: {
      incidentId,
      incidentTitle: incident.title,
      proposalId,
      proposalTitle: proposal.title,
      strategy: proposal.strategy,
      financialImpact: proposal.financialImpact,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  return {
    ...plan,
    categories: updatedCategories,
    expenses: updatedExpenses,
    tasks: updatedTasks,
    vendors: updatedVendors,
    incidents: updatedIncidents,
    auditLogs: [auditRecord, ...plan.auditLogs],
  };
}
