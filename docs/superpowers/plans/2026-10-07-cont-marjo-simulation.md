# CONT MARJO 360 Simulation Improvements Implementation Plan

> **For agentic workers:** Execute this approved plan inline in the current session. Track each completed deliverable below.

**Goal:** Make the local prototype's contributor, accountant and super-admin demo flows understandable, role-specific and reactive, completing OCR inventory visibility and the agreed registration/profile/document workflows.

**Architecture:** Extend the existing React Context as the single mock data store. Add focused profile/setup and inventory views, derive role navigation from the selected demo role, and reuse the current OCR, invoice, vault, calendar and marketplace modules where possible. Keep every external SRI, OCR and certificate operation explicitly local and simulated.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4 and lucide-react, following the existing app patterns.

## Global Constraints

- No backend is available; all registration, login, OCR, signature, SRI responses and persistence-like state remain simulated in the browser.
- Do not imply legal validity, SRI authorization or real encryption.
- Keep the existing client-side Context and shared mock reactivity.
- Preserve the existing OCR reconciliation behavior while adding a visible inventory ledger.
- User approved inline implementation; do not pause for another planning/approval turn.

---

### Task 1: Shared roles, profile setup and navigation

**Files:** `src/types/index.ts`, `src/context/AppContext.tsx`, `src/App.tsx`, `src/components/layout/WebSidebar.tsx`, `src/components/layout/WebHeader.tsx`; create `src/components/modules/ProfileModule.tsx` and `src/components/modules/RegistrationModule.tsx`.

- [ ] Add demo registration/login entry for contributor/accountant roles, resumable contributor setup steps and an explicit admin demo entry.
- [ ] Add a profile workspace with account, tax information, establishments, certificate status and an embedded vault section.
- [ ] Replace the contributor sidebar's separate vault/onboarding destinations with Profile; give accountant and super-admin role-focused menus.
- [ ] On role changes, navigate to that role's home instead of keeping an inaccessible module open. Label the switcher as demo-role simulation.

### Task 2: Dashboard document creation and document types

**Files:** `src/types/index.ts`, `src/context/AppContext.tsx`, `src/components/modules/DashboardModule.tsx`, `src/components/modules/InvoicingModule.tsx`, `src/components/common/RideViewerModal.tsx`.

- [ ] Add a prominent Nuevo document menu on Inicio with invoice, credit/debit notes, withholding, dispatch guide and purchase settlement plus client/product shortcuts.
- [ ] Carry the selected document type into the form and keep generated history/RIDE labels aligned to that type.
- [ ] Clearly label local simulation states and previews; remove copy that claims live SRI production authorization.

### Task 3: Purchase reconciliation and usable inventory

**Files:** `src/context/AppContext.tsx`, `src/components/modules/PurchaseOcrModule.tsx`; create `src/components/modules/InventoryModule.tsx`.

- [ ] Preserve OCR parsing and add repeatable uploads that create a new mock parsed purchase.
- [ ] Require at least one selected accounting action before reconciliation.
- [ ] Add a searchable inventory table showing SKU, product, stock, average cost and source invoice; show stock movements/results after reconciliation.
- [ ] Keep expenses, accounts payable and inventory accessible through labeled module tabs or subviews.

### Task 4: Consistent calendar, marketplace roles and admin demo

**Files:** `src/context/AppContext.tsx`, `src/components/modules/TaxCalendarModule.tsx`, `src/components/modules/MarketplaceModule.tsx`, `src/components/modules/AccountantDashboardModule.tsx`, `src/components/modules/SuperAdminModule.tsx`.

- [ ] Make month/agenda reflect the same deadline state and use a current, explicit demo date.
- [ ] Split contributor and accountant marketplace actions and views; bind conversations to the selected request/provider and guard permission controls by role.
- [ ] Mark super-admin counts, service status and audit logs as demonstration data.
- [ ] Ensure switching to another client shows an unmistakable simulated delegated context, and provide a correct return action; never show another client's name over unchanged contributor data.

### Task 5: Responsive layout and final verification

**Files:** `src/App.tsx`, `src/components/layout/MobileShell.tsx`, `src/components/layout/WebSidebar.tsx`, `src/components/common/RideViewerModal.tsx`, `src/index.css`, touched modules above.

- [ ] Remove notification overlays that cover primary controls or allow them to be dismissed predictably; provide an in-app notification surface in the mobile simulator.
- [ ] Make the web sidebar/content usable at 360–390px and reflow the RIDE toolbar on small screens.
- [ ] Run TypeScript and production build; resolve implementation errors and summarize any remaining gaps.

## Self-review

- Spec coverage: role-specific registration/navigation (Task 1); Nuevo and type-consistent documents (Task 2); OCR and inventory results (Task 3); calendar, marketplace and admin behavior (Task 4); responsive 360px layouts and notifications (Task 5).
- No unresolved placeholders or external-service assumptions; all actions remain mock behavior.
- Shared `DocumentType`, Context and profile sections are introduced before downstream UI use.
