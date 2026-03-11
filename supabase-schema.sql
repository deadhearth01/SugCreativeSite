-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  SUG CREATIVE — Complete Database Schema                            ║
-- ║  Roles: admin, student, client, mentor, employee, intern            ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════
-- 1. PROFILES (extends Supabase auth.users)
-- ═══════════════════════════════════════════════════════════════
CREATE TYPE user_role AS ENUM ('admin', 'student', 'client', 'mentor', 'employee', 'intern');
CREATE TYPE user_status AS ENUM ('active', 'pending', 'banned', 'inactive');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'student',
  status user_status NOT NULL DEFAULT 'active',
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ═══════════════════════════════════════════════════════════════
-- 2. COURSES
-- ═══════════════════════════════════════════════════════════════
CREATE TYPE course_status AS ENUM ('draft', 'active', 'archived', 'upcoming');
CREATE TYPE course_category AS ENUM ('business_solutions', 'career_guidance', 'startup_hub', 'edu_tech', 'young_compete');

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category course_category NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  duration_hours INTEGER,
  total_lessons INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  photos TEXT[] DEFAULT '{}',
  syllabus JSONB DEFAULT '[]',
  start_date DATE,
  end_date DATE,
  max_students INTEGER,
  status course_status NOT NULL DEFAULT 'draft',
  instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);

-- ═══════════════════════════════════════════════════════════════
-- 3. COURSE ENROLLMENTS
-- ═══════════════════════════════════════════════════════════════
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'dropped', 'pending');

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status enrollment_status NOT NULL DEFAULT 'active',
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- ═══════════════════════════════════════════════════════════════
-- 4. MEETINGS (Google Meet integration)
-- ═══════════════════════════════════════════════════════════════
CREATE TYPE meeting_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE meeting_type AS ENUM ('general', 'mentoring', 'interview', 'review', 'standup');

CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  meeting_type meeting_type NOT NULL DEFAULT 'general',
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meeting_link TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status meeting_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_meetings_organizer ON meetings(organizer_id);
CREATE INDEX idx_meetings_scheduled ON meetings(scheduled_at);
CREATE INDEX idx_meetings_status ON meetings(status);

-- Meeting participants (many-to-many)
CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'invited',
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  UNIQUE(meeting_id, user_id)
);

CREATE INDEX idx_meeting_participants_meeting ON meeting_participants(meeting_id);
CREATE INDEX idx_meeting_participants_user ON meeting_participants(user_id);

-- ═══════════════════════════════════════════════════════════════
-- 5. PAYMENTS & INVOICES
-- ═══════════════════════════════════════════════════════════════
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');
CREATE TYPE payment_type AS ENUM ('course_fee', 'consultation_fee', 'project_fee', 'subscription', 'other');

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_type payment_type NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  description TEXT,
  reference_id UUID, -- course_id, project_id, etc.
  transaction_id TEXT,
  payment_method TEXT,
  invoice_number TEXT UNIQUE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ═══════════════════════════════════════════════════════════════
-- 6. BUDGET & SPENDINGS (Admin)
-- ═══════════════════════════════════════════════════════════════
CREATE TYPE budget_category AS ENUM ('marketing', 'operations', 'salaries', 'infrastructure', 'tools', 'events', 'other');

CREATE TABLE budget_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category budget_category NOT NULL,
  is_income BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_budget_date ON budget_entries(date);
CREATE INDEX idx_budget_category ON budget_entries(category);

-- ═══════════════════════════════════════════════════════════════
-- 7. TICKETS (Support)
-- ═══════════════════════════════════════════════════════════════
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority ticket_priority NOT NULL DEFAULT 'medium',
  status ticket_status NOT NULL DEFAULT 'open',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_tickets_assigned ON tickets(assigned_to);

-- Ticket replies
CREATE TABLE ticket_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_replies_ticket ON ticket_replies(ticket_id);

-- ═══════════════════════════════════════════════════════════════
-- 8. ANNOUNCEMENTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  target_roles user_role[] DEFAULT '{}', -- empty = all roles
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcements_pinned ON announcements(is_pinned);

