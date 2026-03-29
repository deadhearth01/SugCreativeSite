-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  SUG CREATIVE — EduTech Transformation Migration                      ║
-- ║  Run this in Supabase SQL Editor                                     ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 1. PROFILES TABLE UPDATES
-- Add username and avatar support for new users
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_id INTEGER DEFAULT 1 CHECK (avatar_id >= 1 AND avatar_id <= 4);

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- ═══════════════════════════════════════════════════════════════
-- 2. COURSES TABLE ENHANCEMENTS
-- Add pricing, tech stack, and theme fields for course management
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS original_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS offer_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS tech_stack TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS color_theme TEXT DEFAULT 'cyan',
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS duration_text TEXT,
ADD COLUMN IF NOT EXISTS batch_start_date DATE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(is_featured);

-- ═══════════════════════════════════════════════════════════════
-- 3. SEED INITIAL EDUTECH COURSES
-- Pre-populate with the 4 internship tracks from poster
-- ═══════════════════════════════════════════════════════════════

INSERT INTO courses (
  title, 
  description, 
  category, 
  price, 
  original_price, 
  offer_price,
  tech_stack, 
  highlights, 
  color_theme, 
  slug,
  duration_text,
  batch_start_date,
  status,
  is_featured
) VALUES 
(
  'DevOps Internship',
  'Master CI/CD pipelines, container orchestration with Docker & Kubernetes, cloud automation, infrastructure-as-code & DevSecOps practices that leading MNCs rely on every day.',
  'edu_tech',
  7999,
  12999,
  7999,
  ARRAY['Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'AWS / GCP', 'GitOps'],
  '[
    "CI/CD pipeline design & automation",
    "Cloud infra provisioning & monitoring",
    "DevSecOps & compliance practices",
    "Live production deployment experience"
  ]'::jsonb,
  'violet',
  'devops-internship',
  '3 Months',
  '2025-04-20',
  'active',
  true
),
(
  'Cyber Security Internship',
  'Deep-dive into ethical hacking, penetration testing, network security, VAPT, and threat intelligence with live CTF labs designed by active cybersecurity professionals from top MNCs.',
  'edu_tech',
  4999,
  9999,
  4999,
  ARRAY['Kali Linux', 'Metasploit', 'Wireshark', 'Burp Suite', 'SIEM', 'VAPT'],
  '[
    "Ethical hacking & penetration testing",
    "Network defence & threat analysis",
    "Web application security audits",
    "Real-world CTF & live lab challenges"
  ]'::jsonb,
  'blue',
  'cyber-security-internship',
  '3 Months',
  '2025-04-20',
  'active',
  true
),
(
  'IoT & Embedded Systems Internship',
  'Go from circuit to cloud — learn embedded C, RTOS, microcontroller programming, sensor integration and build complete smart IoT solutions from prototype all the way to live deployment.',
  'edu_tech',
  4999,
  9999,
  4999,
  ARRAY['Arduino', 'Raspberry Pi', 'Embedded C', 'RTOS', 'MQTT', 'AWS IoT'],
  '[
    "Microcontroller & sensor programming",
    "Real-time OS & firmware development",
    "IoT protocol design & integration",
    "End-to-end smart system projects"
  ]'::jsonb,
  'green',
  'iot-embedded-internship',
  '3 Months',
  '2025-04-20',
  'active',
  true
),
(
  'Full Stack Dev Internship',
  'Build production-ready web apps end-to-end — master React, Node.js, REST APIs, SQL & NoSQL databases, user authentication and deploy real apps to cloud platforms with CI/CD workflows.',
  'edu_tech',
  5999,
  10999,
  5999,
  ARRAY['React.js', 'Node.js', 'MongoDB', 'PostgreSQL', 'REST APIs', 'Vercel/AWS'],
  '[
    "Responsive UI with React & Tailwind",
    "Backend APIs, auth & database design",
    "Full-stack cloud deployment",
    "GitHub portfolio & code reviews"
  ]'::jsonb,
  'gold',
  'fullstack-dev-internship',
  '3 Months',
  '2025-04-20',
  'active',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  offer_price = EXCLUDED.offer_price,
  tech_stack = EXCLUDED.tech_stack,
  highlights = EXCLUDED.highlights,
  color_theme = EXCLUDED.color_theme,
  duration_text = EXCLUDED.duration_text,
  batch_start_date = EXCLUDED.batch_start_date,
  status = EXCLUDED.status,
  is_featured = EXCLUDED.is_featured,
  updated_at = now();

-- ═══════════════════════════════════════════════════════════════
-- 4. HELPER FUNCTION: Check if username is available
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_username_available(check_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles WHERE username = lower(check_username)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- Done! Run this migration in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════
