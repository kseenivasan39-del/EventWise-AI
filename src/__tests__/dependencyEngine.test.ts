import { describe, it, expect } from 'vitest';
import { validateTaskDependencies, getDownstreamImpact } from '../lib/planning/dependencyEngine';
import { Task } from '../types/event';

describe('DependencyEngine Graph Traversal & Cycle Detection', () => {
  it('detects and reports circular dependencies using topological sort', () => {
    // A -> B -> C -> A
    const tasks: Task[] = [
      { id: 't1', eventId: 'e1', name: 'Task A', status: 'todo', priority: 'medium', dueDate: '2026-11-01', estimatedCost: 0, actualCost: 0, dependencies: ['t3'] },
      { id: 't2', eventId: 'e1', name: 'Task B', status: 'todo', priority: 'medium', dueDate: '2026-11-05', estimatedCost: 0, actualCost: 0, dependencies: ['t1'] },
      { id: 't3', eventId: 'e1', name: 'Task C', status: 'todo', priority: 'medium', dueDate: '2026-11-10', estimatedCost: 0, actualCost: 0, dependencies: ['t2'] },
    ];

    const result = validateTaskDependencies(tasks);
    expect(result.isValid).toBe(false);
    expect(result.hasCycle).toBe(true);
    expect(result.errorMessage).toContain('Circular dependency detected');
  });

  it('validates a valid DAG (Directed Acyclic Graph) successfully', () => {
    // t1 -> t2, t1 -> t3, (t2, t3) -> t4
    const tasks: Task[] = [
      { id: 't1', eventId: 'e1', name: 'Venue Book', status: 'completed', priority: 'critical', dueDate: '2026-10-01', estimatedCost: 0, actualCost: 0, dependencies: [] },
      { id: 't2', eventId: 'e1', name: 'Catering', status: 'todo', priority: 'high', dueDate: '2026-10-10', estimatedCost: 0, actualCost: 0, dependencies: ['t1'] },
      { id: 't3', eventId: 'e1', name: 'Decor Blueprint', status: 'todo', priority: 'medium', dueDate: '2026-10-15', estimatedCost: 0, actualCost: 0, dependencies: ['t1'] },
      { id: 't4', eventId: 'e1', name: 'Inspection', status: 'todo', priority: 'critical', dueDate: '2026-10-20', estimatedCost: 0, actualCost: 0, dependencies: ['t2', 't3'] },
    ];

    const result = validateTaskDependencies(tasks);
    expect(result.isValid).toBe(true);
    expect(result.hasCycle).toBe(false);
    expect(result.topologicalOrder).toHaveLength(4);
    expect(result.topologicalOrder?.[0]).toBe('t1');
  });

  it('accurately discovers all downstream affected tasks upon disruption', () => {
    const tasks: Task[] = [
      { id: 't1', eventId: 'e1', name: 'Venue Contract', status: 'todo', priority: 'critical', dueDate: '2026-10-01', estimatedCost: 0, actualCost: 0, dependencies: [] },
      { id: 't2', eventId: 'e1', name: 'Catering Menu', status: 'todo', priority: 'high', dueDate: '2026-10-10', estimatedCost: 0, actualCost: 0, dependencies: ['t1'] },
      { id: 't3', eventId: 'e1', name: 'Stage Decor', status: 'todo', priority: 'medium', dueDate: '2026-10-15', estimatedCost: 0, actualCost: 0, dependencies: ['t1'] },
      { id: 't4', eventId: 'e1', name: 'Final Walkthrough', status: 'todo', priority: 'critical', dueDate: '2026-10-20', estimatedCost: 0, actualCost: 0, dependencies: ['t2', 't3'] },
      { id: 't5', eventId: 'e1', name: 'Guest Transport', status: 'todo', priority: 'low', dueDate: '2026-10-22', estimatedCost: 0, actualCost: 0, dependencies: ['t4'] },
      { id: 't_unrelated', eventId: 'e1', name: 'Family Wardrobe Shopping', status: 'todo', priority: 'low', dueDate: '2026-10-05', estimatedCost: 0, actualCost: 0, dependencies: [] },
    ];

    const impact = getDownstreamImpact('t1', tasks);
    expect(impact.totalAffectedTasks).toBe(4); // t2, t3, t4, t5
    expect(impact.downstreamTaskIds).toContain('t2');
    expect(impact.downstreamTaskIds).toContain('t3');
    expect(impact.downstreamTaskIds).toContain('t4');
    expect(impact.downstreamTaskIds).toContain('t5');
    expect(impact.downstreamTaskIds).not.toContain('t_unrelated');
    expect(impact.criticalPathImpacted).toBe(true);
  });
});
