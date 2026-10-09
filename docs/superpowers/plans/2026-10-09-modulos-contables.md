# Módulos contables Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir la pantalla única de contabilidad por seis módulos del contador con contexto de empresa y período compartido.

**Architecture:** El libro `AccountingContext` sigue siendo la fuente de datos. Un contenedor compartido resuelve empresa, período y mensajes, mientras cada módulo tiene su propio componente y ruta. Registro contable agrupa asientos con plan de cuentas como configuración secundaria.

**Tech Stack:** React, TypeScript, Vite, Tailwind, localStorage existente.

## Global Constraints

- No cambiar el perfil profesional ni asumir la identidad del contribuyente al elegir su libro.
- Mantener operaciones y exportaciones existentes; no modificar las reglas del dominio contable.
- Sidebar colapsado con etiquetas accesibles mediante foco además de hover.
- ATS y declaraciones siguen siendo simulaciones locales.

## Task 1: Contexto compartido y rutas

**Files:** `src/context/AccountingContext.tsx`, `src/App.tsx`, `src/components/layout/WebSidebar.tsx`, `src/components/layout/ContextBar.tsx`.

- [x] Guardar selección de período junto a empresa en el contexto, sin alterar libros.
- [x] Registrar seis rutas: registro, libros, estados, bancos, cierres, tributación; traducir la ruta anterior a registro.
- [x] Agrupar visualmente los seis enlaces en el sidebar; mantener nombres legibles en foco y hover.

## Task 2: Pantallas enfocadas

**Files:** `src/components/modules/accounting/AccountingShell.tsx`, `AccountingUi.tsx`, `RegisterModule.tsx`, `BooksModule.tsx`, `StatementsModule.tsx`, `BanksModule.tsx`, `ClosingModule.tsx`, `TaxModule.tsx`; retirar `AccountingWorkspace.tsx`.

- [x] Extraer selector común, alertas y acciones compartidas del monolito.
- [x] Extraer un componente por módulo conservando formularios, resultados y CSV.
- [x] En Registro, abrir asientos por defecto y dejar Plan de cuentas en una vista secundaria explícita.

## Task 3: Entrada desde cartera y verificación

**Files:** `src/components/modules/AccountantDashboardModule.tsx`.

- [x] Enviar «Abrir contabilidad» a Registro contable con el cliente seleccionado.
- [x] Verificar que la misma empresa y período aparecen al cambiar entre los seis módulos.
- [x] Ejecutar `pnpm lint`, `pnpm build` y revisar que no hay operaciones contables perdidas.
