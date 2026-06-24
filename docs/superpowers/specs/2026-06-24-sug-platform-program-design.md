# SUG Creative — Platform Program (Master Review Doc)

**Date:** 2026-06-24
**Status:** Awaiting your confirmation (review doc — no code written yet)
**Supersedes:** the 2026-06-20 draft.

---

## 0. Read me first

This is now a **7-workstream program**, not a small batch. It's too big for one implementation pass,
so this doc **decomposes it into phases**, each shippable on its own. Per your request, implementation
will **use parallel sub-agents** for independent workstreams (see §10).

Confirmed decisions so far:

| Topic | Decision |
|---|---|
| Email provider | **Resend** |
| Services restructure | Home **+** `/services`; keep `/business-solutions` B2B page intact |
| Career Programs order | Controlled from **admin course management** (`display_order`), not hardcoded |
| Course/service emails | **Both** (enrollment confirmation **+** contact/inquiry) |
| Video testimonials | Use the 6 files in `public/video-testimonials/` in the home Success Stories section |
| Payslips/offer letters | **System-generated** → folded into the new **Documents** system (certs + offer letters) |
| Employee menu | Add items to existing sidebar |
| Study Abroad | New world-class page; **top** of Services + top of the services dropdown; **re-skinned to SUG green theme** |
| PDF tooling | **`html2canvas` + `jsPDF`** (client-side, ×3 high-res), works serverless + in-browser |
| Video testimonials | **User provides hosted links** (no local files served) — embed with poster + lazy-load |
| Build order | **Phase 1 quick wins first** (course bug fix + hero spacing + services/navbar relabel) |

🟡 = assumption needing your confirmation. 🔴 = blocker needing a decision before that part can be built.

---

## Workstream A — Marketing site (frontend)

**A1. Hero spacing** — `src/app/page.tsx` (~175–249). Normalize the stacked `min-h-screen`/`pt`/`pb`
padding so the gap to the next section is consistent. Pure spacing, no content change.

**A2. Career Programs order from DB** — Today the home "Career Programs" cards come from a **hardcoded
`courses` array** (`page.tsx` ~102–151). Change it to render **featured courses from the DB ordered by
`display_order`**, so the admin's course-management order drives the homepage. (Depends on **D**.)

**A3. Services → pillars (Study Abroad first)** — Replace the home "Business Services" block
(Web Dev, UI/UX, Software Dev, IT Consulting; `page.tsx` ~154–159 / ~397–466) and restructure `/services`
around these pillars **in this order**:
1. **Study Abroad** (top) 2. **Trainings** 3. **Student Career Services** 4. **Edu Services**
Also update the **navbar** services dropdown (`Navbar.tsx` ~36–44 and `menuItems`) to drop Web Dev/UI-UX
and put **Study Abroad at the top**. `/business-solutions` B2B page stays as-is.

**A4. Video testimonials in Success Stories** — `page.tsx` ~469–520. Add a video testimonials block.
**Resolved:** hosted on Wix CDN as **direct MP4s** — embed via `<video preload="none" poster=…>`,
lazy-loaded with poster thumbnails. Provided URLs:
```
https://video.wixstatic.com/video/69c361_864274892b1f4455a9e2fb5bce5c07c0/1080p/mp4/file.mp4
https://video.wixstatic.com/video/69c361_f88da60a4eb24075b72619535076f563/1080p/mp4/file.mp4
https://video.wixstatic.com/video/69c361_d42d0ac132a746b1a3f34ce9b4dcfc75/480p/mp4/file.mp4
https://video.wixstatic.com/video/69c361_6a2c8d7fc82b4e96ad29cd8bed2d85ca/1080p/mp4/file.mp4
https://video.wixstatic.com/video/69c361_c762bf2369b94185a7e28cdbd1562b16/1080p/mp4/file.mp4
```
⏳ Still need **name / company / role** per video for the captions (can ship with generic captions and fill in later).

**A5. Business Solutions animations** — `business-solutions/page.tsx`. Add an animated **client-logo marquee**
(reuse existing `LogoLoop`) + animate the client photo testimonials (`clientTestimonials` ~202, rendered ~629)
on scroll-in with stagger/hover. 🟡 Need real client logo files (placed in `public/clients/`); photos are
currently Unsplash placeholders.

## Workstream B — Email platform (Resend) — *foundational, build early*

**B1.** `src/lib/email/` module: `sendEmail()`, batch helper, React email templates. Add `resend` dep +
`RESEND_API_KEY`, `EMAIL_FROM`. 🟡 Needs a verified Resend sending domain (test domain works until DNS set).
**B2.** Announcements → email targeted recipients (`api/announcements` POST, ~31–73; uses `target_roles`).
**B3.** Transactional sends: enrollment confirmation (`api/courses/[id]/enroll`), contact/inquiry
(`api/site-queries`), signup approval (→ G), document delivery (→ E). Chunk large sends.

## Workstream C — Study Abroad page + navigation

