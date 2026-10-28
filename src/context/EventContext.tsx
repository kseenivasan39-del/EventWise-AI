'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FullEventPlan, BudgetCategory, Expense, Task, Vendor, Incident, EventModel } from '@/types/event';
import { TAMIL_WEDDING_DEMO, BIRTHDAY_PARTY_DEMO, COMMUNITY_FESTIVAL_DEMO } from '@/lib/data/sampleScenarios';
import { calculateBudgetMetrics, BudgetMetrics } from '@/lib/planning/budgetEngine';
import { useAuth } from './AuthContext';

interface EventContextType {
  currentPlan: FullEventPlan;
  userEvents: EventModel[];
  metrics: BudgetMetrics;
  isAiLoading: boolean;
  activeScenarioKey: 'wedding' | 'birthday' | 'community' | 'custom';
  loadScenario: (key: 'wedding' | 'birthday' | 'community') => void;
  switchEvent: (eventId: string) => Promise<void>;
  deleteCurrentEvent: () => Promise<void>;
  setCustomPlan: (plan: FullEventPlan) => void;
  updateCategory: (categoryId: string, allocatedAmount: number) => void;
  addCategory: (category: Omit<BudgetCategory, 'id' | 'eventId'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'eventId'>) => void;
  toggleTaskStatus: (taskId: string) => void;
  updateTask: (updated: Task) => void;
  addTask: (task: Omit<Task, 'id' | 'eventId'>) => void;
  updateVendor: (vendor: Vendor) => void;
  addVendor: (vendor: Omit<Vendor, 'id' | 'eventId'>) => void;
  addIncident: (incident: Incident) => void;
  applyRecovery: (incidentId: string, proposalId: string) => Promise<void>;
  resetToDefault: () => void;
  refreshEventsList: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<FullEventPlan>(TAMIL_WEDDING_DEMO);
  const [userEvents, setUserEvents] = useState<EventModel[]>([]);
  const [activeScenarioKey, setActiveScenarioKey] = useState<'wedding' | 'birthday' | 'community' | 'custom'>('wedding');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fetch list of accessible events for this user
  const refreshEventsList = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success && data.data) {
        setUserEvents(data.data);
      }
    } catch (e) {
      console.warn('Failed to load user events list', e);
    }
  };

  useEffect(() => {
    refreshEventsList();
  }, [user]);

  // Persist plan changes to real backend database repository
  const savePlan = async (updated: FullEventPlan) => {
    setCurrentPlan(updated);
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_plan',
          payload: { plan: updated },
        }),
      });
      refreshEventsList();
    } catch (e) {
      console.error('Failed to persist plan to repository', e);
    }
  };

  const metrics = calculateBudgetMetrics(
    currentPlan.event.budgetTotal,
    currentPlan.categories,
    currentPlan.expenses
  );

  const loadScenario = (key: 'wedding' | 'birthday' | 'community') => {
    let scenario = TAMIL_WEDDING_DEMO;
    if (key === 'birthday') scenario = BIRTHDAY_PARTY_DEMO;
    if (key === 'community') scenario = COMMUNITY_FESTIVAL_DEMO;
    setActiveScenarioKey(key);
    savePlan(JSON.parse(JSON.stringify(scenario)));
  };

  const switchEvent = async (eventId: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_plan',
          payload: { eventId },
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentPlan(data.data);
        setActiveScenarioKey('custom');
      }
    } catch (err) {
      console.error('Failed to switch event', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const deleteCurrentEvent = async () => {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_event',
          payload: { eventId: currentPlan.event.id },
        }),
      });
      await refreshEventsList();
      loadScenario('wedding');
    } catch (err) {
      console.error('Failed to delete event', err);
    }
  };

  const setCustomPlan = (plan: FullEventPlan) => {
    setActiveScenarioKey('custom');
    savePlan(plan);
  };

  const updateCategory = (categoryId: string, allocatedAmount: number) => {
    const updatedCategories = currentPlan.categories.map((c) =>
      c.id === categoryId ? { ...c, allocatedAmount: Math.max(0, allocatedAmount) } : c
    );
    savePlan({
      ...currentPlan,
      categories: updatedCategories,
      auditLogs: [
        {
          id: crypto.randomUUID(),
          eventId: currentPlan.event.id,
          action: 'CATEGORY_ALLOCATION_UPDATED',
          details: { categoryId, allocatedAmount },
          timestamp: new Date().toISOString(),
        },
        ...currentPlan.auditLogs,
      ],
    });
  };

  const addCategory = (cat: Omit<BudgetCategory, 'id' | 'eventId'>) => {
    const newCat: BudgetCategory = {
      ...cat,
      id: crypto.randomUUID(),
      eventId: currentPlan.event.id,
    };
    savePlan({
      ...currentPlan,
      categories: [...currentPlan.categories, newCat],
    });
  };

  const addExpense = (exp: Omit<Expense, 'id' | 'eventId'>) => {
    const newExp: Expense = {
      ...exp,
      id: crypto.randomUUID(),
      eventId: currentPlan.event.id,
    };
    savePlan({
      ...currentPlan,
      expenses: [newExp, ...currentPlan.expenses],
      auditLogs: [
        {
          id: crypto.randomUUID(),
          eventId: currentPlan.event.id,
          action: 'EXPENSE_RECORDED',
          details: { name: newExp.name, amount: newExp.amount },
          timestamp: new Date().toISOString(),
        },
        ...currentPlan.auditLogs,
      ],
    });
  };

  const toggleTaskStatus = (taskId: string) => {
    const updatedTasks = currentPlan.tasks.map((t) => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'completed' ? 'todo' : 'completed';
        return {
          ...t,
          status: nextStatus as any,
          completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });

    savePlan({
      ...currentPlan,
      tasks: updatedTasks,
      auditLogs: [
        {
          id: crypto.randomUUID(),
          eventId: currentPlan.event.id,
          action: 'TASK_STATUS_TOGGLED',
          details: { taskId },
          timestamp: new Date().toISOString(),
        },
        ...currentPlan.auditLogs,
      ],
    });
  };

  const updateTask = (updated: Task) => {
    const updatedTasks = currentPlan.tasks.map((t) => (t.id === updated.id ? updated : t));
    savePlan({ ...currentPlan, tasks: updatedTasks });
  };

  const addTask = (task: Omit<Task, 'id' | 'eventId'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      eventId: currentPlan.event.id,
    };
    savePlan({
      ...currentPlan,
      tasks: [...currentPlan.tasks, newTask],
    });
  };

  const updateVendor = (updated: Vendor) => {
    const updatedVendors = currentPlan.vendors.map((v) => (v.id === updated.id ? updated : v));
    savePlan({ ...currentPlan, vendors: updatedVendors });
  };

  const addVendor = (vendor: Omit<Vendor, 'id' | 'eventId'>) => {
    const newVendor: Vendor = {
      ...vendor,
      id: crypto.randomUUID(),
      eventId: currentPlan.event.id,
    };
    savePlan({
      ...currentPlan,
      vendors: [...currentPlan.vendors, newVendor],
    });
  };

  const addIncident = (incident: Incident) => {
    savePlan({
      ...currentPlan,
      incidents: [incident, ...currentPlan.incidents],
    });
  };

  const applyRecovery = async (incidentId: string, proposalId: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply_recovery',
          payload: {
            plan: currentPlan,
            incidentId,
            proposalId,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        savePlan(data.data);
      }
    } catch (e) {
      console.error('Failed to apply recovery proposal', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetToDefault = () => {
    loadScenario('wedding');
  };

  return (
    <EventContext.Provider
      value={{
        currentPlan,
        userEvents,
        metrics,
        isAiLoading,
        activeScenarioKey,
        loadScenario,
        switchEvent,
        deleteCurrentEvent,
        setCustomPlan,
        updateCategory,
        addCategory,
        addExpense,
        toggleTaskStatus,
        updateTask,
        addTask,
        updateVendor,
        addVendor,
        addIncident,
        applyRecovery,
        resetToDefault,
        refreshEventsList,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
}
