import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useApp } from './AppContext';
import { seedAccountingBook } from '../domain/accounting/seed';
import type { AccountingBook } from '../domain/accounting/types';

const KEY = 'cont-marjo-accounting-v1';
type Books = Record<string, AccountingBook>;
interface AccountingState { books: Books; selectedEntityId: string; selectEntity: (id: string) => void; changeBook: (id: string, transform: (book: AccountingBook) => AccountingBook) => void; }
const Context = createContext<AccountingState | null>(null);

function readBooks(): Books {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}') as Books;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([id, book]) => book?.entityId === id && Array.isArray(book.accounts) && Array.isArray(book.entries) && Array.isArray(book.periods) && Array.isArray(book.movements) && Array.isArray(book.publications)).map(([id, book]) => [id, { ...book, taxReviews: Array.isArray(book.taxReviews) ? book.taxReviews : [] }]));
  } catch { return {}; }
}

export function AccountingProvider({ children }: { children: React.ReactNode }) {
  const { accountantClients, profile } = useApp();
  const [books, setBooks] = useState<Books>(() => readBooks());
  const ref = useRef(books);
  const entities = [...new Set([profile.ruc, ...accountantClients.map(client => client.ruc)].filter(Boolean))];
  const [selectedEntityId, selectEntity] = useState(entities[0] || 'demo');
  useEffect(() => {
    const next = { ...ref.current };
    let changed = false;
    entities.forEach((id, index) => { if (!next[id]) { next[id] = seedAccountingBook(id, index + 1); changed = true; } });
    if (changed) { ref.current = next; setBooks(next); }
  }, [entities.join('|')]);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(books)); }, [books]);
  const changeBook = (id: string, transform: (book: AccountingBook) => AccountingBook) => {
    const current = ref.current[id] || seedAccountingBook(id, entities.indexOf(id) + 1);
    const updated = transform(current);
    if (updated.entityId !== id) throw new Error('El libro pertenece a otra empresa.');
    const next = { ...ref.current, [id]: updated };
    ref.current = next;
    setBooks(next);
  };
  return <Context.Provider value={{ books, selectedEntityId, selectEntity, changeBook }}>{children}</Context.Provider>;
}

export function useAccounting() { const value = useContext(Context); if (!value) throw new Error('AccountingProvider requerido'); return value; }
