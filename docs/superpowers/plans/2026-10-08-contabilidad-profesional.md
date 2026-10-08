# Contabilidad profesional Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir al espacio del contador una contabilidad de demostración por contribuyente, desde plan de cuentas y asientos hasta bancos, cierres, estados financieros y preparación tributaria.

**Architecture:** Cada contribuyente tendrá un libro independiente identificado por `entityId`. Los asientos confirmados serán la fuente única de libros y estados; las facturas, compras y movimientos bancarios propondrán borradores que el contador podrá revisar. El estado se conservará localmente con una versión nueva de almacenamiento y datos semilla para varios clientes.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind, Vitest, persistencia local existente. Importación y exportación CSV en navegador; ATS de demostración sujeto a la ficha, catálogo y esquema oficiales del SRI vigentes al momento de implementarlo.

## Global Constraints

- Todo es una **demo local**: no se envían declaraciones ni anexos al SRI y no se afirma validez tributaria de archivos sin contrastarlos con la versión oficial vigente.
- El perfil del contador conserva sus propios datos. Los libros pertenecen al contribuyente elegido desde la cartera; seleccionar una empresa no cambia la identidad del contador ni la del contribuyente.
- Mantener el botón **Nuevo** de emisión en el miniheader del contribuyente; no añadir un acceso «Emitir documentos» al sidebar.
- Importe monetario en centavos enteros, fechas ISO, identificadores estables y separación estricta por `entityId`.
- Un asiento confirmado debe cuadrar (`Σ debe = Σ haber`), tener al menos dos líneas, utilizar cuentas imputables activas y no poder editarse directamente; la corrección se hace mediante reverso trazable.
- Diario, mayor, balance de comprobación y estados financieros se calculan desde asientos confirmados. Ningún reporte mantiene cifras editables independientes.
- Los meses cerrados bloquean nuevas confirmaciones; las excepciones requieren reapertura con motivo y evento de auditoría.
- La contribuyente puede consultar estados compartidos y sus documentos de origen. Las operaciones contables son del contador.

## Mapa del producto

| Rol y ubicación | Contenido |
| --- | --- |
| Contador → Cartera de clientes | Elegir empresa; acceso «Abrir contabilidad» en cada expediente. |
| Contador → Contabilidad | Cabecera fija con empresa, RUC y período; navegación interna: Plan de cuentas, Asientos, Libros, Estados financieros, Bancos, Cierres, Tributación. |
| Contribuyente → Reportes contables | Consulta de balance general y pérdidas y ganancias compartidos por el contador, con período y fecha de publicación. |
| Superadmin | Solo indicadores agregados si se solicita después; sin acceso directo a libros de clientes. |

La navegación interna agrupa siete vistas; el sidebar del contador recibe una sola entrada «Contabilidad», situada después de «Mis clientes». Se evita crear nueve botones permanentes en el sidebar.

## Modelo de datos e interfaces

Crear `src/domain/accounting/types.ts` como contrato común:

```ts
type MoneyCents = number;
type AccountKind = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
type EntryStatus = 'DRAFT' | 'POSTED' | 'REVERSED';
type SourceKind = 'MANUAL' | 'SALE' | 'PURCHASE' | 'BANK' | 'CLOSING';

interface LedgerAccount {
  id: string; entityId: string; code: string; name: string;
  kind: AccountKind; parentId?: string; postable: boolean; active: boolean;
}
interface JournalLine {
  id: string; accountId: string; debitCents: MoneyCents;
  creditCents: MoneyCents; memo?: string;
}
interface JournalEntry {
  id: string; entityId: string; date: string; number: string;
  description: string; status: EntryStatus; lines: JournalLine[];
  sourceKind: SourceKind; sourceId?: string; reversedEntryId?: string;
  createdAt: string; postedAt?: string;
}
interface BankMovement {
  id: string; entityId: string; bankAccountId: string; date: string;
  description: string; amountCents: MoneyCents; fingerprint: string;
  matchedEntryId?: string;
}
interface AccountingPeriod {
  id: string; entityId: string; start: string; end: string;
  status: 'OPEN' | 'CLOSED'; closedAt?: string; reopenedReason?: string;
}
```

