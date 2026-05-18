-- ============================================================================
-- GEARBEAT PATCH 123A: FOUNDER FULL-JOURNEY SQL GAP FILL MIGRATION DRAFT
-- ============================================================================
-- Description: Additive migration draft establishing missing schema pathways
--              for customer, studio owner, vendor, event/ticketing, academy,
--              CRM, rewards, and founder self-test tracking journeys.
-- Safety:     - Strict ADDITIVE statements only (CREATE TABLE IF NOT EXISTS,
--               CREATE INDEX IF NOT EXISTS, ALTER TABLE ADD COLUMN IF NOT EXISTS).
--             - Zero destructive mutations (NO DROP, NO TRUNCATE, NO DELETE).
--             - Preserves all pre-existing schemas and the Super Admin structures.
-- ============================================================================

-- ============================================================================
-- MODULE 1: CRM FOUNDATION
-- ============================================================================

-- 1. CRM Accounts
CREATE TABLE IF NOT EXISTS public.crm_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    industry text,
    website text,
    phone text,
    billing_address text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'active' 
        CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_crm_accounts_status ON public.crm_accounts(status);

-- 2. CRM Contacts
CREATE TABLE IF NOT EXISTS public.crm_contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id uuid REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text UNIQUE,
    phone text,
    job_title text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'active'
        CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_account ON public.crm_contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON public.crm_contacts(email);

