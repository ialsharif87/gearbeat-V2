-- ============================================================================
-- GEARBEAT PATCH 123B: INTERNAL CRM & FOUNDER SELF-TEST SQL FOUNDATION
-- ============================================================================
-- Description: Additive migration establishing core database schemas and
--              RLS policies to strengthen internal CRM processes, demo account
--              role mapping, founder journey test sessions, admin issue
--              tracking, manual operations tracking, and CRM status history.
-- Safety:     - Strict ADDITIVE statements only (CREATE TABLE IF NOT EXISTS,
--               CREATE INDEX IF NOT EXISTS, ALTER TABLE ADD COLUMN IF NOT EXISTS).
--             - Zero destructive mutations (NO DROP, NO TRUNCATE, NO DELETE).
--             - Preserves all pre-existing schemas and Super Admin structures.
-- ============================================================================

-- ============================================================================
-- MODULE 1: INTERNAL CRM EXPANSION
-- ============================================================================

-- 1. CRM Pipelines
CREATE TABLE IF NOT EXISTS public.crm_pipelines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. CRM Stages
CREATE TABLE IF NOT EXISTS public.crm_stages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id uuid NOT NULL REFERENCES public.crm_pipelines(id) ON DELETE CASCADE,
    name text NOT NULL,
    sequence integer NOT NULL CHECK (sequence >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT unique_pipeline_stage_sequence UNIQUE (pipeline_id, sequence)
);

-- 3. Enhance Pre-existing CRM Tables with Owners and Pipeline Stages
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS pipeline_id uuid REFERENCES public.crm_pipelines(id) ON DELETE SET NULL;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS stage_id uuid REFERENCES public.crm_stages(id) ON DELETE SET NULL;

ALTER TABLE public.crm_accounts ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.crm_contacts ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Enable RLS
ALTER TABLE public.crm_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_stages ENABLE ROW LEVEL SECURITY;

-- 5. Safe Indexes
CREATE INDEX IF NOT EXISTS idx_crm_stages_pipeline ON public.crm_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_pipeline ON public.crm_leads(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON public.crm_leads(stage_id);
CREATE INDEX IF NOT EXISTS idx_crm_accounts_owner ON public.crm_accounts(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_owner ON public.crm_contacts(owner_id);


-- ============================================================================
-- MODULE 2: DEMO ACCOUNT ROLE MAPPING
-- ============================================================================

-- 1. Demo Account Role Mappings
CREATE TABLE IF NOT EXISTS public.demo_account_role_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('customer', 'studio_owner', 'vendor', 'admin', 'super_admin', 'crm_manager', 'support_agent')),
    is_active boolean NOT NULL DEFAULT true,
    assigned_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.demo_account_role_mappings ENABLE ROW LEVEL SECURITY;

-- 3. Safe Indexes
CREATE INDEX IF NOT EXISTS idx_demo_role_mappings_user ON public.demo_account_role_mappings(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_demo_role ON public.demo_account_role_mappings(user_id) WHERE is_active = true;


-- ============================================================================
-- MODULE 3: FOUNDER JOURNEY TEST SESSIONS
-- ============================================================================

-- 1. Founder Test Sessions
CREATE TABLE IF NOT EXISTS public.founder_test_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_name text NOT NULL,
    started_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'passed', 'failed', 'abandoned')),
    journey_type text NOT NULL CHECK (journey_type IN ('customer_booking', 'owner_onboarding', 'vendor_marketplace', 'admin_operations', 'crm_lead_nurture', 'full_flow')),
    metadata jsonb DEFAULT '{}'::jsonb,
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enhance Founder Test Runs with Session Association
ALTER TABLE public.founder_test_runs ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES public.founder_test_sessions(id) ON DELETE SET NULL;

-- 3. Enable RLS
ALTER TABLE public.founder_test_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Safe Indexes
CREATE INDEX IF NOT EXISTS idx_founder_test_sessions_status ON public.founder_test_sessions(status);
CREATE INDEX IF NOT EXISTS idx_founder_test_runs_session ON public.founder_test_runs(session_id);


