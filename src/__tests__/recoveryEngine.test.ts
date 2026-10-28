import { describe, it, expect } from 'vitest';
import { simulateCrisisRecovery, applyRecoveryProposal } from '../lib/planning/recoveryEngine';
import { TAMIL_WEDDING_DEMO } from '../lib/data/sampleScenarios';

describe('Event Recovery Intelligence Engine', () => {
  it('correctly simulates a venue cancellation with dependency propagation and contingency proposals', () => {
    const plan = JSON.parse(JSON.stringify(TAMIL_WEDDING_DEMO));
    const result = simulateCrisisRecovery(plan, 'venue_cancellation', {});

    expect(result.incident.severity).toBe('critical');
    expect(result.incident.incidentType).toBe('venue_cancellation');
    expect(result.proposals.length).toBeGreaterThan(0);
    expect(result.affectedTaskIds.length).toBeGreaterThan(0);

    // Verify proposals have concrete feasibility and actions
    const firstProposal = result.proposals[0];
    expect(firstProposal.feasibilityScore).toBeGreaterThan(0.7);
    expect(firstProposal.actions.some((a) => a.actionType === 'activate_contingency')).toBe(true);
  });

  it('correctly calculates vendor price hike impact', () => {
    const plan = JSON.parse(JSON.stringify(TAMIL_WEDDING_DEMO));
    const caterer = plan.vendors.find((v: any) => v.category === 'Catering');
    
    const result = simulateCrisisRecovery(plan, 'vendor_price_hike', {
      targetVendorId: caterer.id,
      priceIncreasePercent: 20,
    });

    const expectedHike = caterer.quotedPrice * 0.20; // 135000 * 0.2 = 27000
    expect(result.directCostImpact).toBe(expectedHike);
    expect(result.incident.affectedVendorIds).toContain(caterer.id);
  });

  it('transactionally applies an approved recovery proposal and generates an audit log', () => {
    const plan = JSON.parse(JSON.stringify(TAMIL_WEDDING_DEMO));
    const sim = simulateCrisisRecovery(plan, 'venue_cancellation', {});
    plan.incidents.push(sim.incident);

    const proposalToApply = sim.proposals[0];
    const initialContingency = plan.categories.find((c: any) => c.isContingency)?.allocatedAmount || 0;

    const updatedPlan = applyRecoveryProposal(plan, sim.incident.id, proposalToApply.id);

    // Verify proposal status
    const appliedIncident = updatedPlan.incidents.find((i) => i.id === sim.incident.id);
    expect(appliedIncident?.status).toBe('mitigated');
    expect(appliedIncident?.proposals[0].isApplied).toBe(true);

    // Verify audit trail
    expect(updatedPlan.auditLogs[0].action).toBe('APPLY_RECOVERY_PROPOSAL');
    expect(updatedPlan.auditLogs[0].details.proposalId).toBe(proposalToApply.id);

    // Verify contingency was debited
    const updatedContingency = updatedPlan.categories.find((c: any) => c.isContingency)?.allocatedAmount || 0;
    expect(updatedContingency).toBeLessThan(initialContingency);
  });
});
