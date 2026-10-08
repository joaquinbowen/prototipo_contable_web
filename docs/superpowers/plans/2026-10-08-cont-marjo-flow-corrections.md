# CONT MARJO UX Flow Corrections Implementation Plan

> Execute this approved request inline in the current session and verify visually in the local prototype.

**Goal:** Correct entry, navigation, document issuance, client audit evidence and role-specific marketplace flows.

**Architecture:** Keep React Context as the local demo store. Add a signed-out entry screen, keep demo authentication state in context, route role-specific workspaces, and persist uploaded evidence metadata in client-side state only.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, lucide-react.

## Global Constraints

- Authentication, file handling, OCR, certificates, audit results and SRI operations are local simulations.
- Uploaded file contents are not sent to a backend; display selected filename/type as evidence metadata.
- Do not claim SRI submission, certificate validation or real authorization.
- Preserve the existing taxpayer profile, vault and purchase OCR behaviors.

---

### Task 1: Entry, account and signature flow

**Files:** `src/context/AppContext.tsx`, `src/App.tsx`, `src/components/modules/ProfileModule.tsx`, `src/components/layout/WebHeader.tsx`, create `src/components/modules/AccessModule.tsx`.

- [x] Start in signed-out state and render login/register with account type selection.
- [x] After demo access, start contributor RUC onboarding or accountant professional setup.
- [x] Put profile access in the header's upper-left user area; remove profile from sidebar navigation.
- [x] Add certificate file selection and mock password/status inside Profile → Firma digital; keep the vault for business documents.

### Task 2: Contributor navigation and document history

**Files:** `src/components/layout/WebSidebar.tsx`, `src/components/modules/DashboardModule.tsx`, `src/components/modules/InvoicingModule.tsx`, create `src/components/modules/DocumentHistoryModule.tsx`, `src/App.tsx`.

- [x] Remove separate Facturación from the sidebar and make its destination an issued-document history with accounting summaries.
- [x] Keep one `Nuevo` menu on Inicio and history; choosing a type opens the type-specific form.
- [x] Remove the type selector from the issuance form and use only the selected `DocumentType` passed by the Nuevo action.

### Task 3: Client audit and delivery of evidence

**Files:** `src/types/index.ts`, `src/context/AppContext.tsx`, `src/components/modules/ClientWorkspaceModule.tsx`, `src/components/modules/AccountantDashboardModule.tsx`.

- [x] Add per-client evidence records with obligation type, period, file name/type, note and delivery status.
- [x] Provide an upload form for IVA monthly return, income tax return, ATS/annex or other obligation; accept PDF/XML and store demo metadata locally.
- [x] Show uploaded evidence in the client's audit history with date/status and a clear simulation label.

### Task 4: Accountant marketplace separation

**Files:** `src/components/modules/MarketplaceModule.tsx`, `src/context/AppContext.tsx`.

- [x] Separate accountant tabs into open opportunities, proposals sent and active clients/contracts.
- [x] Show requests created by the current demo contributor only in the contributor view, and offers only to their client.
- [x] Show only open opportunities and current accountant's submitted offers in the accountant view.

### Task 5: Verify complete routes

**Files:** all touched UI and context files.

- [x] Run TypeScript check and production build.
- [x] Visually verify signed-out → contributor access → dashboard/history → Nuevo form; accountant access → client audit → upload evidence → evidence visible; and separate marketplace views.

## Self-review

- All six user corrections map to Tasks 1–4; the clarification about tax-return evidence is explicit in Task 3.
- Every external integration remains demo-only and selected-file metadata is the only persisted upload result.
- Task 5 covers type and production-build checks plus the requested visual flow verification.
