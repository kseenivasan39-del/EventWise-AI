-- ============================================================================
-- EventWise AI - Production PostgreSQL Database Schema with Row Level Security
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('wedding', 'birthday', 'community')),
    event_date DATE NOT NULL,
    event_time TEXT,
    location TEXT NOT NULL,
    budget_total NUMERIC(14, 2) NOT NULL CHECK (budget_total >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    guest_count INTEGER NOT NULL CHECK (guest_count > 0),
    theme_style TEXT,
    cultural_dietary_preferences TEXT,
    accessibility_requirements TEXT,
    special_requirements TEXT,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Budget Categories Table
CREATE TABLE IF NOT EXISTS budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    allocated_amount NUMERIC(14, 2) NOT NULL CHECK (allocated_amount >= 0),
    spent_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (spent_amount >= 0),
    is_contingency BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
    vendor_id UUID,
    name TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL CHECK (status IN ('planned', 'deposit_paid', 'paid', 'cancelled')),
    paid_date DATE,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked', 'cancelled')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    due_date DATE NOT NULL,
    estimated_cost NUMERIC(14, 2) DEFAULT 0.00 CHECK (estimated_cost >= 0),
    actual_cost NUMERIC(14, 2) DEFAULT 0.00 CHECK (actual_cost >= 0),
    owner TEXT,
    vendor_id UUID,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Task Dependencies Table (Explicit graph edge representation)
CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT no_self_dependency CHECK (task_id <> depends_on_task_id),
    CONSTRAINT unique_task_dependency UNIQUE(task_id, depends_on_task_id)
);

-- 7. Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    contact_phone TEXT,
    contact_email TEXT,
    quoted_price NUMERIC(14, 2) NOT NULL CHECK (quoted_price >= 0),
    services_offered TEXT,
    capacity INTEGER,
    location TEXT,
    quote_status TEXT NOT NULL CHECK (quote_status IN ('requested', 'received', 'accepted', 'rejected')),
    booking_status TEXT NOT NULL CHECK (booking_status IN ('unconfirmed', 'tentative', 'confirmed', 'cancelled')),
    payment_status TEXT NOT NULL CHECK (payment_status IN ('unpaid', 'deposit_paid', 'fully_paid', 'refunded')),
    notes TEXT,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Incidents Table (Event Recovery Intelligence)
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    incident_type TEXT NOT NULL CHECK (incident_type IN ('venue_cancellation', 'weather_risk', 'vendor_cancellation', 'vendor_price_hike', 'budget_cut', 'task_overdue')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    cost_impact NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL CHECK (status IN ('active', 'mitigated', 'dismissed')),
    affected_task_ids JSONB DEFAULT '[]'::jsonb,
    affected_vendor_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Recovery Proposals Table
CREATE TABLE IF NOT EXISTS recovery_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    strategy TEXT NOT NULL,
    feasibility_score NUMERIC(3, 2) NOT NULL CHECK (feasibility_score BETWEEN 0.00 AND 1.00),
    financial_impact NUMERIC(14, 2) NOT NULL,
    timeline_impact_days INTEGER NOT NULL DEFAULT 0,
    tradeoffs TEXT NOT NULL,
    action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_event_id ON budget_categories(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_event_id ON expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_task_deps_task_id ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_deps_depends_on ON task_dependencies(depends_on_task_id);
CREATE INDEX IF NOT EXISTS idx_vendors_event_id ON vendors(event_id);
CREATE INDEX IF NOT EXISTS idx_incidents_event_id ON incidents(event_id);
CREATE INDEX IF NOT EXISTS idx_recovery_proposals_incident_id ON recovery_proposals(incident_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_id ON audit_logs(event_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Owner isolation)
CREATE POLICY "Users can manage their own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own events" ON events
    FOR ALL USING (auth.uid() = user_id OR is_demo = TRUE);

CREATE POLICY "Users can manage categories of their events" ON budget_categories
    FOR ALL USING (EXISTS (SELECT 1 FROM events WHERE events.id = budget_categories.event_id AND (events.user_id = auth.uid() OR events.is_demo = TRUE)));

CREATE POLICY "Users can manage expenses of their events" ON expenses
    FOR ALL USING (EXISTS (SELECT 1 FROM events WHERE events.id = expenses.event_id AND (events.user_id = auth.uid() OR events.is_demo = TRUE)));

CREATE POLICY "Users can manage tasks of their events" ON tasks
    FOR ALL USING (EXISTS (SELECT 1 FROM events WHERE events.id = tasks.event_id AND (events.user_id = auth.uid() OR events.is_demo = TRUE)));

CREATE POLICY "Users can manage dependencies of their tasks" ON task_dependencies
    FOR ALL USING (EXISTS (
        SELECT 1 FROM tasks JOIN events ON tasks.event_id = events.id 
        WHERE tasks.id = task_dependencies.task_id AND (events.user_id = auth.uid() OR events.is_demo = TRUE)
    ));

CREATE POLICY "Users can manage vendors of their events" ON vendors
    FOR ALL USING (EXISTS (SELECT 1 FROM events WHERE events.id = vendors.event_id AND (events.user_id = auth.uid() OR events.is_demo = TRUE)));

CREATE POLICY "Users can manage incidents of their events" ON incidents
    FOR ALL USING (EXISTS (SELECT 1 FROM events WHERE events.id = incidents.event_id AND (events.user_id = auth.uid() OR events.is_demo = TRUE)));

CREATE POLICY "Users can view recovery proposals" ON recovery_proposals
    FOR ALL USING (EXISTS (
        SELECT 1 FROM incidents JOIN events ON incidents.event_id = events.id 
        WHERE incidents.id = recovery_proposals.incident_id AND (events.user_id = auth.uid() OR events.is_demo = TRUE)
    ));

CREATE POLICY "Users can view their audit logs" ON audit_logs
    FOR ALL USING (EXISTS (SELECT 1 FROM events WHERE events.id = audit_logs.event_id AND (events.user_id = auth.uid() OR events.is_demo = TRUE)));
