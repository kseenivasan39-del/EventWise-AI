import fs from 'fs';
import path from 'path';
import { FullEventPlan, EventModel } from '@/types/event';
import { getSupabaseAdmin } from './supabase';
import { TAMIL_WEDDING_DEMO } from '@/lib/data/sampleScenarios';

const DATA_DIR = path.join(process.cwd(), '.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]), 'utf-8');
  }
  if (!fs.existsSync(EVENTS_FILE)) {
    // Seed with initial template
    fs.writeFileSync(EVENTS_FILE, JSON.stringify([TAMIL_WEDDING_DEMO]), 'utf-8');
  }
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------
export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  ensureDataDir();
  const raw = fs.readFileSync(USERS_FILE, 'utf-8');
  const users: StoredUser[] = JSON.parse(raw);
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  ensureDataDir();
  const raw = fs.readFileSync(USERS_FILE, 'utf-8');
  const users: StoredUser[] = JSON.parse(raw);
  return users.find((u) => u.id === id) || null;
}

export async function createUser(user: StoredUser): Promise<StoredUser> {
  ensureDataDir();
  const raw = fs.readFileSync(USERS_FILE, 'utf-8');
  const users: StoredUser[] = JSON.parse(raw);
  users.push(user);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  return user;
}

export async function deleteUserAccount(userId: string): Promise<void> {
  ensureDataDir();
  const rawUsers = fs.readFileSync(USERS_FILE, 'utf-8');
  const users: StoredUser[] = JSON.parse(rawUsers);
  const filteredUsers = users.filter((u) => u.id !== userId);
  fs.writeFileSync(USERS_FILE, JSON.stringify(filteredUsers, null, 2), 'utf-8');

  // Cascade delete all events owned by this user
  const rawEvents = fs.readFileSync(EVENTS_FILE, 'utf-8');
  const events: FullEventPlan[] = JSON.parse(rawEvents);
  const remainingEvents = events.filter((e) => e.event.userId !== userId);
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(remainingEvents, null, 2), 'utf-8');
}

// -------------------------------------------------------------
// EVENT OPERATIONS WITH PROPER OWNERSHIP CHECKS
// -------------------------------------------------------------
export async function listUserEvents(userId?: string): Promise<EventModel[]> {
  // If Supabase is active, read from DB
  const supabase = getSupabaseAdmin();
  if (supabase && userId) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(`user_id.eq.${userId},is_demo.eq.true`)
      .order('created_at', { ascending: false });
    if (!error && data) {
      return data.map((d: any) => ({
        id: d.id,
        userId: d.user_id,
        name: d.name,
        eventType: d.event_type,
        eventDate: d.event_date,
        eventTime: d.event_time,
        location: d.location,
        budgetTotal: Number(d.budget_total),
        currency: d.currency || 'INR',
        guestCount: d.guest_count,
        themeStyle: d.theme_style,
        culturalDietaryPreferences: d.cultural_dietary_preferences,
        accessibilityRequirements: d.accessibility_requirements,
        specialRequirements: d.special_requirements,
        isDemo: d.is_demo,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
    }
  }

  // Fallback to local persistent repository
  ensureDataDir();
  const raw = fs.readFileSync(EVENTS_FILE, 'utf-8');
  const allPlans: FullEventPlan[] = JSON.parse(raw);
  
  if (!userId) {
    return allPlans.map((p) => p.event);
  }

  // Filter events belonging to this user or shared demo events
  return allPlans
    .filter((p) => p.event.userId === userId || p.event.isDemo)
    .map((p) => p.event);
}

export async function getEventPlanById(eventId: string, userId?: string): Promise<FullEventPlan | null> {
  ensureDataDir();
  const raw = fs.readFileSync(EVENTS_FILE, 'utf-8');
  const allPlans: FullEventPlan[] = JSON.parse(raw);
  
  const plan = allPlans.find((p) => p.event.id === eventId);
  if (!plan) return null;

  // Authorization check: User must own the event or it must be a demo event
  if (userId && plan.event.userId && plan.event.userId !== userId && !plan.event.isDemo) {
    throw new Error('FORBIDDEN_EVENT_ACCESS');
  }

  return plan;
}

export async function saveEventPlan(plan: FullEventPlan, userId?: string): Promise<FullEventPlan> {
  ensureDataDir();
  const raw = fs.readFileSync(EVENTS_FILE, 'utf-8');
  const allPlans: FullEventPlan[] = JSON.parse(raw);

  // Set ownership if missing
  if (userId && !plan.event.userId) {
    plan.event.userId = userId;
  }

  const existingIndex = allPlans.findIndex((p) => p.event.id === plan.event.id);

  if (existingIndex >= 0) {
    // Verify ownership
    const existing = allPlans[existingIndex];
    if (userId && existing.event.userId && existing.event.userId !== userId && !existing.event.isDemo) {
      throw new Error('FORBIDDEN_EVENT_ACCESS');
    }
    plan.event.updatedAt = new Date().toISOString();
    allPlans[existingIndex] = plan;
  } else {
    plan.event.createdAt = new Date().toISOString();
    plan.event.updatedAt = plan.event.createdAt;
    allPlans.unshift(plan);
  }

  fs.writeFileSync(EVENTS_FILE, JSON.stringify(allPlans, null, 2), 'utf-8');
  return plan;
}

export async function deleteEventPlan(eventId: string, userId?: string): Promise<boolean> {
  ensureDataDir();
  const raw = fs.readFileSync(EVENTS_FILE, 'utf-8');
  let allPlans: FullEventPlan[] = JSON.parse(raw);

  const target = allPlans.find((p) => p.event.id === eventId);
  if (!target) return false;

  if (userId && target.event.userId && target.event.userId !== userId) {
    throw new Error('FORBIDDEN_EVENT_ACCESS');
  }

  allPlans = allPlans.filter((p) => p.event.id !== eventId);
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(allPlans, null, 2), 'utf-8');
  return true;
}