El contexto `AccountingContext` expone `selectedEntityId`, `selectEntity(id)`, cuentas, asientos, bancos y períodos. Las operaciones mutantes reciben `entityId` explícito; no dependen de `impersonatedClientId`. `src/context/AppContext.tsx` sigue siendo fuente de facturas, compras y cartera; los adaptadores contables solo leen esos datos y enlazan el `sourceId` para evitar asientos duplicados.

## Entrega 1 — Libro por empresa y registro contable

### Task 1: Espacio contable por contribuyente y persistencia

**Files:** crear `src/context/AccountingContext.tsx`, `src/domain/accounting/types.ts`, `src/domain/accounting/seed.ts`; modificar `src/App.tsx`, `src/components/layout/WebSidebar.tsx`, `src/components/layout/ContextBar.tsx`, `src/components/modules/AccountantDashboardModule.tsx`.

**Interfaces:** `selectEntity(entityId: string)`, `getAccountingBook(entityId: string)`; datos semilla con dos empresas, períodos, cuentas y asientos que produzcan reportes no vacíos.

- [ ] Añadir la entrada «Contabilidad» al contador y el acceso desde su cartera. Mostrar selector de empresa y período dentro del módulo, sin reutilizar la identidad del perfil.
- [ ] Persistir el libro en una clave versionada propia (`cont-marjo-accounting-v1`) para no sobrescribir el estado `cont-marjo-demo-v2`; al cargar, validar la forma y recuperar una semilla si no hay datos.
- [ ] Comprobar que cambiar de cliente cambia todas las vistas contables, pero no el perfil profesional ni el encabezado global.

### Task 2: Plan de cuentas

**Files:** crear `src/domain/accounting/chart.ts`, `src/components/modules/accounting/ChartModule.tsx`.

**Interfaces:** `createAccount(book, account)`, `updateAccount(book, accountId, changes)`, `getPostingAccounts(book)`.

- [ ] Crear un catálogo inicial jerárquico de activo, pasivo, patrimonio, ingresos y gastos por empresa, con código único y cuentas de agrupación no imputables.
- [ ] Permitir buscar, añadir, editar nombre y desactivar cuentas; bloquear borrado/desactivación si una cuenta figura en un asiento confirmado.
- [ ] Verificar códigos duplicados, jerarquía válida y separación por `entityId`.

### Task 3: Asientos y partida doble

**Files:** crear `src/domain/accounting/journal.ts`, `src/components/modules/accounting/JournalModule.tsx`.

**Interfaces:** `validateEntry(entry, accounts, periods): string[]`, `postEntry(book, entryId)`, `reverseEntry(book, entryId, reason)`.

- [ ] Implementar editor de borradores con fecha, descripción y filas de cuenta/debe/haber; totalizar en tiempo real y mostrar diferencia.
- [ ] Confirmar únicamente asientos equilibrados con cuentas imputables activas y período abierto. Numerar por empresa y mostrar el vínculo al documento de origen.
- [ ] Ofrecer reverso que cree un asiento contrario y conserve el original, motivo y fecha. Nunca modificar líneas de un asiento confirmado.

## Entrega 2 — Integración y libros

### Task 4: Borradores desde ventas y compras

**Files:** crear `src/domain/accounting/sourceDrafts.ts`, `src/components/modules/accounting/SourceInbox.tsx`; modificar solo los puntos de enlace de `src/context/AppContext.tsx` necesarios para obtener facturas emitidas y compras conciliadas.

**Interfaces:** `draftFromSale(invoice, mappings)`, `draftFromPurchase(purchase, mappings)`, `hasSourceEntry(book, sourceKind, sourceId)`.

