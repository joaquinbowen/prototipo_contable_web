import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentType } from '../../types';
import {
  Home,
  Receipt,
  Store,
  FolderLock,
  User,
  Plus,
  Bell,
  Eye,
  CheckCircle2,
  Calendar,
  Send,
  ShieldCheck,
  FileText,
  ScanLine,
  KeyRound,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const MobileShell: React.FC = () => {
  const {
    profile,
    invoices,
    taxDeadlines,
    vaultDocuments,
    updateCertificate,
    marketplaceRequests,
    activeRole,
    setActiveRole,
    emitInvoiceWithStepper,
    isEmitting,
    emissionStep,
    setActiveRideInvoice,
    triggerSamplePushAlert,
    setDeviceMode,
    toasts,
    dismissToast
  } = useApp();

  const [activeMobileTab, setActiveMobileTab] = useState<'inicio' | 'facturar' | 'marketplace' | 'boveda' | 'perfil'>('inicio');
  const [profileSection, setProfileSection] = useState<'account' | 'signature' | 'vault'>('account');
  const [certFileName, setCertFileName] = useState('');
  const [certPassword, setCertPassword] = useState('');
  const [mobileDocType, setMobileDocType] = useState<DocumentType>('FACTURA');
  useEffect(() => setActiveMobileTab('inicio'), [activeRole]);

  // Fast invoice mobile state
  const [fastClientName, setFastClientName] = useState('CORPORACIÓN ANDINA CIA.');
  const [fastClientRuc, setFastClientRuc] = useState('1790019283001');
  const [fastAmount, setFastAmount] = useState('100.00');
  const [fastItemDesc, setFastItemDesc] = useState('Servicios Profesionales de Asesoría');

  const handleMobileEmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sub15 = parseFloat(fastAmount) || 100;
    const iva = sub15 * 0.15;
    const tot = sub15 + iva;

    await emitInvoiceWithStepper({
      secuencial: '000000000',
      establecimiento: '001',
      puntoEmision: '001',
      clientRucName: fastClientName,
      clientRuc: fastClientRuc,
      clientEmail: 'contacto@cliente.ec',
      clientAddress: 'Quito, Ecuador',
      date: new Date().toISOString().slice(0, 10),
      type: mobileDocType,
      subtotal15: sub15,
      subtotal0: 0,
      iva15: iva,
      total: tot,
      items: [
        {
          id: `m-it-${Date.now()}`,
          code: 'MOB-01',
          description: fastItemDesc,
          quantity: 1,
          unitPrice: sub15,
          discount: 0,
          taxPercent: 15,
          taxAmount: iva,
          total: tot
        }
      ],
      formaPago: '20 - OTROS CON UTILIZACION DEL SISTEMA FINANCIERO'
    });
  };

  const totalSales = invoices.reduce((a, b) => a + b.total, 0);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-6 bg-slate-800 min-h-screen">
      {/* Top Banner outside phone */}
      <div className="mb-4 text-center text-white flex items-center gap-3">
        <span className="text-xs font-semibold bg-blue-600 px-3 py-1 rounded-full text-white">
          Simulador Móvil · CONT MARJO 360 App
        </span>
        <button
          onClick={() => setDeviceMode('desktop')}
          className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
        >
          Volver a Vista Web Escritorio
        </button>
      </div>

      {/* Smartphone Chassis Device Frame */}
      <div className="w-full max-w-[390px] h-[810px] bg-white rounded-[44px] shadow-2xl border-[10px] border-slate-900 flex flex-col overflow-hidden relative select-none">
        {/* Notch / Dynamic Island */}
        <div className="h-7 bg-slate-900 w-full flex items-center justify-between px-7 shrink-0 text-[11px] text-white font-medium">
          <span>17:37</span>
          <div className="w-24 h-4 bg-black rounded-full" />
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Mobile App Header */}
        <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              360
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">CONT MARJO</span>
              <span className="text-[10px] font-mono text-slate-500">RUC {profile.ruc.slice(0, 10)}...</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerSamplePushAlert('Alerta SRI Móvil', 'Vencimiento el 26 del mes.')}
              className="p-1.5 text-amber-600 bg-amber-50 rounded-lg"
              title="Simular Push"
            >
              <Bell className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
              {activeRole === 'CONTRIBUYENTE' ? 'Contrib.' : activeRole === 'CONTADOR_PROFESIONAL' ? 'CPA' : 'Admin'}
            </span>
          </div>
        </div>

        {toasts[0] && <div className="border-b border-blue-200 bg-blue-50 px-4 py-2 text-[11px] text-blue-900"><div className="flex items-start justify-between gap-2"><p><strong>{toasts[0].title}:</strong> {toasts[0].message}</p><button onClick={() => dismissToast(toasts[0].id)} aria-label="Cerrar aviso" className="font-bold">×</button></div></div>}

        {/* Mobile Viewport Screen Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 text-xs">
          {/* TAB 1: INICIO */}
          {activeMobileTab === 'inicio' && activeRole !== 'CONTRIBUYENTE' ? (
            <div className="space-y-4"><section className="rounded-2xl border bg-white p-4"><p className="text-[10px] font-bold uppercase text-blue-600">{activeRole === 'CONTADOR_PROFESIONAL' ? 'Espacio profesional' : 'Consola de plataforma · Demo'}</p><h2 className="mt-1 text-sm font-bold">{activeRole === 'CONTADOR_PROFESIONAL' ? 'Cartera contable' : 'Resumen de administración'}</h2><p className="mt-2 text-[11px] text-slate-600">{activeRole === 'CONTADOR_PROFESIONAL' ? 'Gestiona oportunidades desde el Marketplace y revisa tu perfil profesional.' : 'Las métricas administrativas son datos ficticios para la demostración.'}</p></section>{activeRole === 'CONTADOR_PROFESIONAL' && <button onClick={() => setActiveMobileTab('marketplace')} className="w-full rounded-xl bg-blue-600 p-3 text-left text-xs font-bold text-white">Explorar oportunidades contables →</button>}</div>
          ) : activeMobileTab === 'inicio' && (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Régimen RIMPE Ecuador</span>
                <h2 className="font-bold text-sm text-slate-900 leading-tight">{profile.razonSocial}</h2>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                  <span>Ventas Octubre:</span>
                  <strong className="font-mono text-slate-900 text-sm tabular-nums">${totalSales.toFixed(2)}</strong>
                </div>
              </div>

              {/* Tax deadline widget */}
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-amber-900 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" /> Vencimiento 9no Dígito
                  </span>
                  <span className="text-[10px] font-bold bg-amber-200/80 px-2 py-0.5 rounded-full">
                    Día 26
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Declaración Semestral de IVA y Anexo ATS para RIMPE Emprendedor.
                </p>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-2 text-center font-semibold text-xs">
                <button
                  onClick={() => setActiveMobileTab('facturar')}
                  className="p-3 bg-blue-600 text-white rounded-xl shadow-xs flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  <span>Emitir Factura</span>
                </button>
                <button
                  onClick={() => { setActiveMobileTab('perfil'); setProfileSection('signature'); }}
                  className="p-3 bg-slate-900 text-white rounded-xl shadow-xs flex flex-col items-center gap-1 cursor-pointer"
                >
                  <FolderLock className="w-5 h-5 text-emerald-400" />
                  <span>Firma digital</span>
                </button>
              </div>

              {/* Recent Invoices */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Últimos Comprobantes SRI</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">100% Autorizados</span>
                </div>
                <div className="space-y-2">
                  {invoices.slice(0, 3).map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => setActiveRideInvoice(inv)}
                      className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between cursor-pointer hover:bg-blue-50/50"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block truncate max-w-[170px]">
                          {inv.clientRucName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{inv.id}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 block">${inv.total.toFixed(2)}</span>
                        <span className="text-[10px] text-blue-600 font-medium">Ver RIDE</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FACTURAR */}
          {activeMobileTab === 'facturar' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">Emisión Rápida Móvil</h3>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">IVA 15%</span>
                </div>

                <form onSubmit={handleMobileEmit} className="space-y-3">
                  <div><label className="mb-1 block text-[11px] font-medium text-slate-600">Tipo de documento</label><select value={mobileDocType} onChange={(event) => setMobileDocType(event.target.value as DocumentType)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"><option value="FACTURA">Factura</option><option value="NOTA_CREDITO">Nota de crédito</option><option value="NOTA_DEBITO">Nota de débito</option><option value="RETENCION">Comprobante de retención</option><option value="GUIA_REMISION">Guía de remisión</option><option value="LIQUIDACION_COMPRA">Liquidación de compra</option></select></div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1 text-[11px]">Cliente / Razón Social</label>
                    <input
                      type="text"
                      required
                      value={fastClientName}
                      onChange={(e) => setFastClientName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1 text-[11px]">RUC / Cédula</label>
                    <input
                      type="text"
                      required
                      value={fastClientRuc}
                      onChange={(e) => setFastClientRuc(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1 text-[11px]">Descripción del Servicio</label>
                    <input
                      type="text"
                      required
                      value={fastItemDesc}
                      onChange={(e) => setFastItemDesc(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1 text-[11px]">Subtotal (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={fastAmount}
                      onChange={(e) => setFastAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-xs"
                    />
                  </div>

                  {/* Calculations Preview */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>IVA 15%:</span>
                      <span className="font-mono">${((parseFloat(fastAmount) || 0) * 0.15).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                      <span>TOTAL A COBRAR:</span>
                      <span className="font-mono text-emerald-600">${((parseFloat(fastAmount) || 0) * 1.15).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isEmitting}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Crear vista previa</span>
                  </button>
                </form>
              </div>

              {/* Status Stepper on Mobile */}
              {isEmitting && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-center space-y-1">
                  <span className="font-bold text-xs">Paso {emissionStep} de 4 en curso</span>
                  <p className="text-[11px] text-blue-700 font-mono">
                    {emissionStep === 1 && 'Generando XML XSD'}
                    {emissionStep === 2 && 'Firmando con Llave .PFX'}
                    {emissionStep === 3 && 'Simulando respuesta (sin conexión al SRI)'}
                    {emissionStep === 4 && 'Vista previa lista'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MARKETPLACE */}
          {activeMobileTab === 'marketplace' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">Marketplace de Contadores</span>
                <span className="text-[10px] text-slate-500 font-mono">{marketplaceRequests.length} activas</span>
              </div>

              {marketplaceRequests.filter((req) => activeRole === 'CONTADOR_PROFESIONAL' ? req.status !== 'FINALIZADA' : req.clientId === 'CLI-001').map((req) => (
                <div key={req.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 leading-tight">{req.title}</span>
                    <span className="font-mono font-bold text-blue-700 text-[11px] shrink-0 ml-2">
                      {req.budgetRange}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{req.description}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                    <span>{req.offers.length} ofertas recibidas</span>
                    <span className="text-emerald-700 font-semibold">{req.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: BÓVEDA */}
          {activeMobileTab === 'perfil' && profileSection === 'vault' && (
            <div className="space-y-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Bóveda documental</span>
                  <span className="font-mono text-[10px] text-slate-500">{profile.storageUsed} / {profile.storageLimit} docs</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(profile.storageUsed / profile.storageLimit) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                {vaultDocuments.map((doc) => (
                  <div key={doc.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                    <div className="truncate max-w-[210px]">
                      <span className="font-bold text-slate-900 block truncate text-[11px]">{doc.nombre}</span>
                      <span className="text-[10px] text-slate-500">{doc.tipo} · {doc.tamanoMb}MB</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        doc.estadoFirma === 'FIRMADO'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {doc.estadoFirma === 'FIRMADO' ? 'Firmado' : 'Pendiente'}
                    </span>
                  </div>
                ))}
                {vaultDocuments.length === 0 && <p className="rounded-xl border border-dashed bg-white p-5 text-center text-xs text-slate-500">Aún no hay archivos. Añádelos desde el perfil web.</p>}
              </div>
            </div>
          )}

          {activeMobileTab === 'perfil' && profileSection === 'signature' && <section className="space-y-3 rounded-2xl border bg-white p-4"><div><h2 className="font-bold text-slate-900">Firma digital</h2><p className="mt-1 text-[11px] text-slate-500">Adjunta aquí el certificado .PFX / .P12. Esta simulación no almacena el archivo ni la clave y no valida el certificado.</p></div><div className="rounded-lg bg-slate-50 p-3 text-xs"><strong>{profile.signatureConfigured ? 'Configurado en la demo' : 'Pendiente'}</strong>{profile.signatureConfigured && <span className="mt-1 block text-slate-600">{profile.signatureCertIssuer} · vence {profile.signatureCertExpiryDate}</span>}</div><label className="block text-xs font-semibold">Archivo del certificado<input type="file" accept=".pfx,.p12" onChange={(event) => setCertFileName(event.target.files?.[0]?.name || '')} className="mt-1.5 block w-full rounded-lg border p-2"/></label><label className="block text-xs font-semibold">Contraseña<input type="password" value={certPassword} onChange={(event) => setCertPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border p-2"/></label><button disabled={!certFileName || !certPassword} onClick={() => { updateCertificate('Entidad indicada en la simulación', '2027-10-14'); setCertPassword(''); }} className="w-full rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-50">Adjuntar y revisar estado</button>{certFileName && <p className="text-[10px] text-slate-500">Archivo seleccionado: {certFileName}</p>}<button onClick={() => setProfileSection('account')} className="text-xs font-semibold text-blue-700">← Volver al perfil</button></section>}

          {/* TAB 5: PERFIL */}
          {activeMobileTab === 'perfil' && profileSection === 'account' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mx-auto flex items-center justify-center">
                  CM
                </div>
                <h3 className="font-bold text-slate-900 text-xs">{profile.razonSocial}</h3>
                <span className="text-[11px] font-mono text-slate-500 block">RUC: {profile.ruc}</span>
              </div>

              {/* RBAC Switcher on Mobile */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                <span className="font-bold text-slate-800 text-[11px] block">Cambiar Rol Activo (RBAC)</span>
                <div className="grid grid-cols-3 gap-1">
                  {(['CONTRIBUYENTE', 'CONTADOR_PROFESIONAL', 'SUPER_ADMIN'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setActiveRole(r)}
                      className={`p-2 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                        activeRole === r
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {r === 'CONTRIBUYENTE' ? 'Contrib.' : r === 'CONTADOR_PROFESIONAL' ? 'Contador' : 'Admin'}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setProfileSection('signature')} className="w-full rounded-xl border bg-white p-3 text-left text-xs font-semibold text-blue-700">Abrir firma digital →</button>
              <button onClick={() => setProfileSection('vault')} className="w-full rounded-xl border bg-white p-3 text-left text-xs font-semibold text-blue-700">Abrir bóveda documental →</button>
            </div>
          )}
        </div>

        {/* Floating Action Button (FAB) for Instant Invoicing */}
        {activeRole === 'CONTRIBUYENTE' && activeMobileTab !== 'facturar' && (
          <button
            onClick={() => setActiveMobileTab('facturar')}
            className="absolute bottom-16 right-5 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer z-10"
            aria-label="Nueva Factura Rápida"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        {/* Fixed Mobile Bottom Tab Bar */}
        <div className="h-14 bg-white border-t border-slate-200 grid grid-cols-4 items-center px-1 shrink-0 z-20">
          {(activeRole === 'CONTRIBUYENTE' ? [
            { id: 'inicio', label: 'Inicio', icon: Home }, { id: 'facturar', label: 'Facturar', icon: Receipt }, { id: 'marketplace', label: 'Marketplace', icon: Store }, { id: 'perfil', label: 'Perfil', icon: User }
          ] : activeRole === 'CONTADOR_PROFESIONAL' ? [
            { id: 'inicio', label: 'Inicio', icon: Home }, { id: 'marketplace', label: 'Oportunidades', icon: Store }, { id: 'perfil', label: 'Perfil', icon: User }
          ] : [
            { id: 'inicio', label: 'Inicio', icon: Home }, { id: 'perfil', label: 'Perfil', icon: User }
          ]).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMobileTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveMobileTab(tab.id as any); if (tab.id === 'perfil') setProfileSection('account'); }}
                className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Home Indicator */}
        <div className="h-4 bg-white flex items-center justify-center shrink-0">
          <div className="w-28 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