-- ============================================================================
-- MODULE 4: ADMIN ISSUE TRACKING STRENGTHENING
-- ============================================================================

-- 1. Admin Issue Assignments
CREATE TABLE IF NOT EXISTS public.admin_issue_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id uuid NOT NULL REFERENCES public.admin_issues(id) ON DELETE CASCADE,
    assigned_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Admin Issue Comments
CREATE TABLE IF NOT EXISTS public.admin_issue_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id uuid NOT NULL REFERENCES public.admin_issues(id) ON DELETE CASCADE,
    author_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment_text text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Admin Issue History
CREATE TABLE IF NOT EXISTS public.admin_issue_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id uuid NOT NULL REFERENCES public.admin_issues(id) ON DELETE CASCADE,
    changed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    old_status text,
    new_status text NOT NULL,
    changed_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.admin_issue_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_issue_history ENABLE ROW LEVEL SECURITY;

-- 5. Safe Indexes
CREATE INDEX IF NOT EXISTS idx_admin_issue_assignments_issue ON public.admin_issue_assignments(issue_id);
CREATE INDEX IF NOT EXISTS idx_admin_issue_assignments_user ON public.admin_issue_assignments(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_issue_comments_issue ON public.admin_issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_admin_issue_history_issue ON public.admin_issue_history(issue_id);


-- ============================================================================
-- MODULE 5: MANUAL OPERATIONS AUDITING
-- ============================================================================

-- 1. Manual Operation Approvals
CREATE TABLE IF NOT EXISTS public.manual_operation_approvals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id uuid NOT NULL REFERENCES public.manual_operations(id) ON DELETE CASCADE,
    approver_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Manual Operation Impacts (Data State Audit Trails)
CREATE TABLE IF NOT EXISTS public.manual_operation_impacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id uuid NOT NULL REFERENCES public.manual_operations(id) ON DELETE CASCADE,
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    action_type text NOT NULL CHECK (action_type IN ('insert', 'update', 'delete', 'other')),
    before_state jsonb,
    after_state jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.manual_operation_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_operation_impacts ENABLE ROW LEVEL SECURITY;

-- 4. Safe Indexes
CREATE INDEX IF NOT EXISTS idx_manual_op_approvals_op ON public.manual_operation_approvals(operation_id);
CREATE INDEX IF NOT EXISTS idx_manual_op_impacts_op ON public.manual_operation_impacts(operation_id);
CREATE INDEX IF NOT EXISTS idx_manual_op_impacts_target ON public.manual_operation_impacts(table_name, record_id);


-- ============================================================================
-- MODULE 6: CRM STATUS & NOTE HISTORY
-- ============================================================================

-- 1. CRM Unified Status History
CREATE TABLE IF NOT EXISTS public.crm_status_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id uuid REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
    account_id uuid REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
    changed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    old_status text,
    new_status text NOT NULL,
    changed_at timestamptz NOT NULL DEFAULT now(),
    notes text,
    CONSTRAINT chk_crm_status_target CHECK (
        (lead_id IS NOT NULL AND contact_id IS NULL AND account_id IS NULL) OR 
        (lead_id IS NULL AND contact_id IS NOT NULL AND account_id IS NULL) OR 
        (lead_id IS NULL AND contact_id IS NULL AND account_id IS NOT NULL)
    )
);

-- 2. CRM Note Revisions
CREATE TABLE IF NOT EXISTS public.crm_note_revisions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id uuid NOT NULL REFERENCES public.crm_notes(id) ON DELETE CASCADE,
    edited_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    old_content text NOT NULL,
    new_content text NOT NULL,
    edited_at timestamptz NOT NULL DEFAULT now()
);

-- 3. CRM Task Audit History
CREATE TABLE IF NOT EXISTS public.crm_task_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES public.crm_tasks(id) ON DELETE CASCADE,
    changed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type text NOT NULL CHECK (event_type IN ('status_change', 'reassignment', 'due_date_update', 'creation')),
    old_value text,
    new_value text NOT NULL,
    changed_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.crm_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_note_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_task_history ENABLE ROW LEVEL SECURITY;