**C1.** New page at **`/services/study-abroad`** (or `/study-abroad`) built from
`Study Abroad Sugcreative.html` (834 lines; sections: hero "boarding pass", why-study-abroad value props,
7 destination gateways — Australia/Canada/UK/USA/Germany/Ireland/New Zealand, services/process steps,
"why us", stats, FAQ, CTA). 🟡 **Design decision (Q4):** the HTML uses a *boarding-pass* aesthetic
(navy/paper/gold, Fraunces serif) that differs from the site's green neo-brutalist theme. You said "follow
the site theme" — I'll **re-skin the content into SUG's design system** (components, green palette, existing
Navbar/Footer) while keeping the boarding-pass *concept* as accent. Confirm that's what you want vs. keeping
the standalone aesthetic.
**C2.** Add Study Abroad to `/services` (top) + navbar dropdown (top) + mobile menu. Enrich content from the
template (and reputable public sources) — accurate, cost-effective copy.
**C3.** 🟡 Schema: if Study Abroad needs editable content/leads (e.g., a "book counselling" form), add a
`study_abroad_leads` table + migration. Otherwise it's a static designed page. Default: static page now +
reuse existing contact/site-queries for the counselling form.

## Workstream D — Course management overhaul

**D0 🔴 BUG FIX (urgent):** "Could not find the `enrollment_limit` column" — the `courses` table has
`max_students`, but the form/`lib/courses.ts`/enroll route use `enrollment_limit`, and **no migration ever
added it**. Migration: `ALTER TABLE courses ADD COLUMN enrollment_limit INT, ADD COLUMN display_order INT`
(+ index). This alone fixes the create/update error.
**D1. Live preview** — admin course editor shows a **live preview** matching the public course page
(`/courses/[slug]`) while editing.
**D2. Display order** — admin can set `display_order`; drives homepage Career Programs (A2) and listing.
**D3. Public-page accuracy/staleness** — edits "don't reflect / delayed": public course pages are statically
cached. Fix with **on-demand revalidation** (`revalidatePath`/tag on course write) or dynamic rendering so
changes appear immediately.
**D4. Image integration** — free image search **inside the editor** to pick course images. 🟡 Provider
(Q3): **Unsplash** or **Pexels** (both free APIs; need a free API key). Selected image URL saved to
`thumbnail_url`/`photos`.
**D5. Tags / advanced DB** — persist tags; **auto-suggest/auto-complete** from previously used tags.
Migration: a `course_tags` (or `tags`) table or a tag-aggregation, with indexing for recommendations.

## Workstream E — Documents: Certificates & Offer Letters

**E1. Admin sidebar** "Certificate & Offer Letters" → page with **two generators** (Offer Letter,
Certificate) as horizontal dropdowns/tabs.
**E2. Templates & default content** (match provided images; SUG branding — logo, name, color palette):
- **Certificate** (geometric template from image): default content for **Appreciation**, **Completion**,
  **Internship**. 🟡 The sample shows the *"Young Compete"* sub-brand — Q5: rebrand to SUG Creative, or keep
  "Young Compete" as a sub-brand option?
- **Offer Letter** (SUG letterhead): logo **watermark** in the page background; body default content; signature.
- Admin can use default text **or** edit custom text.
**E3. Verify Document** — top-bar "Verify Document": enter a Certificate/Offer-Letter **ID** → verify + view.
Public verification route so external parties can check authenticity.
**E4. Generation workflow** — choose **Internal (Dashboard) user** (select user → auto-fill name/mobile/email
from `profiles`) **or External user** (manual entry). **Live preview on the right.** Then **Download** or
**Send to Mail** (Resend, with type-appropriate "Congratulations"/"Welcome" email template).
**E5. Signature** — **Brittany** font in the signature field; admin can **sign in-browser**: a movable "Sign"
window (draw on canvas) → place the signature anywhere on the document → insert.
**E6. Document IDs** — verification IDs matching the template style (e.g. `SUGYCGC2025CE02RD05`,
`SUGNFSIN05HR12RH24`). 🟡 Q5: confirm the ID scheme (prefix = SUG + sub-brand + type + year + sequence/check).
**E7. PDF rendering** — Q2: recommended approach below. Store generated PDFs in **Supabase Storage**; persist
records in a `documents` table (type, doc_id, recipient, content, signature, pdf_url, status, issued_at).

## Workstream F — Structured user / employee IDs

**F1.** Role-based human IDs, shown in **profile** and **All Users** list. Migration: add `display_id TEXT
UNIQUE` to `profiles` + assignment (trigger/function) + **backfill**. 🟡 Q3 (format) — proposed:
| Role | Format | Example |
|---|---|---|
| Employee | `EMP` + 6 digits | `EMP000123` |
| Intern | `INT` + 6 digits | `INT000123` |
| Student | `STU` + 6 digits | `STU000123` |
| Mentor | `MEN` + 6 digits | `MEN000123` |
| Client | `CLI` + 6 digits | `CLI000123` |
| Admin | `SUG-ADM` + 3 digits | `SUG-ADM007` |

## Workstream G — Signup-request workflow (no email verification)

