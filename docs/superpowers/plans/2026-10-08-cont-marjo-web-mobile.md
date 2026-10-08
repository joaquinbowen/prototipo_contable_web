# CONT MARJO Web and Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate the approved CONT MARJO web prototype into its own pnpm/Git project and build a parallel native Expo application in a second pnpm/Git project.

**Architecture:** `web/` contains the existing Vite app with its behavior and design preserved. `mobile/` is an independent Expo Router TypeScript app with native screens and navigation that mirrors all three roles and the existing demo flows. No root workspace or shared runtime package is introduced.

**Tech Stack:** Web: React 19, TypeScript, Vite, Tailwind 4. Mobile: React Native, Expo SDK stable, Expo Router, TypeScript. Package management: pnpm 10.30.3. Source: `src/context/AppContext.tsx`, `src/types/index.ts`, and role-specific modules in `src/components/modules/`.

## Global Constraints

- Keep SRI, OCR, digital signature, and persistence clearly marked as local demonstrations.
- Preserve contributor, accountant, and superadmin role-specific navigation and flows.
- Use the approved muted teal/slate design identity with mobile-native layouts.
- Keep `web/` and `mobile/` as separate local Git repositories, each with its own pnpm lockfile.
- Never commit `node_modules`, build artifacts, local environment files, passwords, certificates, or API keys.
- Only pnpm commands for setup, development, and verification.

---

### Task 1: Relocate the existing web app

**Files:** Move the root Vite app, source, specification, UX evidence, and docs to `web/`; create `web/.gitignore` if needed.

- [x] Move the actual web project files into `web/`, preserving all current source and UX documentation.
- [x] Run `pnpm install --frozen-lockfile`, `pnpm lint`, and `pnpm build` inside `web/`.
- [x] Initialize Git inside `web/` and verify generated/dependency files are ignored.

### Task 2: Scaffold independent Expo app

**Files:** Create `mobile/package.json`, `mobile/pnpm-lock.yaml`, Expo config, `mobile/app/`, `mobile/src/`, `mobile/.gitignore`, and README.

- [x] Generate a current stable Expo Router TypeScript project using pnpm.
- [x] Pin compatible Expo packages through Expo's installer and set a stable app name/scheme.
- [x] Initialize Git inside `mobile/` and verify its repository root is independent from `web/`.
- [x] Run Expo doctor and TypeScript before implementing screens.

### Task 3: Native identity, state, and authentication

**Files:** `mobile/src/theme/`, `mobile/src/state/`, `mobile/src/data/`, `mobile/app/_layout.tsx`, `mobile/app/(auth)/`.

- [x] Define semantic design tokens from the approved web palette and safe-area/keyboard-aware shared screen primitives.
- [x] Add typed demo state for roles, contributor profile, documents, marketplace, clients, evidence, purchases and inventory.
- [x] Build sign-in and role-specific registration screens with the same visible demo limitations.
- [x] Verify role selection routes to the correct mobile home area.

### Task 4: Contributor mobile flows

**Files:** `mobile/app/(contributor)/`, contributor shared components.

- [x] Add contributor home and a contextual “Nuevo” document-type action.
- [x] Add document forms and document history with accounting summaries.
- [x] Add profile, RUC setup, digital certificate validation/attachment and document vault.
- [x] Add purchase OCR simulation, reconciliation, resulting inventory, and tax calendar.
- [x] Add contributor marketplace for finding accountants and tracking received proposals.

### Task 5: Accountant and superadmin mobile flows

**Files:** `mobile/app/(accountant)/`, `mobile/app/(admin)/`.

- [x] Add accountant summary and role-specific marketplace tabs for opportunities, sent proposals, and client portfolio.
- [x] Add client workspace with obligation type/period, evidence file attachment, and local demo receipt state.
- [x] Add superadmin overview with conspicuous simulated metrics and service statuses.
- [x] Verify role transitions never show another role's marketplace perspective.

### Task 6: Verification and run instructions

**Files:** both project READMEs and `.gitignore` files.

- [x] Run web lint/build and mobile typecheck/Expo doctor.
- [x] Verify mobile Expo starts and inspect its responsive browser render and Android/iOS bundles.
- [x] Check role-based navigation, contributor issuance, inventory reconciliation, and accountant evidence upload end-to-end.
- [x] Document pnpm commands and GitHub remote setup without publishing until an authenticated owner/visibility is available.