-- 3. CRM Leads
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
    auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    title text NOT NULL,
    source text,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_contact ON public.crm_leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_auth_user ON public.crm_leads(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON public.crm_leads(status);

-- 4. CRM Notes
CREATE TABLE IF NOT EXISTS public.crm_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id uuid REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
    account_id uuid REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
    author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_notes_lead ON public.crm_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_notes_contact ON public.crm_notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_notes_account ON public.crm_notes(account_id);

-- 5. CRM Tasks
CREATE TABLE IF NOT EXISTS public.crm_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id uuid REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    subject text NOT NULL,
    description text,
    due_date timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_lead ON public.crm_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_assignee ON public.crm_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_status ON public.crm_tasks(status);

-- 6. CRM Activity Logs
CREATE TABLE IF NOT EXISTS public.crm_activity_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id uuid REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
    account_id uuid REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    activity_type text NOT NULL,
    description text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_activity_log_lead ON public.crm_activity_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_activity_log_contact ON public.crm_activity_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_activity_log_account ON public.crm_activity_log(account_id);

-- ============================================================================
-- MODULE 2: SERVICES JOURNEY
-- ============================================================================

-- 1. Service Listings
CREATE TABLE IF NOT EXISTS public.service_listings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (price >= 0.00),
    duration_minutes integer NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_service_listings_provider ON public.service_listings(provider_profile_id);
CREATE INDEX IF NOT EXISTS idx_service_listings_status ON public.service_listings(status);

-- 2. Service Bookings
CREATE TABLE IF NOT EXISTS public.service_bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_listing_id uuid REFERENCES public.service_listings(id) ON DELETE CASCADE,
    customer_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    booking_time timestamptz NOT NULL,
    notes text,
    price_paid numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (price_paid >= 0.00),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_service_bookings_listing ON public.service_bookings(service_listing_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_customer ON public.service_bookings(customer_profile_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON public.service_bookings(status);

-- ============================================================================
-- MODULE 3: TICKETING JOURNEY
-- ============================================================================

-- 1. Events
CREATE TABLE IF NOT EXISTS public.events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    location text,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    organizer_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed')),
    CONSTRAINT chk_event_times CHECK (start_time <= end_time)
);

CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_profile_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- 2. Ticket Types
CREATE TABLE IF NOT EXISTS public.ticket_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    name text NOT NULL,
    price numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (price >= 0.00),
    capacity integer NOT NULL DEFAULT 100 CHECK (capacity >= 0),
    sold_count integer NOT NULL DEFAULT 0 CHECK (sold_count >= 0 AND sold_count <= capacity),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'active'
        CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON public.ticket_types(event_id);

-- 3. Ticket Orders
CREATE TABLE IF NOT EXISTS public.ticket_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    buyer_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    total_price numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (total_price >= 0.00),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_ticket_orders_event ON public.ticket_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_buyer ON public.ticket_orders(buyer_profile_id);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_status ON public.ticket_orders(status);

-- 4. Ticket Order Items
CREATE TABLE IF NOT EXISTS public.ticket_order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.ticket_orders(id) ON DELETE CASCADE,
    ticket_type_id uuid REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0.00),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_order_items_order ON public.ticket_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_ticket_order_items_type ON public.ticket_order_items(ticket_type_id);

-- ============================================================================
-- MODULE 4: ACADEMY JOURNEY
-- ============================================================================

-- 1. Academy Instructors
CREATE TABLE IF NOT EXISTS public.academy_instructors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    bio text,
    specialties text[],
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_academy_instructors_status ON public.academy_instructors(status);

-- 2. Academy Lessons
CREATE TABLE IF NOT EXISTS public.academy_lessons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id uuid REFERENCES public.academy_instructors(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    duration_minutes integer NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
    capacity integer NOT NULL DEFAULT 10 CHECK (capacity > 0),
    price numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (price >= 0.00),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_academy_lessons_instructor ON public.academy_lessons(instructor_id);
CREATE INDEX IF NOT EXISTS idx_academy_lessons_status ON public.academy_lessons(status);

-- 3. Academy Bookings
CREATE TABLE IF NOT EXISTS public.academy_bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id uuid REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
    student_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_time timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_academy_bookings_lesson ON public.academy_bookings(lesson_id);
CREATE INDEX IF NOT EXISTS idx_academy_bookings_student ON public.academy_bookings(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_academy_bookings_status ON public.academy_bookings(status);

-- ============================================================================
-- MODULE 5: FOUNDER SELF-TEST TRACKING
-- ============================================================================

-- 1. Founder Test Runs
CREATE TABLE IF NOT EXISTS public.founder_test_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    started_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    run_name text NOT NULL,
    run_description text,
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    status text NOT NULL DEFAULT 'not_started'
        CHECK (status IN ('not_started', 'in_progress', 'passed', 'failed', 'blocked'))
);

CREATE INDEX IF NOT EXISTS idx_founder_test_runs_status ON public.founder_test_runs(status);

-- 2. Founder Test Steps
CREATE TABLE IF NOT EXISTS public.founder_test_steps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id uuid REFERENCES public.founder_test_runs(id) ON DELETE CASCADE,
    step_name text NOT NULL,
    step_description text,
    sequence_number integer NOT NULL CHECK (sequence_number >= 1),
    started_at timestamptz,
    completed_at timestamptz,
    status text NOT NULL DEFAULT 'not_started'
        CHECK (status IN ('not_started', 'in_progress', 'passed', 'failed', 'blocked')),
    notes text
);

CREATE INDEX IF NOT EXISTS idx_founder_test_steps_run ON public.founder_test_steps(run_id);
CREATE INDEX IF NOT EXISTS idx_founder_test_steps_status ON public.founder_test_steps(status);

-- 3. Founder Test Issues
CREATE TABLE IF NOT EXISTS public.founder_test_issues (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id uuid REFERENCES public.founder_test_runs(id) ON DELETE CASCADE,
    step_id uuid REFERENCES public.founder_test_steps(id) ON DELETE SET NULL,
    reported_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text NOT NULL,
    severity text NOT NULL DEFAULT 'medium'
        CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_founder_test_issues_run ON public.founder_test_issues(run_id);
CREATE INDEX IF NOT EXISTS idx_founder_test_issues_status ON public.founder_test_issues(status);

-- ============================================================================
-- MODULE 6: REWARDS FOUNDATION ALIGNMENT (ADDITIVE ONLY)
-- ============================================================================
-- Wiping is blocked, customer_wallets and loyalty_points_ledger exist.
-- Additive 'reason' column added in case it is required by the rewards system.

ALTER TABLE public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS reason text;

-- ============================================================================
-- MODULE 7: ADMIN & MANUAL OPERATIONS
-- ============================================================================

-- 1. Manual Operations Logs
CREATE TABLE IF NOT EXISTS public.manual_operations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    operation_type text NOT NULL,
    description text NOT NULL,
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_manual_operations_operator ON public.manual_operations(operator_user_id);
CREATE INDEX IF NOT EXISTS idx_manual_operations_status ON public.manual_operations(status);

-- 2. Admin System Issues
CREATE TABLE IF NOT EXISTS public.admin_issues (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_admin_issues_reporter ON public.admin_issues(reported_by_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_issues_status ON public.admin_issues(status);
