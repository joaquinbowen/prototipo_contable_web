import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ElectronicInvoice, InvoiceItem, DocumentType } from '../../types';
import { getEmissionBlocker } from '../../domain/documentStatus';
import {
  Receipt,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  Loader2,
  FileCode,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  QrCode
} from 'lucide-react';

export const InvoicingModule: React.FC = () => {
  const {
    profile,
    selectedDocumentType: docType,
    emitInvoiceWithStepper,
    isEmitting,
    emissionStep
    ,setActiveTab
  } = useApp();

  const [clientRuc, setClientRuc] = useState('1792345678001');
  const [clientName, setClientName] = useState('COMERCIALIZADORA ECUATECH S.A.');
  const [clientEmail, setClientEmail] = useState('compras@ecuatech.com.ec');
  const [clientAddress, setClientAddress] = useState('Av. Shyris N34-102 y Naciones Unidas, Quito');
  const [invoiceDate, setInvoiceDate] = useState('2026-10-08');
  const [formaPago, setFormaPago] = useState('20 - OTROS CON UTILIZACION DEL SISTEMA FINANCIERO');
  const [referenceNumber, setReferenceNumber] = useState('001-001-000000103');
  const [documentReason, setDocumentReason] = useState('');
  const [withholdingPercent, setWithholdingPercent] = useState('1.75');
  const [originAddress, setOriginAddress] = useState('Quito, Pichincha');
  const [destinationAddress, setDestinationAddress] = useState('Guayaquil, Guayas');
  const [carrierName, setCarrierName] = useState('Transportista de ejemplo');
  const [vehiclePlate, setVehiclePlate] = useState('ABC-0123');
  const docLabels: Record<DocumentType, string> = { FACTURA:'Factura', NOTA_CREDITO:'Nota de crédito', NOTA_DEBITO:'Nota de débito', RETENCION:'Comprobante de retención', GUIA_REMISION:'Guía de remisión', LIQUIDACION_COMPRA:'Liquidación de compra' };

  // Product Items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'it-1',
      code: 'SRV-001',
      description: 'Servicio de Consultoría y Auditoría Fiscal 2026',
      quantity: 1,
      unitPrice: 500.00,
      discount: 0,
      taxPercent: 15,
      taxAmount: 75.00,
      total: 575.00
    }
  ]);

  // Calculations
  const subtotal15 = items.reduce((acc, it) => acc + (it.taxPercent === 15 ? it.quantity * it.unitPrice - it.discount : 0), 0);
  const subtotal0 = items.reduce((acc, it) => acc + (it.taxPercent === 0 ? it.quantity * it.unitPrice - it.discount : 0), 0);
  const iva15 = subtotal15 * 0.15;
  const total = subtotal15 + subtotal0 + iva15;
  const emissionBlocker = getEmissionBlocker(profile.signatureConfigured, profile.sriAccountConfigured);

  const handleAddItem = () => {
    const nextIdx = items.length + 1;
    const newItem: InvoiceItem = {
      id: `it-${Date.now()}`,
      code: `PROD-00${nextIdx}`,
      description: 'Soporte y Mantenimiento Técnico de Software',
      quantity: 1,
      unitPrice: 150.00,
      discount: 0,
      taxPercent: 15,
      taxAmount: 22.50,
      total: 172.50
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((it) => it.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        // Recalculate
        const sub = updated.quantity * updated.unitPrice - updated.discount;
        updated.taxAmount = updated.taxPercent === 15 ? sub * 0.15 : 0;
        updated.total = sub + updated.taxAmount;
        return updated;
      })
    );
  };

  const handleEmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmitting) return;

    await emitInvoiceWithStepper({
      secuencial: '000000000',
      establecimiento: '001',
      puntoEmision: '001',
      clientRucName: clientName,
      clientRuc,
      clientEmail,
      clientAddress,
      date: invoiceDate,
      type: docType,
      subtotal15,
      subtotal0,
      iva15,
      total,
      items,
      formaPago,
      observaciones: docType === 'NOTA_CREDITO' || docType === 'NOTA_DEBITO' || docType === 'RETENCION' ? `Documento relacionado: ${referenceNumber}. Motivo: ${documentReason || 'No especificado'}. ${docType === 'RETENCION' ? `Porcentaje ilustrativo de retención: ${withholdingPercent}%.` : ''}` : docType === 'GUIA_REMISION' ? `Origen: ${originAddress}. Destino: ${destinationAddress}. Transportista: ${carrierName}. Vehículo: ${vehiclePlate}.` : undefined
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-1">
          <Receipt className="w-4 h-4" />
          <span>NUEVO · DOCUMENTO DE DEMOSTRACIÓN</span>
        </div>
        <h1 className="text-2xl md:text-[28px] font-bold text-slate-900 tracking-tight">
          Crear {docLabels[docType]}
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          La firma se aplica automáticamente con el certificado configurado. Se simulan el envío, la espera de aprobación y la respuesta del SRI.
        </p>
      </div>
      {emissionBlocker && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><div><strong>{emissionBlocker === 'certificate' ? 'Configura tu firma digital antes de emitir.' : 'Configura la cuenta SRI antes de sincronizar.'}</strong><p className="mt-1 text-xs">Se configura una sola vez en Perfil; la clave no se pide por cada documento.</p></div><button type="button" onClick={() => setActiveTab('profile')} className="rounded-lg bg-amber-900 px-3 py-2 text-xs font-semibold text-white">Abrir perfil</button></div>}

      {/* Stepper Modal / Overlay when emitting */}
      {isEmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Preparando vista previa de demostración</h3>
              <p className="text-xs text-slate-500">Los pasos y la respuesta son simulados; no hay conexión con el SRI.</p>
            </div>

            {/* 4-Step Visual Stepper */}
            <div className="space-y-3">
              {[
                { step: 1, label: '1. Preparando datos de ejemplo', icon: FileCode },
                { step: 2, label: '2. Firma automática con tu certificado configurado', icon: ShieldCheck },
                { step: 3, label: '3. Pendiente por aprobación del SRI', icon: Send },
                { step: 4, label: '4. Aprobado por el SRI y enviado · demo', icon: CheckCircle2 }
              ].map((s) => {
                const Icon = s.icon;
                const isCompleted = emissionStep > s.step;
                const isCurrent = emissionStep === s.step;
                const isPending = emissionStep < s.step;

                return (
                  <div
                    key={s.step}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-all ${
                      isCompleted
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                        : isCurrent
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isCompleted ? 'text-emerald-600' : isCurrent ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{s.label}</span>
                    </div>

                    <div>
                      {isCompleted && <span className="text-emerald-700 font-semibold">Listo</span>}
                      {isCurrent && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                      {isPending && <span className="text-slate-400 text-[11px]">En espera</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Emission Form */}
      <form onSubmit={handleEmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">Datos de {docLabels[docType]}</h2>
            <span className="text-xs text-slate-500">Demostración local · Establecimiento 001 · Punto de emisión 001</span>
          </div>

          <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800">Tipo elegido desde “Nuevo”</span>
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">
          {docType === 'FACTURA' && 'Registra los datos de tu cliente y los bienes o servicios de ejemplo.'}
          {docType === 'NOTA_CREDITO' && 'Asocia la nota a una factura previa e indica el motivo del ajuste.'}
          {docType === 'NOTA_DEBITO' && 'Asocia la nota a una factura previa e indica el motivo del valor adicional.'}
          {docType === 'RETENCION' && 'Registra al proveedor y relaciona el comprobante sujeto a retención. El porcentaje es ilustrativo.'}
          {docType === 'GUIA_REMISION' && 'Registra origen, destino y transporte para simular el traslado de bienes.'}
          {docType === 'LIQUIDACION_COMPRA' && 'Registra la contraparte para una liquidación de compra de ejemplo.'}
        </div>
        {docType === 'RETENCION' && <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Estimación referencial sobre la base ingresada: ${(subtotal15 * (Number(withholdingPercent) || 0) / 100).toFixed(2)}. No es un cálculo tributario ni un valor validado.</p>}
        {(docType === 'NOTA_CREDITO' || docType === 'NOTA_DEBITO' || docType === 'RETENCION') && <div className="grid gap-3 rounded-lg border bg-slate-50 p-4 text-xs sm:grid-cols-2"><label>Comprobante relacionado<input required value={referenceNumber} onChange={(event)=>setReferenceNumber(event.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2" /></label><label>Motivo / concepto<input required value={documentReason} onChange={(event)=>setDocumentReason(event.target.value)} placeholder="Describe el motivo" className="mt-1 w-full rounded-lg border bg-white px-3 py-2" /></label>{docType === 'RETENCION' && <label>Porcentaje de ejemplo<input type="number" step="0.01" value={withholdingPercent} onChange={(event)=>setWithholdingPercent(event.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2" /></label>}</div>}
        {docType === 'GUIA_REMISION' && <div className="grid gap-3 rounded-lg border bg-slate-50 p-4 text-xs sm:grid-cols-2">{[['Dirección de origen',originAddress,setOriginAddress],['Dirección de destino',destinationAddress,setDestinationAddress],['Transportista',carrierName,setCarrierName],['Placa del vehículo',vehiclePlate,setVehiclePlate]].map(([label,value,setter])=><label key={String(label)}>{String(label)}<input value={String(value)} onChange={(event)=>(setter as (value:string)=>void)(event.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2" /></label>)}</div>}

        {/* Customer Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">{docType === 'RETENCION' || docType === 'LIQUIDACION_COMPRA' ? 'RUC / Cédula del proveedor' : 'RUC / Cédula del cliente'}</label>
            <input
              type="text"
              required
              value={clientRuc}
              onChange={(e) => setClientRuc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Razón Social / Nombres</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Fecha de Emisión</label>
            <input
              type="date"
              required
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-slate-700 font-semibold mb-1">Dirección del Cliente</label>
            <input
              type="text"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Forma de Pago</label>
            <select
              value={formaPago}
              onChange={(e) => setFormaPago(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-[11px]"
            >
              <option value="20 - OTROS CON UTILIZACION DEL SISTEMA FINANCIERO">20 - Con Sistema Financiero (Transferencia/Tarjeta)</option>
              <option value="01 - SIN UTILIZACION DEL SISTEMA FINANCIERO (EFECTIVO)">01 - Efectivo</option>
              <option value="19 - TARJETA DE CREDITO">19 - Tarjeta de Crédito</option>
            </select>
          </div>
        </div>

        {/* Product Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Ítems & Servicios a Facturar</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Línea
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-semibold">
                  <th className="p-3 w-24">Código</th>
                  <th className="p-3">Descripción del Producto / Servicio</th>
                  <th className="p-3 w-20 text-right">Cant.</th>
                  <th className="p-3 w-28 text-right">Precio Unit.</th>
                  <th className="p-3 w-24 text-center">Tarifa IVA</th>
                  <th className="p-3 w-28 text-right">Total</th>
                  <th className="p-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.code}
                        onChange={(e) => handleUpdateItem(item.id, 'code', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-[11px]"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-right font-mono"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-right font-mono"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={item.taxPercent}
                        onChange={(e) => handleUpdateItem(item.id, 'taxPercent', parseInt(e.target.value, 10))}
                        className="px-2 py-1 border border-slate-200 rounded text-[11px] font-semibold text-blue-700 bg-white"
                      >
                        <option value={15}>15% IVA</option>
                        <option value={0}>0% IVA</option>
                      </select>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800 tabular-nums">
                      ${item.total.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length <= 1}
                        className="text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & Submit Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 border-t border-slate-200">
          <div className="md:col-span-7 space-y-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 block">Condiciones Legales de Emisión:</span>
            <p>
              Datos de demostración. No se contacta realmente al SRI; la aprobación y sincronización son simuladas.
            </p>
          </div>

          <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal 15%:</span>
              <span className="font-mono tabular-nums">${subtotal15.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal 0%:</span>
              <span className="font-mono tabular-nums">${subtotal0.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-blue-700 font-semibold">
              <span>IVA (15% Ecuador 2026):</span>
              <span className="font-mono tabular-nums">${iva15.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>VALOR TOTAL:</span>
              <span className="font-mono tabular-nums text-emerald-600">${total.toFixed(2)}</span>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isEmitting || Boolean(emissionBlocker)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isEmitting ? 'Procesando envío simulado…' : 'Firmar automáticamente y enviar · demo'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

    </div>
  );
};