-- ═══════════════════════════════════════════════════════════════
-- 9. CALENDAR EVENTS
-- ═══════════════════════════════════════════════════════════════
CREATE TYPE event_type AS ENUM ('meeting', 'deadline', 'holiday', 'workshop', 'exam', 'general');

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type NOT NULL DEFAULT 'general',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN NOT NULL DEFAULT false,
  location TEXT,
  color TEXT DEFAULT '#045184',
  target_roles user_role[] DEFAULT '{}', -- empty = all roles
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calendar_start ON calendar_events(start_time);

-- ═══════════════════════════════════════════════════════════════
-- 10. TASKS (Employee / Intern)
-- ═══════════════════════════════════════════════════════════════
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ═══════════════════════════════════════════════════════════════
-- 11. ATTENDANCE (Employee / Intern)
-- ═══════════════════════════════════════════════════════════════
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'half_day', 'leave');

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status attendance_status NOT NULL DEFAULT 'present',
  hours_worked NUMERIC(4,2),
  notes TEXT,
  UNIQUE(user_id, date)
);

CREATE INDEX idx_attendance_user ON attendance(user_id);
CREATE INDEX idx_attendance_date ON attendance(date);

-- ═══════════════════════════════════════════════════════════════
-- 12. PROJECTS (Client)
-- ═══════════════════════════════════════════════════════════════
CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled');

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status project_status NOT NULL DEFAULT 'planning',
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  budget NUMERIC(12,2),
  start_date DATE,
  deadline DATE,
  deliverables JSONB DEFAULT '[]',
  team_members UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);

-- ═══════════════════════════════════════════════════════════════
-- 13. REPORTS (Client / Intern)
-- ═══════════════════════════════════════════════════════════════
CREATE TYPE report_type AS ENUM ('project_update', 'monthly_summary', 'task_report', 'intern_weekly', 'intern_final');

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  report_type report_type NOT NULL,
  content TEXT,
  file_url TEXT,
  submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  feedback TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_submitted ON reports(submitted_by);

-- ═══════════════════════════════════════════════════════════════
-- 14. CERTIFICATES (Student)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  file_url TEXT,
  UNIQUE(student_id, course_id)
);

CREATE INDEX idx_certificates_student ON certificates(student_id);

-- ═══════════════════════════════════════════════════════════════
-- 15. RESUMES (Student)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template TEXT NOT NULL DEFAULT 'professional',
  personal_info JSONB DEFAULT '{}',
  education JSONB DEFAULT '[]',
  experience JSONB DEFAULT '[]',
  skills TEXT[] DEFAULT '{}',
  projects JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  languages TEXT[] DEFAULT '{}',
  summary TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_resumes_student ON resumes(student_id);

-- ═══════════════════════════════════════════════════════════════
-- 16. MENTOR SESSIONS & EARNINGS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE mentor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES meetings(id),
  duration_minutes INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  amount NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mentor_sessions_mentor ON mentor_sessions(mentor_id);
CREATE INDEX idx_mentor_sessions_student ON mentor_sessions(student_id);

-- ═══════════════════════════════════════════════════════════════
-- 17. MENTOR RESOURCES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE mentor_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  resource_type TEXT NOT NULL DEFAULT 'document',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mentor_resources_mentor ON mentor_resources(mentor_id);

-- ═══════════════════════════════════════════════════════════════
-- 18. LEARNING MATERIALS (Intern)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE learning_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content_url TEXT,
  material_type TEXT NOT NULL DEFAULT 'article', -- article, video, quiz, assignment
  course_id UUID REFERENCES courses(id),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Track intern learning progress
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES learning_materials(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  score INTEGER,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, material_id)
);

CREATE INDEX idx_learning_progress_user ON learning_progress(user_id);

-- ═══════════════════════════════════════════════════════════════
-- 19. NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ═══════════════════════════════════════════════════════════════
-- 20. AUDIT LOG (for admin tracking)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ─── Helper: Check if current user is admin ───
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── PROFILES policies ───
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (is_admin());

