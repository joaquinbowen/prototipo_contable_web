import React, { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, PackageSearch, Search, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import type { InventoryItem } from '../../types';

type Kind = 'PRODUCTO' | 'INSUMO';
type Row = Record<string, unknown>;
const columns: Record<Kind, string[]> = {
  PRODUCTO: ['codigo', 'nombre', 'categoria', 'unidad', 'stock', 'costo_promedio', 'precio_venta', 'stock_minimo'],
  INSUMO: ['codigo', 'nombre', 'categoria', 'unidad', 'stock', 'costo_promedio', 'uso', 'stock_minimo'],
};
const sample: Record<Kind, Row> = {
  PRODUCTO: { codigo: 'PROD-001', nombre: 'Producto de ejemplo', categoria: 'Venta', unidad: 'unidad', stock: 10, costo_promedio: 8.5, precio_venta: 12, stock_minimo: 2 },
  INSUMO: { codigo: 'INS-001', nombre: 'Insumo de ejemplo', categoria: 'Oficina', unidad: 'unidad', stock: 10, costo_promedio: 3.5, uso: 'Operación interna', stock_minimo: 2 },
};
const number = (value: unknown) => typeof value === 'number' ? value : Number(String(value ?? '').replace(',', '.'));
const string = (value: unknown) => String(value ?? '').trim();

export const InventoryModule: React.FC = () => {
  const { inventory, importInventory } = useApp();
  const [kind, setKind] = useState<Kind>('PRODUCTO');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const rows = useMemo(() => inventory.filter((item) => (item.tipo || 'INSUMO') === kind && `${item.codigo} ${item.nombre} ${item.categoria}`.toLowerCase().includes(query.toLowerCase())), [inventory, kind, query]);
  const downloadTemplate = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([sample[kind]], { header: columns[kind] });
    XLSX.utils.book_append_sheet(workbook, worksheet, kind === 'PRODUCTO' ? 'Productos' : 'Insumos');
    XLSX.writeFile(workbook, `plantilla-${kind.toLowerCase()}s.xlsx`);
  };
  const upload = async (file?: File) => {
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) throw new Error('El archivo no contiene una hoja.');
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });
      const header = (matrix[0] || []).map((value) => string(value).toLowerCase());
      const missing = columns[kind].filter((column) => !header.includes(column));
      if (missing.length) throw new Error(`Faltan columnas: ${missing.join(', ')}. Descarga la plantilla de ${kind === 'PRODUCTO' ? 'productos' : 'insumos'}.`);
      const raw = XLSX.utils.sheet_to_json<Row>(sheet, { defval: '' }).map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), value]))).filter((row) => Object.values(row).some((value) => string(value)));
      if (!raw.length) throw new Error('La hoja no tiene registros para importar.');
      const existing = new Set(inventory.map((item) => item.codigo.toLowerCase()));
      const seen = new Set<string>();
      const imported = raw.map((row, index): InventoryItem => {
        const line = index + 2;
        const codigo = string(row.codigo);
        const nombre = string(row.nombre);
        const unidad = string(row.unidad);
        const stock = number(row.stock);
        const costo = number(row.costo_promedio);
        const minimo = number(row.stock_minimo);
        const venta = kind === 'PRODUCTO' ? number(row.precio_venta) : undefined;
        if (!codigo || !nombre || !unidad) throw new Error(`Fila ${line}: código, nombre y unidad son obligatorios.`);
        if (existing.has(codigo.toLowerCase()) || seen.has(codigo.toLowerCase())) throw new Error(`Fila ${line}: el código ${codigo} ya existe o está repetido.`);
        if (![stock, costo, minimo, ...(venta === undefined ? [] : [venta])].every((value) => Number.isFinite(value) && value >= 0)) throw new Error(`Fila ${line}: revisa stock, costos y precios; deben ser números no negativos.`);
        seen.add(codigo.toLowerCase());
        return { id: `INV-XLS-${Date.now()}-${index}`, tipo: kind, codigo, nombre, categoria: string(row.categoria) || 'General', unidad, stock, costoPromedio: costo, precioVenta: venta, stockMinimo: minimo, uso: kind === 'INSUMO' ? string(row.uso) : undefined, fechaIngreso: new Date().toISOString().slice(0, 10) };
      });
      importInventory(imported);
      setStatus(`${imported.length} ${kind === 'PRODUCTO' ? 'productos' : 'insumos'} importados correctamente.`);
    } catch (error) { setStatus(error instanceof Error ? error.message : 'No se pudo leer el Excel.'); }
  };
  return <section className="space-y-4">
    <header className="rounded-2xl border border-blue-200 bg-white p-5"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-700"><PackageSearch size={17}/> Gestión de existencias</p><h1 className="mt-1 text-xl font-bold">Inventario</h1><p className="mt-1 text-sm text-slate-600">Productos para venta e insumos para uso interno, con plantillas de Excel diferentes.</p></header>
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tipo de inventario">{(['PRODUCTO', 'INSUMO'] as const).map((value) => <button key={value} role="tab" aria-selected={kind === value} onClick={() => { setKind(value); setStatus(''); }} className={`rounded-xl px-4 py-2 text-sm font-semibold ${kind === value ? 'bg-blue-700 text-white' : 'border bg-white text-slate-700'}`}>{value === 'PRODUCTO' ? 'Productos' : 'Insumos'} · {inventory.filter((item) => (item.tipo || 'INSUMO') === value).length}</button>)}</div>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]"><section className="min-w-0 rounded-2xl border bg-white p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">{kind === 'PRODUCTO' ? 'Productos para venta' : 'Insumos de operación'}</h2><p className="text-xs text-slate-600">El stock de compras conciliadas se suma al registro elegido.</p></div><label className="flex items-center gap-2 rounded-lg border px-3 py-2"><Search size={16}/><span className="sr-only">Buscar en inventario</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar código o nombre" className="min-w-0 text-sm outline-none"/></label></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b bg-slate-50 text-xs text-slate-600"><th className="p-3">Código / nombre</th><th className="p-3">Categoría</th><th className="p-3 text-right">Stock</th><th className="p-3 text-right">Costo promedio</th><th className="p-3">{kind === 'PRODUCTO' ? 'Precio venta' : 'Uso'}</th><th className="p-3">Último ingreso</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id} className="border-b"><td className="p-3"><strong className="block">{item.nombre}</strong><span className="text-xs text-slate-500">{item.codigo}</span></td><td className="p-3">{item.categoria}</td><td className="p-3 text-right">{item.stock} {item.unidad || 'unid.'}</td><td className="p-3 text-right">${item.costoPromedio.toFixed(2)}</td><td className="p-3">{kind === 'PRODUCTO' ? `$${(item.precioVenta || 0).toFixed(2)}` : item.uso || '—'}</td><td className="p-3 text-xs">{item.facturaOrigen || 'Carga inicial'}</td></tr>)}</tbody></table>{!rows.length && <p className="p-8 text-center text-sm text-slate-500">No hay {kind === 'PRODUCTO' ? 'productos' : 'insumos'} para esta búsqueda. Descarga la plantilla para cargar registros.</p>}</div></section><aside className="h-fit rounded-2xl border border-blue-200 bg-blue-50 p-5"><p className="flex items-center gap-2 text-sm font-bold text-blue-900"><FileSpreadsheet size={18}/> Importar desde Excel</p><p className="mt-2 text-xs text-slate-700">Primero descarga el formato de {kind === 'PRODUCTO' ? 'productos' : 'insumos'}. Completa cada fila y vuelve a subir el archivo .xlsx o .xls.</p><button onClick={downloadTemplate} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-800"><Download size={16}/> Descargar plantilla</button><label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white"><Upload size={16}/> Cargar Excel<input type="file" accept=".xlsx,.xls" className="sr-only" onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ''; }}/></label>{status && <p role="status" className="mt-3 rounded-lg bg-white p-3 text-xs font-medium text-slate-800">{status}</p>}<p className="mt-3 text-xs text-slate-600">La importación valida todos los registros antes de añadirlos. Los códigos deben ser únicos.</p></aside></div>
  </section>;
};
