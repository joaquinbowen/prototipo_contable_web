import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkspaceModal } from '../../components/common/WorkspaceModal';

const input = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5';
export function ExpenseForm({ onClose, onSaved }: { onClose: () => void; onSaved: (date: string) => void }) {
  const { addManualExpense } = useApp();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  return <WorkspaceModal title="Agregar gasto manual" onClose={onClose}><form className="space-y-4 p-5" onSubmit={(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      addManualExpense({ proveedor: String(data.get('provider')).trim(), concepto: String(data.get('concept')).trim(), categoria: String(data.get('category')).trim(), monto: Number(data.get('amount')), fecha: date, deducible: data.get('deductible') === 'on' }, pending ? String(data.get('due')) : undefined);
      onSaved(date);
    } catch (cause) { setError((cause as Error).message); }
  }}>
    <p className="text-sm text-slate-600">Registra un gasto sin cargar una factura al OCR. Se incluirá en los números de tu negocio.</p>
    <label className="block text-sm font-medium">Proveedor o beneficiario<input autoFocus required maxLength={120} name="provider" className={input} placeholder="Ej. Arrendador del local"/></label>
    <label className="block text-sm font-medium">¿En qué gastaste?<input required maxLength={200} name="concept" className={input} placeholder="Ej. Alquiler del local de octubre"/></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Importe total (USD)<input required type="number" min="0.01" max="999999999" step="0.01" name="amount" className={input} placeholder="0.00"/></label><label className="text-sm font-medium">Fecha del gasto<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className={input}/></label></div>
    <label className="block text-sm font-medium">Categoría<select name="category" className={input}>{['Alquiler', 'Servicios básicos', 'Compras', 'Transporte', 'Sueldos', 'Publicidad', 'Servicios profesionales', 'Otros'].map((item) => <option key={item}>{item}</option>)}</select></label>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="deductible"/> Marcar como deducible para revisión contable</label>
    <div className="rounded-xl bg-slate-50 p-4"><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={pending} onChange={(event) => setPending(event.target.checked)}/> Aún debo pagar este gasto</label><p className="mt-1 text-xs text-slate-500">Al activarlo también se creará una cuenta por pagar.</p>{pending && <label className="mt-3 block text-sm">Fecha de vencimiento<input required type="date" name="due" min={date} defaultValue={date} className={input}/></label>}</div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <div className="flex justify-end gap-2 border-t pt-4"><button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">Cancelar</button><button className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white">Guardar gasto</button></div>
  </form></WorkspaceModal>;
}
