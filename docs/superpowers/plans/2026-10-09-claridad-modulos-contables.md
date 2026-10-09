# Claridad de módulos contables Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer comprensibles los seis módulos contables sin recortar sus operaciones profesionales.

**Architecture:** Mantener libro y contexto; introducir patrones visuales reutilizables y reorganizar un componente por módulo. Las acciones permanecen junto a los registros que modifican.

**Tech Stack:** React, TypeScript, Tailwind, Vite.

## Global Constraints

- Conservar partida doble, conciliación, cierres, versiones publicadas y preparación fiscal de demo.
- Mantener selección de empresa y período entre módulos.
- No afirmar validez oficial de ATS ni declaraciones.

## Task 1: Lenguaje y cabecera compartida

**Files:** `src/components/modules/accounting/AccountingShell.tsx`, `AccountingUi.tsx`.

- [x] Afinar cabecera, estado del período y componentes de explicación/estado.
- [x] Conservar selectores accesibles y mensajes específicos.

## Task 2: Registro y libros

**Files:** `RegisterModule.tsx`, `BooksModule.tsx`.

- [x] Separar visualmente documentos, edición y lista de asientos; etiquetar Debe/Haber y estado.
- [x] Dar al plan de cuentas una jerarquía y formulario explicados.
- [x] Mostrar diario, mayor y comprobación en vistas claras con exportación junto a cada una.

## Task 3: Estados y bancos

**Files:** `StatementsModule.tsx`, `BanksModule.tsx`.

- [x] Distinguir análisis, detalle y publicación.
- [x] Mostrar importación, pendientes y coincidencias bancarias con acciones situadas junto al movimiento.

## Task 4: Cierres y tributación

**Files:** `ClosingModule.tsx`, `TaxModule.tsx`.

- [x] Checklist de cierre con acceso a las tareas pendientes y motivo visible para reapertura.
- [x] Separar ATS, IVA y renta, aclarar diferencias y ajustes documentados.

## Task 5: Verificación

- [x] Ejecutar `pnpm lint`, `pnpm build` y revisar los seis módulos y operaciones existentes.
