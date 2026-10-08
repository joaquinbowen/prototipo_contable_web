import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseInvoiceParsed } from '../../types';
import {
  ScanLine,
  UploadCloud,
  FileCheck2,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
  CheckCircle2,
  Building2,
  Loader2,
  Plus
} from 'lucide-react';

export const PurchaseOcrModule: React.FC = () => {
  const {
    parsedPurchases,
    expenses,
    payables,
    inventory,
    processPurchase,
    simulatePurchaseOcr,
    activePurchaseSection,
    setActivePurchaseSection
  } = useApp();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showOcrUpload, setShowOcrUpload] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseInvoiceParsed | null>(
    parsedPurchases[0] || null
  );
  const activeSection = activePurchaseSection;
  const [inventorySearch, setInventorySearch] = useState('');
  const filteredInventory = inventory.filter((item) => `${item.nombre} ${item.codigo} ${item.facturaOrigen || ''}`.toLowerCase().includes(inventorySearch.toLowerCase()));

  // Reconciliation Checkbox Options
  const [actionExpense, setActionExpense] = useState(true);
  const [actionPayable, setActionPayable] = useState(true);
  const [actionInventory, setActionInventory] = useState(true);

  const handleSimulateDrop = async (fileName?: string) => {
    setIsProcessing(true);
    const purchase = await simulatePurchaseOcr(fileName);
    setSelectedPurchase(purchase);
    setActivePurchaseSection('review');
    setIsProcessing(false);
  };

  const handleExecuteReconciliation = () => {
    if (!selectedPurchase || !(actionExpense || actionPayable || actionInventory)) return;

    processPurchase(selectedPurchase.id, {
      expense: actionExpense,
      payable: actionPayable,
      inventory: actionInventory
    });

    setSelectedPurchase(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] text-blue-700 font-semibold mb-1.5 tracking-wide">
          <ScanLine className="w-4 h-4" />
          <span>COMPRAS Y CONCILIACIÓN · DEMO</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Compras de proveedores
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          La extracción OCR y la conciliación de esta demostración ocurren localmente; no se envían archivos a servicios externos.
        </p>
        <nav aria-label="Secciones de compras" className="mt-5 flex flex-wrap gap-2">
          {([{id:'review',label:'Por revisar'},{id:'expenses',label:'Gastos'},{id:'payables',label:'Cuentas por pagar'},{id:'inventory',label:'Inventario'}] as const).map((section) => <button key={section.id} type="button" aria-current={activeSection === section.id ? 'page' : undefined} onClick={() => setActivePurchaseSection(section.id)} className={`min-h-11 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${activeSection === section.id ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-transparent bg-slate-100/80 text-slate-700 hover:bg-slate-200'}`}>{section.label}</button>)}
        </nav>
      </div>

      {activeSection === 'inventory' && <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">Inventario conciliado</h2><p className="mb-4 mt-1 text-sm text-slate-600">Los productos aparecen aquí al conciliar una compra e incluir sus ítems.</p></div><input aria-label="Buscar producto en inventario" value={inventorySearch} onChange={(event)=>setInventorySearch(event.target.value)} placeholder="Buscar producto…" className="rounded-xl border px-3 py-2 text-sm"/></div>{filteredInventory.length ? <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b bg-slate-50 text-xs text-slate-500"><th className="p-3">Producto</th><th className="p-3">Código</th><th className="p-3 text-right">Stock</th><th className="p-3 text-right">Costo promedio</th><th className="p-3">Factura origen</th></tr></thead><tbody className="divide-y">{filteredInventory.map((item)=><tr key={item.id}><td className="p-3 font-medium">{item.nombre}<span className="block text-xs text-slate-500">{item.categoria}</span></td><td className="p-3 font-mono text-xs">{item.codigo}</td><td className="p-3 text-right">{item.stock}</td><td className="p-3 text-right">${item.costoPromedio.toFixed(2)}</td><td className="p-3">{item.facturaOrigen}</td></tr>)}</tbody></table></div> : <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">{inventory.length ? 'No hay coincidencias para esa búsqueda.' : 'Aún no hay productos; concilia una factura e incluye sus ítems para verlos aquí.'}</p>}</section>}
      {activeSection === 'expenses' && <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-bold">Gastos registrados</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead><tr className="border-b bg-slate-50 text-xs text-slate-500"><th className="p-3">Proveedor</th><th className="p-3">Concepto</th><th className="p-3">Fecha</th><th className="p-3 text-right">Monto</th></tr></thead><tbody className="divide-y">{expenses.map((expense)=><tr key={expense.id}><td className="p-3">{expense.proveedor}</td><td className="p-3">{expense.concepto}</td><td className="p-3">{expense.fecha}</td><td className="p-3 text-right">${expense.monto.toFixed(2)}</td></tr>)}</tbody></table></div></section>}
      {activeSection === 'payables' && <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-bold">Cuentas por pagar</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[500px] text-left text-sm"><thead><tr className="border-b bg-slate-50 text-xs text-slate-500"><th className="p-3">Proveedor</th><th className="p-3">Vencimiento</th><th className="p-3 text-right">Monto</th><th className="p-3">Estado</th></tr></thead><tbody className="divide-y">{payables.map((payable)=><tr key={payable.id}><td className="p-3">{payable.proveedor}</td><td className="p-3">{payable.fechaVence}</td><td className="p-3 text-right">${payable.monto.toFixed(2)}</td><td className="p-3">{payable.estado}</td></tr>)}</tbody></table></div></section>}

      {activeSection === 'review' && <>
      <div className="grid grid-cols-1 gap-3">
        {/* Left Column: Dropzone & OCR Extractor */}
        <div className="order-1 grid gap-3 xl:grid-cols-[minmax(240px,0.7fr)_minmax(0,1.3fr)]">
          <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><strong className="text-sm text-blue-950">Registrar factura de compra</strong><p className="text-xs text-slate-600">Carga un comprobante y revisa la conciliación sugerida.</p></div><button onClick={() => setShowOcrUpload(!showOcrUpload)} aria-expanded={showOcrUpload} className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white">{showOcrUpload ? 'Cerrar carga' : 'Cargar con OCR'}</button></div>
            {showOcrUpload && <div className="mt-3 rounded-xl border-2 border-dashed border-blue-200 bg-white p-4 text-center">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                {isProcessing ? (
                  <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-800">Cargar Factura de Compra</h3>
              <p className="mx-auto mb-2 mt-1 max-w-xs text-xs text-slate-500">
                Elige un PDF o XML para simular la lectura OCR.
              </p>
              <input type="file" accept=".pdf,.xml" aria-label="Seleccionar factura de compra PDF o XML" className="mb-2 block max-w-full text-xs" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleSimulateDrop(file.name); }} />
              <button
                onClick={() => void handleSimulateDrop('Factura_compra_ejemplo.xml')}
                disabled={isProcessing}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Leyendo factura…' : 'Cargar factura de ejemplo'}
              </button>
            </div>}

            <span className="text-[11px] text-slate-400 block">
              La demo utiliza datos de ejemplo; revisa siempre el comprobante original del proveedor.
            </span>
          </div>

          {/* Pending Purchases to Reconcile */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Comprobantes Pendientes de Conciliar ({parsedPurchases.length})
            </h3>
            {parsedPurchases.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Todas las facturas de proveedores han sido procesadas.</span>
              </div>
            ) : (
              parsedPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  onClick={() => setSelectedPurchase(purchase)}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedPurchase?.id === purchase.id
                      ? 'bg-blue-50/60 border-blue-400 ring-1 ring-blue-400'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                        {purchase.proveedor}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        RUC: {purchase.rucProveedor} · Fac: {purchase.numero}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                      ${purchase.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>{purchase.items.length} ítems detectados</span>
                    <span className="text-blue-600 font-medium">Seleccionar para revisar</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: 3-Way Reconciliation Action Modal / Card */}
        <div className="order-2 space-y-3">
          {selectedPurchase ? (
            <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-3 shadow-sm">
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    Datos extraídos · revisa antes de conciliar
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedPurchase.proveedor}</h2>
                  <p className="text-xs text-slate-500 font-mono">
                    RUC: {selectedPurchase.rucProveedor} · Factura No. {selectedPurchase.numero} ({selectedPurchase.fecha})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Monto Total</span>
                  <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    ${selectedPurchase.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items Parsed Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Ítems Extraídos de la Factura</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                        <th className="p-2.5">Descripción</th>
                        <th className="p-2.5 w-16 text-right">Cant.</th>
                        <th className="p-2.5 w-20 text-right">Precio</th>
                        <th className="p-2.5 w-20 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPurchase.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 text-slate-800">{it.descripcion}</td>
                          <td className="p-2.5 text-right font-mono tabular-nums">{it.cantidad}</td>
                          <td className="p-2.5 text-right font-mono tabular-nums">${it.precio.toFixed(2)}</td>
                          <td className="p-2.5 text-right font-mono tabular-nums font-semibold">
                            ${(it.cantidad * it.precio).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3 Action Toggles */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Acciones de Contabilización (Sincronización Inmediata)
                </h4>

                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-blue-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={actionExpense}
                      onChange={(e) => setActionExpense(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded-sm"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">[Registrar como Gasto Deducible]</span>
                      <span className="text-[11px] text-slate-500">
                        Se añade a la base de gastos deducibles para el formulario 104A del SRI.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-blue-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={actionPayable}
                      onChange={(e) => setActionPayable(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded-sm"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">[Cargar a Cuentas por Pagar]</span>
                      <span className="text-[11px] text-slate-500">
                        Crea un pasivo pendiente de liquidación con vencimiento al fin de mes.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-blue-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={actionInventory}
                      onChange={(e) => setActionInventory(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded-sm"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">[Ingresar Ítems al Inventario]</span>
                      <span className="text-[11px] text-slate-500">
                        Incrementa el stock de existencias con el costo unitario de compra.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleExecuteReconciliation}
                    disabled={!(actionExpense || actionPayable || actionInventory)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar y Procesar Compra en el Sistema</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center py-12 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Sin Facturas Pendientes</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Utilice el botón "Simular Carga de Compra" a la izquierda para cargar un nuevo comprobante de proveedor.
              </p>
            </div>
          )}

          {/* Real-time State Monitors (Expenses, Payables & Inventory) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Expenses */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-blue-600">
                  <DollarSign className="w-4 h-4" /> Gastos
                </span>
                <span className="font-mono tabular-nums">{expenses.length} reg.</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Total acumulado: <strong className="font-mono text-slate-800">${expenses.reduce((a, b) => a + b.monto, 0).toFixed(2)}</strong>
              </p>
            </div>

            {/* Payables */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-amber-600">
                  <FileCheck2 className="w-4 h-4" /> Por Pagar
                </span>
                <span className="font-mono tabular-nums">{payables.length} prov.</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Pendiente: <strong className="font-mono text-slate-800">${payables.reduce((a, b) => a + b.monto, 0).toFixed(2)}</strong>
              </p>
            </div>

            {/* Inventory */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <Package className="w-4 h-4" /> Inventario
                </span>
                <span className="font-mono tabular-nums">{inventory.length} SKUs</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Unidades en stock: <strong className="font-mono text-slate-800">{inventory.reduce((a, b) => a + b.stock, 0)}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
      </>}
    </div>
  );
};