-- 5. Safe Indexes
CREATE INDEX IF NOT EXISTS idx_crm_status_history_lead ON public.crm_status_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_status_history_contact ON public.crm_status_history(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_status_history_account ON public.crm_status_history(account_id);
CREATE INDEX IF NOT EXISTS idx_crm_note_revisions_note ON public.crm_note_revisions(note_id);
CREATE INDEX IF NOT EXISTS idx_crm_task_history_task ON public.crm_task_history(task_id);


-- ============================================================================
-- MODULE 7: SECURE ROW LEVEL SECURITY POLICIES
-- ============================================================================

DO $$
BEGIN
    -- 1. Demo Mappings
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage demo role mappings' AND polrelid = 'public.demo_account_role_mappings'::regclass) THEN
        CREATE POLICY "Admins can manage demo role mappings" ON public.demo_account_role_mappings
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
            EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'active')
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own demo role mappings' AND polrelid = 'public.demo_account_role_mappings'::regclass) THEN
        CREATE POLICY "Users can view their own demo role mappings" ON public.demo_account_role_mappings
        FOR SELECT TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    -- 2. CRM Pipelines
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage CRM pipelines' AND polrelid = 'public.crm_pipelines'::regclass) THEN
        CREATE POLICY "Admins can manage CRM pipelines" ON public.crm_pipelines
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
            EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'active')
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage CRM stages' AND polrelid = 'public.crm_stages'::regclass) THEN
        CREATE POLICY "Admins can manage CRM stages" ON public.crm_stages
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
            EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'active')
        );
    END IF;

    -- 3. Founder Sessions
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage founder sessions' AND polrelid = 'public.founder_test_sessions'::regclass) THEN
        CREATE POLICY "Admins can manage founder sessions" ON public.founder_test_sessions
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
            EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'active')
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own founder sessions' AND polrelid = 'public.founder_test_sessions'::regclass) THEN
        CREATE POLICY "Users can view their own founder sessions" ON public.founder_test_sessions
        FOR SELECT TO authenticated
        USING (auth.uid() = started_by_user_id);
    END IF;

    -- 4. Admin Issues
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage issue assignments' AND polrelid = 'public.admin_issue_assignments'::regclass) THEN
        CREATE POLICY "Admins can manage issue assignments" ON public.admin_issue_assignments
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
            EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'active')
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage issue comments' AND polrelid = 'public.admin_issue_comments'::regclass) THEN
        CREATE POLICY "Admins can manage issue comments" ON public.admin_issue_comments
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
            EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'active')
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage issue history' AND polrelid = 'public.admin_issue_history'::regclass) THEN
        CREATE POLICY "Admins can manage issue history" ON public.admin_issue_history
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
            EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'active')
        );
    END IF;

    -- 5. Manual Operations
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage manual operation approvals' AND polrelid = 'public.manual_operation_approvals'::regclass) THEN
        CREATE POLICY "Admins can manage manual operation approvals" ON public.manual_operation_approvals
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
            EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'active')
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage manual operation impacts' AND polrelid = 'public.manual_operation_impacts'::regclass) THEN
        CREATE POLICY "Admins can manage manual operation impacts" ON public.manual_operation_impacts
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
            EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'active')
        );
    END IF;

    -- 6. CRM Logs History
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage CRM status history' AND polrelid = 'public.crm_status_history'::regclass) THEN
        CREATE POLICY "Admins can manage CRM status history" ON public.crm_status_history
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
            EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'active')
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage CRM note revisions' AND polrelid = 'public.crm_note_revisions'::regclass) THEN
        CREATE POLICY "Admins can manage CRM note revisions" ON public.crm_note_revisions
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
            EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'active')
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage CRM task history' AND polrelid = 'public.crm_task_history'::regclass) THEN
        CREATE POLICY "Admins can manage CRM task history" ON public.crm_task_history
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
            EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'active')
        );
    END IF;
END $$;
