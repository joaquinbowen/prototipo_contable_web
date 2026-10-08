import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { createAdminDemoData } from '../../domain/adminDemoData';

export type AdminPeriod = 'today' | '7d' | 'month' | 'quarter' | 'custom';
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const todayKey = () => dateKey(new Date());
const shiftDate = (days: number) => { const date = new Date(); date.setDate(date.getDate() + days); return dateKey(date); };

type AdminAnalyticsState = {
  data: ReturnType<typeof createAdminDemoData>;
  period: AdminPeriod;
  setPeriod: (period: AdminPeriod) => void;
  customFrom: string;
  setCustomFrom: (date: string) => void;
  customTo: string;
  setCustomTo: (date: string) => void;
  from: string;
  to: string;
  inPeriod: (date: string) => boolean;
};

const Context = createContext<AdminAnalyticsState | null>(null);

export function AdminAnalyticsProvider({ children }: { children: ReactNode }) {
  const data = useMemo(() => createAdminDemoData(), []);
  const [period, setPeriod] = useState<AdminPeriod>('month');
  const [customFrom, setCustomFrom] = useState(shiftDate(-30));
  const [customTo, setCustomTo] = useState(todayKey());
  const today = todayKey();
  const monthStart = `${today.slice(0, 7)}-01`;
  const quarterStart = (() => { const date = new Date(); date.setMonth(date.getMonth() - 2, 1); return dateKey(date); })();
  const from = period === 'today' ? today : period === '7d' ? shiftDate(-6) : period === 'month' ? monthStart : period === 'quarter' ? quarterStart : customFrom;
  const to = period === 'custom' ? customTo : today;
  const inPeriod = (date: string) => Boolean(date) && date.slice(0, 10) >= from && date.slice(0, 10) <= to;
  return <Context.Provider value={{ data, period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo, from, to, inPeriod }}>{children}</Context.Provider>;
}

export function useAdminAnalytics() {
  const state = useContext(Context);
  if (!state) throw new Error('AdminAnalyticsProvider missing');
  return state;
}

export function exportAdminCsv(name: string, rows: Record<string, string | number | boolean | null | undefined>[]) {
  const headers = rows.length ? Object.keys(rows[0]) : ['resultado'];
  const safe = (value: unknown) => {
    const raw = String(value ?? '');
    const protectedValue = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
    return `"${protectedValue.replaceAll('"', '""')}"`;
  };
  const csv = '\uFEFF' + [headers.map(safe).join(','), ...rows.map((row) => headers.map((key) => safe(row[key])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${name}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