- [ ] Mostrar una bandeja de documentos de la empresa: facturas emitidas y compras conciliadas sin asiento. Proponer cuentas por cobrar/ingreso/IVA y gasto o inventario/cuentas por pagar/IVA según mapeos visibles y editables.
- [ ] Crear borradores, no asientos confirmados automáticamente; impedir duplicar el mismo `sourceKind + sourceId` dentro de una empresa.
- [ ] Señalar documentos cuyo RUC, totales o clasificación no permiten una propuesta completa, para revisión del contador.

### Task 5: Diario, mayor y balance de comprobación

**Files:** crear `src/domain/accounting/books.ts`, `src/components/modules/accounting/BooksModule.tsx`.

**Interfaces:** `getJournal(entries, entityId, range)`, `getLedger(entries, accountId, range)`, `getTrialBalance(entries, accounts, range)`.

- [ ] Derivar diario ordenado, mayor por cuenta con saldo acumulado y balance de comprobación con saldos iniciales, movimientos y saldos finales.
- [ ] Filtrar por empresa, fechas, cuenta y origen; enlazar cada línea al asiento y al documento de origen.
- [ ] Exportar CSV por libro y comprobar que debe y haber del balance de comprobación coinciden.

### Task 6: Estados financieros

**Files:** crear `src/domain/accounting/statements.ts`, `src/components/modules/accounting/FinancialReportsModule.tsx`.

**Interfaces:** `getProfitAndLoss(book, range)`, `getBalanceSheet(book, asOfDate)`.

- [ ] Calcular ingresos menos gastos para pérdidas y ganancias; calcular activos, pasivos y patrimonio, incorporando resultado acumulado, para balance general.
- [ ] Permitir desglosar cada rubro hasta cuentas y asientos. Mostrar período, empresa, fecha de corte y la diferencia de balance, si existe.
- [ ] Publicar una versión de lectura para el contribuyente solo cuando el contador la marque como compartida; conservar fecha y versión de publicación.

## Entrega 3 — Bancos y cierre

### Task 7: Bancos y conciliación

**Files:** crear `src/domain/accounting/bank.ts`, `src/components/modules/accounting/BanksModule.tsx`.

**Interfaces:** `importBankCsv(book, bankAccountId, csvText)`, `suggestMatches(movements, entries)`, `reconcileMovement(book, movementId, entryId)`.

- [ ] Registrar cuentas bancarias por empresa e importar CSV con mapeo explícito de fecha, descripción e importe. Guardar una huella para rechazar movimientos duplicados.
- [ ] Mostrar saldo del extracto, saldo contable y partidas pendientes; sugerir coincidencias por importe, fecha y referencia, pero pedir confirmación manual.
- [ ] Permitir crear un borrador de asiento para comisiones o movimientos sin contraparte y deshacer una conciliación con rastro de auditoría.

### Task 8: Cierres contables

**Files:** crear `src/domain/accounting/closing.ts`, `src/components/modules/accounting/ClosingModule.tsx`.

**Interfaces:** `getCloseChecklist(book, period)`, `closePeriod(book, periodId)`, `reopenPeriod(book, periodId, reason)`.

- [ ] Exigir balance de comprobación cuadrado, borradores pendientes revisados y diferencias bancarias visibles antes del cierre mensual.
- [ ] Bloquear confirmaciones con fecha en períodos cerrados. Permitir reapertura solo al contador con motivo registrado.
- [ ] Para cierre anual, generar asiento de cierre de cuentas de resultado y traslado a patrimonio; comprobar que el balance general posterior conserva la igualdad.

## Entrega 4 — Preparación tributaria

### Task 9: Datos fiscales y ATS de demostración

**Files:** crear `src/domain/accounting/tax.ts`, `src/components/modules/accounting/TaxPrepModule.tsx`; ampliar metadatos de origen en `src/types/index.ts` solo donde haga falta para comprobantes, retenciones y compras.

