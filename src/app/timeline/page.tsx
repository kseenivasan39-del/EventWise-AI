'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Plus, 
  AlertCircle, 
  GitBranch, 
  Filter,
  Search
} from 'lucide-react';
import { useEventContext } from '@/context/EventContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TaskPriority } from '@/types/event';
import { validateTaskDependencies, getDownstreamImpact } from '@/lib/planning/dependencyEngine';

export default function TimelinePage() {
  const { currentPlan, toggleTaskStatus, addTask } = useEventContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTaskForImpact, setSelectedTaskForImpact] = useState<string | null>(null);

  // New Task Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskDepId, setNewTaskDepId] = useState('');

  const graphValidation = validateTaskDependencies(currentPlan.tasks);

  // Filter tasks
  const filteredTasks = currentPlan.tasks.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName || !newTaskDueDate) return;

    addTask({
      name: newTaskName,
      description: newTaskDesc,
      status: 'todo',
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      dependencies: newTaskDepId ? [newTaskDepId] : [],
      estimatedCost: 0,
      actualCost: 0,
    });

    setNewTaskName('');
    setNewTaskDesc('');
    setNewTaskDueDate('');
    setNewTaskDepId('');
    setShowTaskModal(false);
  };

  const selectedImpact = selectedTaskForImpact
    ? getDownstreamImpact(selectedTaskForImpact, currentPlan.tasks)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div>
          <Badge variant="purple" className="mb-1">Topological Scheduling</Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Smart Timeline & Task Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dependency-aware event milestone tracking. Circular references are topologically detected and downstream impacts isolated.
          </p>
        </div>

        <Button size="sm" variant="gradient" onClick={() => setShowTaskModal(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Milestone Task
        </Button>
      </div>

      {/* Dependency Health Alert */}
      {!graphValidation.isValid && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-sm flex items-start gap-3 shadow-soft-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Graph Invariant Error:</strong> {graphValidation.errorMessage}
          </div>
        </div>
      )}

      {/* Impact Explorer Banner if user clicked a task */}
      {selectedImpact && (
        <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50 text-purple-900 text-xs flex items-center justify-between shadow-soft-sm">
          <div className="flex items-center gap-3">
            <GitBranch className="h-4 w-4 text-violet-700 flex-shrink-0" />
            <div>
              <strong className="font-bold">Downstream Dependency Impact:</strong> Delaying this prerequisite will impact{' '}
              <span className="font-black text-purple-950">{selectedImpact.totalAffectedTasks} downstream milestone(s)</span>.
              {selectedImpact.criticalPathImpacted && (
                <span className="text-rose-700 ml-1.5 font-bold">• Critical Path Impacted</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelectedTaskForImpact(null)}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-soft-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-semibold">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List / Topological Schedule */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const isSelected = selectedTaskForImpact === task.id;
          const deps = currentPlan.tasks.filter((t) => task.dependencies.includes(t.id));

          return (
            <Card
              key={task.id}
              className={`p-4 transition-all ${
                isSelected ? 'border-violet-500 bg-purple-50/20' : 'hover:border-stone-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleTaskStatus(task.id)}
                    className="mt-0.5 focus:outline-none"
                    aria-label={task.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
                  >
                    <CheckCircle2
                      className={`h-5 w-5 ${
                        task.status === 'completed' ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300 hover:text-slate-500'
                      }`}
                    />
                  </button>
                  <div>
                    <h3
                      className={`text-sm font-bold ${
                        task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.name}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500 font-medium">
                      <span>📅 Due: <strong className="text-slate-700">{task.dueDate}</strong></span>
                      {task.owner && <span>👤 Responsible: {task.owner}</span>}
                      {deps.length > 0 && (
                        <span className="flex items-center gap-1 text-violet-700 font-semibold">
                          <GitBranch className="h-3 w-3" /> Depends on: {deps.map((d) => d.name).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
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

                  <button
                    onClick={() => setSelectedTaskForImpact(isSelected ? null : task.id)}
                    className="text-[11px] text-slate-600 hover:text-violet-700 flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200"
                  >
                    <GitBranch className="h-3 w-3" />
                    {isSelected ? 'Hide Impact' : 'Trace Impact'}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredTasks.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-12">No tasks found matching criteria.</p>
        )}
      </div>

      {/* Modal: Add Task */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-soft-lg">
            <h3 className="text-base font-bold text-slate-900">Add Timeline Milestone Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="E.g., Coordinate Nadaswaram Sound Checks"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Specific requirements or vendor notes"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Prerequisite Task (Optional)</label>
                <select
                  value={newTaskDepId}
                  onChange={(e) => setNewTaskDepId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">None (Independent Root)</option>
                  {currentPlan.tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowTaskModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" size="sm">
                  Add Milestone
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