Current: `login/page.tsx` calls `supabase.auth.signUp` → Supabase sends a **confirmation email**.
New flow:
**G1.** Signup goes through a **server API route** (service role) that creates the user with
`email_confirm: true` (so **no verification email**) and sets profile **`status='pending'`** — appears in
admin **"Signup Requests"** (already exists in `admin/users`).
**G2.** Login is **blocked while pending** (app-level check) with a clear "awaiting approval" message.
**G3.** Admin approves → status `active`.
**G4.** Approval triggers a **Resend "approved"** email; user then logs in with email + password.
🔴 **Manual step:** you must turn **off** "Confirm email" in **Supabase → Auth settings** (dashboard toggle,
not code) for this to fully take effect.

---

## 1. Recommended technical choices (for your confirmation)

- **PDF (E7) — recommended:** design each template as a React/HTML component (pixel-accurate, easy watermark/
  signature placement), render to high-res PDF with **`html2canvas` + `jsPDF`** (in-browser, scale ×3 for
  print quality) for **Download**; for **Send to Mail**, generate the same PDF client-side and upload to
  Storage, then email the link/attachment. This satisfies "in-browser + serverless + high-res" without a
  headless-Chrome serverless dependency. (Alt: `@react-pdf/renderer` — more robust on server but harder to
  match a pixel design.) → **Q2**.
- **Images (D4):** **Unsplash API** (free, generous, high quality) — or Pexels. → **Q3**.
- **Video (A4):** compress to 720p H.264 ≤10 MB **or** host in Supabase Storage/CDN, `<video preload="none">`
  + poster, lazy-load. → **Q1**.

## 2. New dependencies
`resend`, `jspdf`, `html2canvas` (or `@react-pdf/renderer`), an Unsplash/Pexels client (or plain fetch),
a Brittany signature font file (licensed) added to `public/fonts`.

## 3. New environment variables
`RESEND_API_KEY`, `EMAIL_FROM`, `UNSPLASH_ACCESS_KEY` (or `PEXELS_API_KEY`), `SUPABASE_SERVICE_ROLE_KEY`
(exists).

## 4. New migrations (in `supabase/migrations/`, dated + titled)
- `…_courses_enrollment_limit_display_order.sql` — **D0** (fixes the bug).
- `…_course_tags.sql` — D5.
- `…_profiles_display_id.sql` — F (+ backfill).
- `…_documents.sql` — E (documents + verification).
- `…_signup_requests_status.sql` — G (if status/columns needed).
- `…_study_abroad.sql` — C3 (only if leads/content tables needed).

## 5. New / changed API routes
`api/auth/signup` (G), `api/documents` (+ `[id]`, `/verify`) (E), `api/images/search` (D4),
`api/course-tags` (D5), `api/announcements` POST (B2), `api/courses/[id]/enroll` + `api/site-queries` (B3),
course write routes add revalidation (D3).

## 6. Out of scope / untouched
Internal messaging migration (`20260504_messaging.sql`), stray root scratch files (`fix-*.js`, `*.patch`,
`page.tsx.orig/.backup`). The `Study Abroad Sugcreative.html` is a **source**, not shipped as-is.

---

## 7. Phasing (each phase = its own plan; independent ones run via parallel sub-agents)

- **Phase 1 — Quick wins & unblockers:** D0 (course bug fix migration), A1 (hero spacing), A3/C2 navbar+
  services pillar relabel. Low risk, immediate value.
- **Phase 2 — Email foundation (B1)** then **B2** (announcements).
- **Phase 3 — Study Abroad page (C1–C3).** Parallelizable with Phase 2.
- **Phase 4 — Course management (D1–D5)** + A2 (homepage pulls DB order).
- **Phase 5 — Identity & access:** F (IDs) + G (signup workflow) + employee menu items.
- **Phase 6 — Documents (E)** — biggest; depends on B (email) and F (IDs). Built last.
- **Phase 7 — Media polish:** A4 (videos, after compression decision), A5 (logo/photo animations).

## 8. Decisions & remaining questions

**Resolved (this round):** Videos = **hosted links** (you provide). PDF = **html2canvas + jsPDF**. Study
Abroad = **re-skin to SUG green theme**. Build order = **Phase 1 quick wins first**.

**Still needed before their phase starts (non-blocking for Phase 1):**
- **Q-A (Phase 7):** ✅ video URLs received (5 Wix MP4s). Still need name/company/role per video for captions.
- **Q-B (Phase 4 / D4):** image provider — **Unsplash** (recommended) or Pexels? Can you obtain the free API key?
- **Q-C (Phase 5 / F):** confirm the role-ID scheme in §F (EMP/INT/STU/MEN/CLI 6-digit, `SUG-ADM` for admin).
- **Q-D (Phase 6 / E):** certificate branding — rebrand to **SUG Creative** or keep **"Young Compete"** as a
  selectable sub-brand? Confirm the document-ID format (`SUG`+sub-brand+type+year+sequence).
- **Q-E (Phase 5 / G):** acknowledge the manual Supabase dashboard step — turning **off** "Confirm email".
