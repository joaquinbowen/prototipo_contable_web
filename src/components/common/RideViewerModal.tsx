import React from 'react';
import { ElectronicInvoice } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Printer, Download, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

interface RideViewerModalProps {
  invoice: ElectronicInvoice;
  onClose: () => void;
}

export const RideViewerModal: React.FC<RideViewerModalProps> = ({ invoice, onClose }) => {
  const { profile } = useApp();
  const documentLabels: Record<ElectronicInvoice['type'], { title: string; code: string }> = {
    FACTURA: { title: 'FACTURA', code: '01' },
    NOTA_CREDITO: { title: 'NOTA DE CRÉDITO', code: '04' },
    NOTA_DEBITO: { title: 'NOTA DE DÉBITO', code: '05' },
    RETENCION: { title: 'RETENCIÓN', code: '07' },
    GUIA_REMISION: { title: 'GUÍA DE REMISIÓN', code: '06' },
    LIQUIDACION_COMPRA: { title: 'LIQUIDACIÓN DE COMPRA', code: '03' }
  };
  const documentLabel = documentLabels[invoice.type];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Top Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-semibold tracking-wide">VISTA PREVIA · {documentLabel.title}</span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">[{invoice.id}]</span>
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> DEMO LOCAL
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </button>
            <button
              onClick={() => {
                alert(`Descarga simulada de: RIDE_${invoice.secuencial}.pdf`);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> PDF demo
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Content - Styled as official Ecuadorian RIDE A4 page */}
        <div className="overflow-y-auto p-6 md:p-8 bg-slate-100 flex-1">
          <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 shadow-sm border border-slate-300 text-slate-800 text-xs font-sans">
            {/* Header Grid: Issuer on Left, SRI Access Box on Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-300">
              {/* Left Column: Emisor */}
              <div className="p-3 border border-slate-200 rounded-sm bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-sm bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      CM
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-slate-900 leading-tight">{profile.razonSocial}</h2>
                      <p className="text-[11px] text-slate-500">{profile.nombreComercial}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-600 mt-2">
                    <p><strong className="text-slate-800">Dirección Matriz:</strong> {profile.direccion}</p>
                    <p><strong className="text-slate-800">Dirección Sucursal:</strong> {invoice.establecimiento} - Matriz Principal</p>
                    <p><strong className="text-slate-800">Obligado a Llevar Contabilidad:</strong> {profile.obligadoContabilidad ? 'SÍ' : 'NO'}</p>
                    <p><strong className="text-slate-800">Contribuyente Régimen:</strong> {profile.regimen}</p>
                    {profile.agenteRetencion && <p><strong className="text-slate-800">Agente de Retención:</strong> Resolución No. NAC-DNCRASC20-00000001</p>}
                  </div>
                </div>
              </div>

              {/* Right Column: SRI Box */}
              <div className="p-3 border border-slate-200 rounded-sm bg-slate-50/50 space-y-1.5 text-[11px]">
                <div className="pb-1 border-b border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase">R.U.C.:</span>
                  <p className="font-mono font-bold text-sm text-slate-900">{profile.ruc}</p>
                </div>
                <div>
                  <span className="font-bold text-sm text-blue-900">{documentLabel.title}</span>
                  <p className="font-mono text-xs">No. {invoice.establecimiento}-{invoice.puntoEmision}-{invoice.secuencial}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">IDENTIFICADOR DE VISTA PREVIA:</p>
                  <p className="font-mono text-[10px] break-all leading-tight text-slate-700">{invoice.numeroAutorizacion}</p>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 pt-1">
                  <div><strong>FECHA DE SIMULACIÓN:</strong> {invoice.date} {invoice.horaEmision || '12:00:00'}</div>
                  <div><strong>AMBIENTE:</strong> DEMOSTRACIÓN</div>
                  <div><strong>EMISIÓN:</strong> NORMAL</div>
                  <div><strong>TIPO DOC:</strong> {documentLabel.code} {documentLabel.title}</div>
                </div>
                <div className="pt-1.5 border-t border-slate-200">
                  <p className="text-[10px] text-slate-500">CLAVE DE ACCESO:</p>
                  {/* Visual Barcode simulation */}
                  <div className="h-7 w-full bg-slate-900 my-1 flex items-stretch px-1 gap-px opacity-90 overflow-hidden">
                    {Array.from({ length: 65 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white flex-1"
                        style={{
                          opacity: (i * 7) % 3 === 0 ? 1 : 0.1,
                          width: (i % 2 === 0) ? '1.5px' : '0.8px'
                        }}
                      />
                    ))}
                  </div>
                  <p className="font-mono text-[9px] tracking-wider text-center text-slate-700 break-all">{invoice.claveAcceso}</p>
                </div>
              </div>
            </div>

            {/* Buyer / Client Box */}
            <div className="my-3 p-3 border border-slate-200 rounded-sm bg-slate-50/30 text-[11px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p><strong className="text-slate-700">Razón Social / Nombres:</strong> {invoice.clientRucName}</p>
                  <p><strong className="text-slate-700">Identificación (RUC/CI):</strong> <span className="font-mono">{invoice.clientRuc}</span></p>
                  <p><strong className="text-slate-700">Fecha de Emisión:</strong> {invoice.date}</p>
                </div>
                <div>
                  <p><strong className="text-slate-700">Dirección:</strong> {invoice.clientAddress || 'Quito, Ecuador'}</p>
                  <p><strong className="text-slate-700">Correo Electrónico:</strong> {invoice.clientEmail || 'cliente@empresa.ec'}</p>
                  <p><strong className="text-slate-700">Guía de Remisión:</strong> S/N</p>
                </div>
              </div>
            </div>

            {/* Product Items Table */}
            <div className="border border-slate-300 rounded-sm overflow-hidden my-3">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-200/80 text-slate-800 border-b border-slate-300 font-semibold">
                    <th className="p-2 w-20">Cod. Principal</th>
                    <th className="p-2 w-16 text-right">Cant.</th>
                    <th className="p-2">Descripción</th>
                    <th className="p-2 w-24 text-right">Precio Unit.</th>
                    <th className="p-2 w-20 text-right">Descuento</th>
                    <th className="p-2 w-24 text-right">Precio Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono text-[10px] text-slate-600">{item.code}</td>
                      <td className="p-2 text-right font-mono tabular-nums">{item.quantity}</td>
                      <td className="p-2 text-slate-800">{item.description}</td>
                      <td className="p-2 text-right font-mono tabular-nums">${item.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono tabular-nums">${item.discount.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono tabular-nums font-medium">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Section: Payment/Additional Info & Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Additional Details & Payment Method */}
              <div className="space-y-3">
                <div className="p-3 border border-slate-200 rounded-sm text-[11px] bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 mb-1 border-b border-slate-200 pb-1">Información Adicional</h4>
                  <p><strong className="text-slate-600">Email:</strong> {invoice.clientEmail}</p>
                  <p><strong className="text-slate-600">Régimen:</strong> Contribuyente Régimen RIMPE</p>
                  <p><strong className="text-slate-600">Sistema Emisor:</strong> CONT MARJO 360 v2026.1</p>
                  {invoice.observaciones && <p><strong className="text-slate-600">Detalle:</strong> {invoice.observaciones}</p>}
                </div>

                <div className="p-3 border border-slate-200 rounded-sm text-[11px] bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 mb-1 border-b border-slate-200 pb-1">Forma de Pago</h4>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="truncate pr-2">{invoice.formaPago}</span>
                    <span className="font-mono font-bold shrink-0 tabular-nums">${invoice.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* SRI Seal Validation */}
                <div className="flex items-center gap-2 p-2 border border-emerald-200 bg-emerald-50/60 rounded-sm text-[11px] text-emerald-800">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
                  <div>
                    <span className="font-semibold block">Vista previa de documento simulado</span>
                    <span className="text-[10px] text-emerald-700">No se aplicó una firma ni se consultó el SRI.</span>
                  </div>
                  <QrCode className="w-8 h-8 ml-auto text-emerald-700 shrink-0" />
                </div>
              </div>

              {/* Totals Table */}
              <div className="border border-slate-300 rounded-sm overflow-hidden text-[11px]">
                <table className="w-full text-right border-collapse">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2 font-medium bg-slate-50 text-slate-700">SUBTOTAL 15%:</td>
                      <td className="p-2 font-mono tabular-nums">${invoice.subtotal15.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium bg-slate-50 text-slate-700">SUBTOTAL 0%:</td>
                      <td className="p-2 font-mono tabular-nums">${invoice.subtotal0.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium bg-slate-50 text-slate-700">SUBTOTAL NO OBJETO DE IVA:</td>
                      <td className="p-2 font-mono tabular-nums">$0.00</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium bg-slate-50 text-slate-700">SUBTOTAL EXENTO DE IVA:</td>
                      <td className="p-2 font-mono tabular-nums">$0.00</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium bg-slate-50 text-slate-700">SUBTOTAL SIN IMPUESTOS:</td>
                      <td className="p-2 font-mono tabular-nums font-semibold">${(invoice.subtotal15 + invoice.subtotal0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium bg-slate-50 text-slate-700">TOTAL DESCUENTO:</td>
                      <td className="p-2 font-mono tabular-nums">$0.00</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium bg-slate-50 text-slate-700">IVA 15%:</td>
                      <td className="p-2 font-mono tabular-nums font-semibold text-blue-700">${invoice.iva15.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-slate-800 text-white font-bold text-xs">
                      <td className="p-2.5">VALOR TOTAL:</td>
                      <td className="p-2.5 font-mono tabular-nums text-emerald-400">${invoice.total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-slate-200 shrink-0 text-xs text-slate-500">
          <span>Clave de ejemplo: <span className="font-mono text-slate-700">{invoice.claveAcceso.slice(0, 16)}...</span></span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
};
