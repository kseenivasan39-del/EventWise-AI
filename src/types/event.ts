import { z } from 'zod';

export const EventTypeEnum = z.enum(['wedding', 'birthday', 'community']);
export type EventType = z.infer<typeof EventTypeEnum>;

export const TaskPriorityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;

export const TaskStatusEnum = z.enum(['todo', 'in_progress', 'completed', 'blocked', 'cancelled']);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const IncidentTypeEnum = z.enum([
  'venue_cancellation',
  'weather_risk',
  'vendor_cancellation',
  'vendor_price_hike',
  'budget_cut',
  'task_overdue',
]);
export type IncidentType = z.infer<typeof IncidentTypeEnum>;

export const IncidentSeverityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export type IncidentSeverity = z.infer<typeof IncidentSeverityEnum>;

export const QuoteStatusEnum = z.enum(['requested', 'received', 'accepted', 'rejected']);
export type QuoteStatus = z.infer<typeof QuoteStatusEnum>;

export const BookingStatusEnum = z.enum(['unconfirmed', 'tentative', 'confirmed', 'cancelled']);
export type BookingStatus = z.infer<typeof BookingStatusEnum>;

export const PaymentStatusEnum = z.enum(['unpaid', 'deposit_paid', 'fully_paid', 'refunded']);
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

// Core Schema: Event Details
export const EventSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  name: z.string().min(2, 'Event name must have at least 2 characters'),
  eventType: EventTypeEnum,
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  eventTime: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  budgetTotal: z.number().positive('Budget must be positive'),
  currency: z.string().default('INR'),
  guestCount: z.number().int().positive('Guest count must be at least 1'),
  themeStyle: z.string().optional(),
  culturalDietaryPreferences: z.string().optional(),
  accessibilityRequirements: z.string().optional(),
  specialRequirements: z.string().optional(),
  isDemo: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type EventModel = z.infer<typeof EventSchema>;

// Budget Category
export const BudgetCategorySchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string().min(1),
  allocatedAmount: z.number().nonnegative('Allocation cannot be negative'),
  spentAmount: z.number().nonnegative().default(0),
  isContingency: z.boolean().default(false),
  notes: z.string().optional(),
});
export type BudgetCategory = z.infer<typeof BudgetCategorySchema>;

// Expense
export const ExpenseSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  categoryId: z.string(),
  vendorId: z.string().optional(),
  name: z.string().min(1),
  amount: z.number().positive('Expense must be greater than 0'),
  status: z.enum(['planned', 'deposit_paid', 'paid', 'cancelled']),
  paidDate: z.string().optional(),
  receiptUrl: z.string().optional(),
});
export type Expense = z.infer<typeof ExpenseSchema>;

// Task
export const TaskSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  status: TaskStatusEnum,
  priority: TaskPriorityEnum,
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  estimatedCost: z.number().nonnegative().default(0),
  actualCost: z.number().nonnegative().default(0),
  owner: z.string().optional(),
  vendorId: z.string().optional(),
  dependencies: z.array(z.string()).default([]),
  completedAt: z.string().optional(),
});
export type Task = z.infer<typeof TaskSchema>;

// Vendor
export const VendorSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string().min(1),
  category: z.string().min(1),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  quotedPrice: z.number().nonnegative(),
  servicesOffered: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  location: z.string().optional(),
  quoteStatus: QuoteStatusEnum,
  bookingStatus: BookingStatusEnum,
  paymentStatus: PaymentStatusEnum,
  notes: z.string().optional(),
  isDemo: z.boolean().default(false),
});
export type Vendor = z.infer<typeof VendorSchema>;

// Recovery Proposal Action
export const RecoveryActionSchema = z.object({
  actionType: z.enum(['reallocate_budget', 'replace_vendor', 'shift_timeline', 'cancel_task', 'reduce_scope', 'activate_contingency']),
  description: z.string(),
  costDelta: z.number(),
  targetId: z.string().optional(),
});
export type RecoveryAction = z.infer<typeof RecoveryActionSchema>;

// Recovery Proposal
export const RecoveryProposalSchema = z.object({
  id: z.string(),
  incidentId: z.string(),
  title: z.string(),
  strategy: z.string(),
  feasibilityScore: z.number().min(0).max(1),
  financialImpact: z.number(),
  timelineImpactDays: z.number().int(),
  tradeoffs: z.string(),
  actions: z.array(RecoveryActionSchema),
  isApplied: z.boolean().default(false),
  appliedAt: z.string().optional(),
});
export type RecoveryProposal = z.infer<typeof RecoveryProposalSchema>;

// Incident
export const IncidentSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  incidentType: IncidentTypeEnum,
  severity: IncidentSeverityEnum,
  title: z.string(),
  description: z.string(),
  costImpact: z.number().default(0),
  status: z.enum(['active', 'mitigated', 'dismissed']),
  affectedTaskIds: z.array(z.string()).default([]),
  affectedVendorIds: z.array(z.string()).default([]),
  proposals: z.array(RecoveryProposalSchema).default([]),
  createdAt: z.string(),
});
export type Incident = z.infer<typeof IncidentSchema>;

// Audit Log
export const AuditLogSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  action: z.string(),
  details: z.record(z.string(), z.any()),
  timestamp: z.string(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

// Full Event Plan Aggregate
export const FullEventPlanSchema = z.object({
  event: EventSchema,
  categories: z.array(BudgetCategorySchema),
  expenses: z.array(ExpenseSchema),
  tasks: z.array(TaskSchema),
  vendors: z.array(VendorSchema),
  incidents: z.array(IncidentSchema),
  auditLogs: z.array(AuditLogSchema),
});
export type FullEventPlan = z.infer<typeof FullEventPlanSchema>;

// Natural Language Event Request Parser
export const ParsedNLRequestSchema = z.object({
  name: z.string().default('My Event'),
  eventType: EventTypeEnum,
  guestCount: z.number().int().positive(),
  budgetTotal: z.number().positive(),
  currency: z.string().default('INR'),
  daysUntilEvent: z.number().int().positive(),
  location: z.string(),
  themeStyle: z.string().optional(),
  culturalDietaryPreferences: z.string().optional(),
  accessibilityRequirements: z.string().optional(),
  priorities: z.array(z.string()).default([]),
  specialConstraints: z.string().optional(),
});
export type ParsedNLRequest = z.infer<typeof ParsedNLRequestSchema>;
