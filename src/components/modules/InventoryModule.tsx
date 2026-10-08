import React, { useMemo, useState } from 'react';
import { PackageSearch, Search, Boxes } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InventoryModule: React.FC = () => {
  const { inventory } = useApp();
  const [query, setQuery] = useState('');
  const rows = useMemo(
    () => inventory.filter((item) => `${item.codigo} ${item.nombre} ${item.facturaOrigen || ''}`.toLowerCase().includes(query.toLowerCase())),
    [inventory, query]
  );
  const units = inventory.reduce((sum, item) => sum + item.stock, 0);

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="flex items-center gap-2 text-xs font-semibold text-blue-700"><PackageSearch size={16} /> COMPRAS · INVENTARIO</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Productos ingresados</h1>
        <p className="mt-1 text-sm text-slate-600">Los productos aparecen aquí cuando marcas “Ingresar ítems al inventario” y confirmas la conciliación OCR.</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg bg-blue-50 px-3 py-2 text-blue-900"><strong>{inventory.length}</strong> productos</span>
          <span className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-900"><strong>{units}</strong> unidades en stock</span>
        </div>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <label className="mb-4 flex max-w-md items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
          <Search size={16} className="text-slate-400" />
          <span className="sr-only">Buscar productos</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 text-sm outline-none" placeholder="Buscar producto, código o factura…" />
        </label>

        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead><tr className="border-b bg-slate-50 text-xs uppercase text-slate-500"><th className="p-3">Producto</th><th className="p-3">Código</th><th className="p-3 text-right">Stock</th><th className="p-3 text-right">Costo promedio</th><th className="p-3">Factura de origen</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{rows.map((item) => <tr key={item.id}><td className="p-3 font-medium text-slate-900">{item.nombre}<span className="block text-xs font-normal text-slate-500">{item.categoria}</span></td><td className="p-3 font-mono text-xs">{item.codigo}</td><td className="p-3 text-right tabular-nums">{item.stock}</td><td className="p-3 text-right tabular-nums">${item.costoPromedio.toFixed(2)}</td><td className="p-3 text-xs text-slate-600">{item.facturaOrigen || 'Saldo inicial de demostración'}</td></tr>)}</tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
            <Boxes className="mx-auto mb-3 text-slate-400" />
            <h2 className="font-semibold text-slate-800">Aún no hay productos conciliados</h2>
            <p className="mt-1 text-sm text-slate-500">Ve a Compras → Por revisar, procesa una factura y activa “Ingresar ítems al inventario”.</p>
          </div>
        )}
      </div>
    </section>
  );
};
