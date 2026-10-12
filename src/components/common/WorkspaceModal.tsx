import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function WorkspaceModal({ title, onClose, children, wide = false, busy = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return createPortal(<dialog ref={ref} aria-label={title} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} className={`m-auto max-h-[94dvh] w-[95vw] overflow-hidden rounded-2xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 ${wide ? 'max-w-6xl' : 'max-w-xl'}`}>
    <div className="flex items-center justify-between gap-4 border-b px-5 py-4"><h2 className="text-lg font-bold">{title}</h2><button type="button" disabled={busy} onClick={onClose} aria-label="Cerrar ventana" className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40">Cerrar ×</button></div>
    <div className="max-h-[calc(94dvh-74px)] overflow-auto">{children}</div>
  </dialog>, document.body);
}
