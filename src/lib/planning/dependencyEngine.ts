import { Task } from '@/types/event';

export interface DependencyValidationResult {
  isValid: boolean;
  hasCycle: boolean;
  cycleNodes?: string[];
  errorMessage?: string;
  topologicalOrder?: string[];
}

export interface ImpactAnalysisResult {
  directlyAffectedTaskId: string;
  downstreamTaskIds: string[];
  totalAffectedTasks: number;
  criticalPathImpacted: boolean;
}

/**
 * Validates task dependencies, checking for circular references (cycles)
 * and verifying that all referenced prerequisite tasks actually exist.
 */
export function validateTaskDependencies(tasks: Task[]): DependencyValidationResult {
  const taskMap = new Map<string, Task>();
  const graph = new Map<string, string[]>(); // taskId -> array of taskIds that depend on it
  const inDegree = new Map<string, number>();

  for (const t of tasks) {
    taskMap.set(t.id, t);
    graph.set(t.id, []);
    inDegree.set(t.id, 0);
  }

  // Build edges: if Task A depends on Task B, edge is B -> A
  for (const t of tasks) {
    for (const depId of t.dependencies) {
      if (!taskMap.has(depId)) {
        return {
          isValid: false,
          hasCycle: false,
          errorMessage: `Task "${t.name}" depends on non-existent task ID: ${depId}`,
        };
      }
      if (depId === t.id) {
        return {
          isValid: false,
          hasCycle: true,
          cycleNodes: [t.id],
          errorMessage: `Task "${t.name}" cannot depend on itself.`,
        };
      }
      graph.get(depId)!.push(t.id);
      inDegree.set(t.id, (inDegree.get(t.id) || 0) + 1);
    }
  }

  // Kahn's algorithm for Topological Sort & Cycle Detection
  const queue: string[] = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  const topologicalOrder: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    topologicalOrder.push(current);

    for (const neighbor of graph.get(current) || []) {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (topologicalOrder.length !== tasks.length) {
    const cyclicTaskIds = tasks.filter((t) => !topologicalOrder.includes(t.id)).map((t) => t.id);
    return {
      isValid: false,
      hasCycle: true,
      cycleNodes: cyclicTaskIds,
      errorMessage: `Circular dependency detected involving tasks: ${cyclicTaskIds.join(', ')}`,
    };
  }

  return {
    isValid: true,
    hasCycle: false,
    topologicalOrder,
  };
}

/**
 * Propagates impact downstream. When a prerequisite task is delayed or changed,
 * returns all tasks that depend on it directly or transitively.
 */
export function getDownstreamImpact(taskId: string, tasks: Task[]): ImpactAnalysisResult {
  const downstreamMap = new Map<string, string[]>(); // id -> list of tasks that directly depend on it
  for (const t of tasks) {
    downstreamMap.set(t.id, []);
  }

  for (const t of tasks) {
    for (const depId of t.dependencies) {
      if (downstreamMap.has(depId)) {
        downstreamMap.get(depId)!.push(t.id);
      }
    }
  }

  // BFS traversal to discover all affected downstream tasks
  const visited = new Set<string>();
  const queue = [...(downstreamMap.get(taskId) || [])];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (!visited.has(curr)) {
      visited.add(curr);
      for (const next of downstreamMap.get(curr) || []) {
        if (!visited.has(next)) {
          queue.push(next);
        }
      }
    }
  }

  const downstreamList = Array.from(visited);
  const criticalImpact = tasks
    .filter((t) => downstreamList.includes(t.id))
    .some((t) => t.priority === 'critical');

  return {
    directlyAffectedTaskId: taskId,
    downstreamTaskIds: downstreamList,
    totalAffectedTasks: downstreamList.length,
    criticalPathImpacted: criticalImpact,
  };
}

/**
 * Checks for overdue tasks based on current date
 */
export function getOverdueTasks(tasks: Task[], referenceDate: string = new Date().toISOString().split('T')[0]): Task[] {
  return tasks.filter((t) => {
    return t.status !== 'completed' && t.dueDate < referenceDate;
  });
}
