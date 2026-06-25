# SUG Creative — Activation / Manual Steps

Everything in the `phase1-quick-wins` branch is implemented and builds clean. To make it
fully live, complete these manual steps (the app degrades gracefully until you do — nothing
crashes if a key/migration is missing).

## 1. Run the database migrations (Supabase SQL editor, in this order)
All are idempotent (safe to re-run) and end with `NOTIFY pgrst, 'reload schema'`.

1. `supabase/migrations/20260624_courses_enrollment_limit_display_order.sql`
   — fixes the "Could not find the 'enrollment_limit' column" course-save error; adds `display_order`.
2. `supabase/migrations/20260624_course_tags.sql`
   — `courses.tags[]` + `course_tags` catalogue + sync trigger (tag auto-suggest).
3. `supabase/migrations/20260624_profile_display_id.sql`
   — role-based IDs (`EMP000123`, `INT000123`, `STU000123`, `MEN000123`, `CLI000123`, `SUG-ADM007`),
     assigned on insert + backfilled for existing users.
4. `supabase/migrations/20260624_documents.sql`
   — `documents` table (certificates + offer letters) + RLS.

## 2. Supabase Auth setting (required for the new signup flow)
- Supabase Dashboard → **Authentication → Providers/Settings → turn OFF "Confirm email"**.
- Why: signups now go to an admin-approval queue. The server pre-confirms the address (no
  verification email); users can't log in until an admin approves them in
  **Admin → User Management → Signup Requests**, which then sends an approval email.

## 3. Environment variables (`.env.local` + Vercel project env)
| Variable | Status | Purpose |
|---|---|---|
| `RESEND_API_KEY` | **already set** in your `.env.local` | Sending email (announcements, enrollment, approvals, documents). |
| `EMAIL_FROM` | set me | e.g. `"SUG Creative <noreply@yourdomain.com>"` — use a **verified Resend domain** for good deliverability. |
| `NEXT_PUBLIC_SITE_URL` | set me | Used in email links + document verify URLs (e.g. `https://sugcreative.com`). |
| `ADMIN_NOTIFY_EMAIL` | optional | Where new contact-form enquiries are emailed. |
| `UNSPLASH_ACCESS_KEY` | optional | Free image search in the course editor (https://unsplash.com/developers). Without it, image search shows a friendly "not configured" message. |
| `SUPABASE_SERVICE_ROLE_KEY` | already required | Used server-side by admin/signup/documents routes. |

## 4. Optional assets
- **Brittany Signature font:** paid font, not in repo. The signature field uses a cursive
  fallback. To match your template exactly, drop a web font at `public/fonts/brittany-signature.woff2`
  and uncomment the `@font-face` block in `src/app/globals.css` (`.font-signature`). The
  hand-drawn signature canvas works regardless.
- **Client logos** for the Business Solutions marquee currently reuse the homepage placement
  logos; swap in real client logos under `public/` if desired.

## 5. What shipped (by area)
- **Marketing:** hero spacing; services → 4 pillars (Study Abroad first) on home, `/services`,
  and the navbar; new world-class **`/services/study-abroad`** page; **video testimonials**
  (your 5 hosted clips, click-to-load); Business Solutions logo marquee + animated client cards.
- **Email:** Resend module + branded templates, wired into announcements (batched to target
  roles), course enrollment, and the contact form — all best-effort.
- **Identity:** role-based display IDs shown/searchable in Admin → Users; admin-approval signup
  workflow with approval email.
- **Courses:** save bug fixed; advanced editor (live preview, image search, tag auto-suggest,
  display-order, featured); homepage Career Programs now driven by the DB (admin-controlled order),
  with the old hardcoded list as fallback; public course pages revalidate on edit.
- **Documents:** Admin → **Documents → Certificate & Offer Letters** generator (templates +
  default content for Appreciation/Completion/Internship/Excellence + Offer Letter; internal/external
  recipient with autofill; live preview; draggable signature canvas; Download PDF; Send to Mail;
  Verify Document). Public **`/verify?id=`** page. Employees & interns get **My Documents**.

## 6. Open item to confirm
- **Payslips:** your first message mentioned payslips, but the detailed spec only defined
  certificates + offer letters, so the documents system covers those. If you want a distinct
  **payslip generator** (salary components → payslip PDF, monthly), tell me the fields and I'll
  add it as a new document type using the same engine.