**Interfaces:** `buildAtsPreview(entityId, period, sourceDocuments)`, `validateAtsFields(preview): string[]`, `exportAtsDemoXml(preview)`.

- [ ] Preparar una vista de compras, ventas, retenciones y ajustes del período con trazabilidad al documento; mostrar campos faltantes y diferencias antes de permitir exportar.
- [ ] Versionar el catálogo y esquema ATS utilizados; revisar la ficha, catálogo y XSD del SRI vigentes durante esta entrega. Validar el XML generado contra el XSD elegido y registrar la versión en la descarga.
- [ ] En la demo, etiquetar el XML como simulación y dejar el estado «Preparado para revisión»; no simular una aceptación oficial del SRI.

### Task 10: Borradores de declaraciones

**Files:** ampliar `src/domain/accounting/tax.ts` y `src/components/modules/accounting/TaxPrepModule.tsx`.

**Interfaces:** `buildTaxDraft(entityId, period, kind, sources)`, `compareTaxDraftWithLedger(draft, book)`.

- [ ] Crear borradores de IVA y renta a partir de comprobantes y cuentas mapeadas; separar base, impuesto y retenciones y mostrar el documento que sustenta cada cifra.
- [ ] Resolver inconsistencias entre documentos, ATS y libro antes de marcar «Listo para revisión». Guardar ajustes manuales con motivo, usuario y evidencia.
- [ ] Exportar un resumen revisable; cualquier generación de formato oficial queda condicionada a la versión vigente de formularios e instructivos del SRI.

## Entrega 5 — Experiencia y salida

### Task 11: Vista del contribuyente, coherencia y entrega

**Files:** crear `src/components/modules/ContributorReportsModule.tsx`; modificar `src/App.tsx`, `src/components/layout/WebSidebar.tsx`, `src/components/layout/ContextBar.tsx`.

- [ ] Dar al contribuyente una entrada «Reportes contables» de solo lectura con estados publicados, período, fecha y posibilidad de descarga. Mantener ocultos borradores, libro interno y movimientos de otros clientes.
- [ ] Recorrer los flujos de dos empresas: factura → borrador → asiento → libro → estado; compra OCR → borrador; banco → conciliación; cierre → bloqueo; documento → ATS/declaración.
- [ ] Verificar en cada entrega `pnpm lint` y `pnpm build`; ejecutar casos de dominio para partida doble, centavos, separación por empresa, cierres, conciliación y totales de reportes antes de considerar terminada la demo.

## Orden, alcance y revisión

1. **Primera demo útil:** entregas 1 y 2. Ya permite registrar y consultar contabilidad confiable sin bancos ni anexos.
2. **Operación mensual:** entrega 3. Añade conciliación y cierre sobre ese mismo libro.
3. **Preparación fiscal:** entrega 4. Usa documentos y asientos existentes, sin volver a capturar importes.
4. **Compartir resultados:** entrega 5. El contribuyente consulta únicamente reportes publicados.

No se construyen todavía contabilidad de costos, nómina, depreciaciones, multiempresa con consolidación, conexión bancaria real ni presentación automática al SRI. Son ampliaciones distintas que requieren reglas y fuentes de datos adicionales.

## Referencias para la entrega tributaria

- SRI, [Anexos y guías: ATS, ficha, catálogo y esquema](https://www.sri.gob.ec/web/intersri/formularios-e-instructivos1).
- SRI, [Ficha técnica del ATS](https://www.sri.gob.ec/o/sri-portlet-biblioteca-alfresco-internet/descargar/72d717c2-88ed-47b7-baba-50b87b7198b7/Ficha%20Tecnica%20Transaccional%20Simplificado%20ATS.pdf).
- SRI, [Entrega y recepción de información fiscal](https://www.sri.gob.ec/web/intersri/entrega-y-recepcion-de-informacion-fiscal).

Estas fuentes se revisarán otra vez al implementar la entrega 4; este plan no fija campos ni tarifas tributarias que puedan cambiar.
