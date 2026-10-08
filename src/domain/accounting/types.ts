export type MoneyCents = number;
export type AccountKind = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
export type EntryStatus = 'DRAFT' | 'POSTED' | 'REVERSED';
export type SourceKind = 'MANUAL' | 'SALE' | 'PURCHASE' | 'BANK' | 'CLOSING';

export interface LedgerAccount {
  id: string;
  entityId: string;
  code: string;
  name: string;
  kind: AccountKind;
  parentId?: string;
  postable: boolean;
  active: boolean;
}

export interface JournalLine {
  id: string;
  accountId: string;
  debitCents: MoneyCents;
  creditCents: MoneyCents;
  memo?: string;
}

export interface JournalEntry {
  id: string;
  entityId: string;
  date: string;
  number: string;
  description: string;
  status: EntryStatus;
  lines: JournalLine[];
  sourceKind: SourceKind;
  sourceId?: string;
  reversedEntryId?: string;
  reversalReason?: string;
  createdAt: string;
  postedAt?: string;
}

export interface BankAccount {
  id: string;
  entityId: string;
  name: string;
  accountNumber: string;
  ledgerAccountId: string;
}

export interface BankMovement {
  id: string;
  entityId: string;
  bankAccountId: string;
  date: string;
  description: string;
  amountCents: MoneyCents;
  fingerprint: string;
  matchedEntryId?: string;
}

export interface AccountingPeriod {
  id: string;
  entityId: string;
  start: string;
  end: string;
  status: 'OPEN' | 'CLOSED';
  closedAt?: string;
  reopenedReason?: string;
}

export interface PublishedStatement {
  id: string;
  entityId: string;
  from: string;
  to: string;
  publishedAt: string;
  version: number;
  assetsCents: number;
  liabilitiesCents: number;
  equityCents: number;
  incomeCents: number;
  expenseCents: number;
  profitCents: number;
}

export interface AuditEvent {
  id: string;
  entityId: string;
  at: string;
  action: string;
  detail: string;
}

export interface TaxReview {
  id: string;
  entityId: string;
  periodId: string;
  kind: 'IVA' | 'RENTA';
  adjustmentCents: number;
  reason: string;
  evidence: string;
  status: 'PENDING' | 'READY';
  updatedAt: string;
}

export interface AccountingBook {
  entityId: string;
  accounts: LedgerAccount[];
  entries: JournalEntry[];
  bankAccounts: BankAccount[];
  movements: BankMovement[];
  periods: AccountingPeriod[];
  publications: PublishedStatement[];
  audit: AuditEvent[];
  taxReviews: TaxReview[];
}

export const cents = (value: number) => Math.round(value * 100);
export const dollars = (value: number) => (value / 100).toFixed(2);
export const moneyLabel = (value: number) => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(value / 100);
export const isoToday = () => new Date().toISOString().slice(0, 10);
export const newId = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
