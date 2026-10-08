# CONT MARJO Web UX Redesign Implementation Plan

> **For agentic workers:** Execute inline in the current session, one task at a time, verifying after each surface.

**Goal:** Give the existing tax/accounting prototype a calm, coherent, intuitive web interface while reserving native mobile for a later React Native project.

**Architecture:** Keep the existing React, Tailwind v4, Lucide, and shared AppContext. Define shared brand color and interaction tokens in `src/index.css`; refine the authenticated shell, navigation, access screen, and role dashboards; keep each business flow in its existing module. Remove the mobile simulator switch and its render path from the web application without starting React Native work.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Vite.

## Global Constraints

- Keep all existing demo flows, roles, and local data behavior working.
- The prototype must continue to disclose that SRI, OCR, and certificate interactions are simulations.
- Profile remains at the far right of the web header.
- Primary action on contributor home remains “Nuevo”; document type is chosen from its menu.
- Do not implement React Native in this task.
- Preserve responsive web layout, keyboard access, visible focus, and reduced-motion support.

---

### Task 1: Shared visual foundation — complete

**Files:** Modify `src/index.css`, `index.html`.

- Replace intense blue utility shades with a muted blue/teal slate scale and unify canvas, typography, focus, selection, controls, and surfaces.
- Keep clear contrast for text and primary actions; ensure numeric figures remain tabular.
- Preserve existing local/remote font setup unless a verified better fit can be used without adding fragile dependencies.
- Verify generated Vite CSS and TypeScript build.

### Task 2: Web shell and navigation — complete

**Files:** Modify `src/App.tsx`, `src/components/layout/WebHeader.tsx`, `src/components/layout/WebSidebar.tsx`.

- Remove the Web/Mobile simulator control and stop rendering `MobileShell` from the web application.
- Keep the logo at the left and profile at the far right; keep role, alerts, and notifications grouped as secondary controls.
- Replace the dark saturated sidebar with a quiet light navigation surface, clear active state, consistent labels, responsive rail, and keyboard focus.
- Give the content area consistent width, spacing, and background.
- Verify all three roles retain their intended start pages and tab navigation.

### Task 3: Access and contributor home — complete

**Files:** Modify `src/components/modules/AccessModule.tsx`, `src/components/modules/DashboardModule.tsx`.

- Create a clear access hierarchy for sign-in/registration and role choice, with labeled fields, examples, focus states, and a compact demo disclosure.
- Make “Nuevo” the unmistakable primary action and present each document type as a labeled menu option.
- Clarify the home page title, accounting metrics, next obligation, signature status, demo states, and recent document history.
- Keep the primary task understandable at desktop and narrow web widths.

### Task 4: Role screens and business modules — complete

**Files:** Modify existing modules in `src/components/modules/` and shared modals in `src/components/common/` only where needed for visual consistency or orientation.

- Apply the common surface, heading, spacing, table, form, badge, empty-state, and button language to contributor profile, document history, purchases/inventory, tax calendar, and marketplace.
- Apply the same visual system to CPA dashboard/client evidence/marketplace and Super Admin, while keeping role-specific labels and tasks distinct.
- Preserve the already implemented flows and avoid changing domain behavior unless a visible interaction is confusing or inaccessible.

### Task 5: Visual and interaction verification — complete

**Files:** No new app files unless a concrete issue is found.

- Run `node ./node_modules/typescript/bin/tsc --noEmit` and `node ./node_modules/vite/bin/vite.js build`.
- Start the existing Vite app and inspect the rendered login, contributor home, profile, purchases/inventory, CPA workspace, marketplace, and Super Admin at desktop and narrow web widths.
- Check that the profile is at the far right, no mobile simulator toggle remains, the primary action is obvious, keyboard focus is visible, no horizontal overflow appears, and simulated states remain labeled.
- Fix issues found and rerun relevant checks.
