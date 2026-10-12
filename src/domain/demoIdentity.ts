export type DemoAccount = {
  role: 'CONTRIBUYENTE' | 'CONTADOR_PROFESIONAL';
  email: string;
  ruc?: string;
};

export function resolveDemoIdentity(identifier: string, accounts: DemoAccount[]): DemoAccount['role'] | null {
  const normalized = identifier.trim().toLowerCase();
  if (!normalized) return null;
  const matches = accounts.filter((account) =>
    account.email.trim().toLowerCase() === normalized || account.ruc?.trim() === normalized,
  );
  return matches.length === 1 ? matches[0].role : null;
}