-- ─── COURSES policies ───
CREATE POLICY "Anyone can view active courses"
  ON courses FOR SELECT
  USING (status = 'active' OR is_admin());

CREATE POLICY "Admins can manage courses"
  ON courses FOR ALL
  USING (is_admin());

-- ─── ENROLLMENTS policies ───
CREATE POLICY "Students can view own enrollments"
  ON enrollments FOR SELECT
  USING (auth.uid() = student_id OR is_admin());

CREATE POLICY "Students can enroll"
  ON enrollments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can manage enrollments"
  ON enrollments FOR ALL
  USING (is_admin());

-- ─── MEETINGS policies ───
CREATE POLICY "Participants can view meetings"
  ON meetings FOR SELECT
  USING (
    organizer_id = auth.uid()
    OR id IN (SELECT meeting_id FROM meeting_participants WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Admins and organizers can manage meetings"
  ON meetings FOR ALL
  USING (organizer_id = auth.uid() OR is_admin());

-- ─── MEETING PARTICIPANTS ───
CREATE POLICY "Users can see their participations"
  ON meeting_participants FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Organizers can manage participants"
  ON meeting_participants FOR ALL
  USING (is_admin() OR meeting_id IN (SELECT id FROM meetings WHERE organizer_id = auth.uid()));

-- ─── PAYMENTS policies ───
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  USING (is_admin());

-- ─── BUDGET policies ───
CREATE POLICY "Only admins can access budget"
  ON budget_entries FOR ALL
  USING (is_admin());

-- ─── TICKETS policies ───
CREATE POLICY "Users can view own tickets"
  ON tickets FOR SELECT
  USING (created_by = auth.uid() OR assigned_to = auth.uid() OR is_admin());

CREATE POLICY "Users can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins and assignees can update tickets"
  ON tickets FOR UPDATE
  USING (assigned_to = auth.uid() OR is_admin());

-- ─── TICKET REPLIES ───
CREATE POLICY "Ticket participants can view replies"
  ON ticket_replies FOR SELECT
  USING (
    ticket_id IN (SELECT id FROM tickets WHERE created_by = auth.uid() OR assigned_to = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Ticket participants can reply"
  ON ticket_replies FOR INSERT
  WITH CHECK (
    ticket_id IN (SELECT id FROM tickets WHERE created_by = auth.uid() OR assigned_to = auth.uid())
    OR is_admin()
  );

-- ─── ANNOUNCEMENTS policies ───
CREATE POLICY "Users can view relevant announcements"
  ON announcements FOR SELECT
  USING (
    target_roles = '{}'
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = ANY(target_roles)
    OR is_admin()
  );

CREATE POLICY "Admins can manage announcements"
  ON announcements FOR ALL
  USING (is_admin());

-- ─── CALENDAR EVENTS policies ───
CREATE POLICY "Users can view relevant events"
  ON calendar_events FOR SELECT
  USING (
    target_roles = '{}'
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = ANY(target_roles)
    OR created_by = auth.uid()
    OR is_admin()
  );

CREATE POLICY "Admins can manage events"
  ON calendar_events FOR ALL
  USING (is_admin());

-- ─── TASKS policies ───
CREATE POLICY "Users can view assigned tasks"
  ON tasks FOR SELECT
  USING (assigned_to = auth.uid() OR assigned_by = auth.uid() OR is_admin());

CREATE POLICY "Admins and assigners can manage tasks"
  ON tasks FOR ALL
  USING (assigned_by = auth.uid() OR is_admin());

CREATE POLICY "Assignees can update task status"
  ON tasks FOR UPDATE
  USING (assigned_to = auth.uid());

-- ─── ATTENDANCE policies ───
CREATE POLICY "Users can view own attendance"
  ON attendance FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can mark own attendance"
  ON attendance FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can manage attendance"
  ON attendance FOR ALL
  USING (is_admin());

-- ─── PROJECTS policies ───
CREATE POLICY "Clients can view own projects"
  ON projects FOR SELECT
  USING (client_id = auth.uid() OR auth.uid() = ANY(team_members) OR is_admin());

CREATE POLICY "Admins can manage projects"
  ON projects FOR ALL
  USING (is_admin());

-- ─── REPORTS policies ───
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (submitted_by = auth.uid() OR reviewed_by = auth.uid() OR is_admin());

CREATE POLICY "Users can submit reports"
  ON reports FOR INSERT
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Admins can manage reports"
  ON reports FOR ALL
  USING (is_admin());

-- ─── CERTIFICATES policies ───
CREATE POLICY "Students can view own certificates"
  ON certificates FOR SELECT
  USING (student_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can manage certificates"
  ON certificates FOR ALL
  USING (is_admin());

-- ─── RESUMES policies ───
CREATE POLICY "Students can manage own resumes"
  ON resumes FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Admins can view resumes"
  ON resumes FOR SELECT
  USING (is_admin());

-- ─── MENTOR SESSIONS policies ───
CREATE POLICY "Mentors and students can view sessions"
  ON mentor_sessions FOR SELECT
  USING (mentor_id = auth.uid() OR student_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can manage mentor sessions"
  ON mentor_sessions FOR ALL
  USING (is_admin());

-- ─── MENTOR RESOURCES policies ───
CREATE POLICY "Mentors can manage own resources"
  ON mentor_resources FOR ALL
  USING (mentor_id = auth.uid() OR is_admin());

CREATE POLICY "Public resources viewable by all"
  ON mentor_resources FOR SELECT
  USING (is_public = true);

-- ─── LEARNING MATERIALS policies ───
CREATE POLICY "All authenticated can view materials"
  ON learning_materials FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage materials"
  ON learning_materials FOR ALL
  USING (is_admin());

-- ─── LEARNING PROGRESS policies ───
CREATE POLICY "Users can manage own progress"
  ON learning_progress FOR ALL
  USING (user_id = auth.uid() OR is_admin());

-- ─── NOTIFICATIONS policies ───
CREATE POLICY "Users can view own notifications"
  ON notifications FOR ALL
  USING (user_id = auth.uid());

-- ─── AUDIT LOG policies ───
CREATE POLICY "Only admins can view audit log"
  ON audit_log FOR SELECT
  USING (is_admin());

CREATE POLICY "System can insert audit log"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS: Auto-create profile on signup
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS: Updated_at auto-update
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_resumes_updated_at BEFORE UPDATE ON resumes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- AUTO-GENERATE TICKET NUMBERS
-- ═══════════════════════════════════════════════════════════════
CREATE SEQUENCE ticket_seq START 1000;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || LPAD(nextval('ticket_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number BEFORE INSERT ON tickets FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- ═══════════════════════════════════════════════════════════════
-- AUTO-GENERATE INVOICE NUMBERS
-- ═══════════════════════════════════════════════════════════════
CREATE SEQUENCE invoice_seq START 1000;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV-' || LPAD(nextval('invoice_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number BEFORE INSERT ON payments FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- ═══════════════════════════════════════════════════════════════
-- AUTO-GENERATE CERTIFICATE NUMBERS
-- ═══════════════════════════════════════════════════════════════
CREATE SEQUENCE cert_seq START 1000;

CREATE OR REPLACE FUNCTION generate_cert_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.certificate_number := 'CERT-SUG-' || LPAD(nextval('cert_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_cert_number BEFORE INSERT ON certificates FOR EACH ROW EXECUTE FUNCTION generate_cert_number();

-- ═══════════════════════════════════════════════════════════════
-- SEED: Admin User
-- ═══════════════════════════════════════════════════════════════
-- DO NOT create admin via raw INSERT INTO auth.users — it breaks
-- GoTrue login (500 error). Instead:
--
-- 1. Run this schema SQL first (creates tables, triggers, etc.)
-- 2. Then run the separate "seed-admin.sql" file which uses
--    supabase_admin functions to create the admin properly.
--
-- Admin credentials:
--   Email:    sugcreative.dev@gmail.com
--   Password: Admin@SUG2026!
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- No seed data — manage all content via the admin dashboard.
-- ═══════════════════════════════════════════════════════════════
