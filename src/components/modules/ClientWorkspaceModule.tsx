import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Building2, FileText, ShieldAlert, Upload, CalendarDays, CheckCircle2 } from 'lucide-react';

export const ClientWorkspaceModule: React.FC = () => {
  const { accountantClients, impersonatedClientId, setImpersonatedClientId, setActiveTab, clientAuditEvidence, addClientAuditEvidence } = useApp();
  const client = accountantClients.find((entry) => entry.id === impersonatedClientId);
  const [obligation, setObligation] = useState<'IVA mensual' | 'Impuesto a la renta' | 'ATS / anexo' | 'Otra obligación'>('IVA mensual');
  const [period, setPeriod] = useState('2026-09');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [savedMessage, setSavedMessage] = useState('');
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const evidence = useMemo(() => clientAuditEvidence.filter((entry) => entry.clientId === client?.id), [clientAuditEvidence, client?.id]);
  if (!client) return <section className="rounded-xl border bg-white p-6"><p>No hay un cliente seleccionado.</p><button onClick={() => setActiveTab('accountant_dashboard')} className="mt-3 rounded bg-blue-600 px-3 py-2 text-white">Volver a cartera</button></section>;

  const submitEvidence = (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;
    addClientAuditEvidence({ clientId: client.id, obligation, period, fileName: file.name, fileType: file.name.toLowerCase().endsWith('.xml') ? 'XML' : 'PDF', note });
    setSavedMessage(`${file.name} quedó registrado como evidencia de ${obligation} · ${period}.`);
    setFile(null); setNote('');
    const input = document.getElementById('audit-evidence-file') as HTMLInputElement | null;
    if (input) input.value = '';
  };

  return <div className="space-y-5">
    <header className="rounded-2xl border border-amber-300/80 bg-amber-50/80 p-5 sm:p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="flex items-center gap-2 text-xs font-bold uppercase text-amber-800"><ShieldAlert className="h-4 w-4"/>Expediente de cliente · demo</span><h1 className="mt-2 text-2xl font-bold text-slate-900">{client.razonSocial}</h1><p className="mt-1 font-mono text-sm text-slate-600">RUC {client.ruc} · {client.regimen}</p></div><button onClick={() => {setImpersonatedClientId(null);setActiveTab('accountant_dashboard');}} className="flex min-h-11 items-center gap-2 rounded-xl bg-blue-800 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-900"><ArrowLeft className="h-4 w-4"/>Volver a cartera</button></div><p className="mt-3 text-xs text-amber-900">Espacio local de demostración. No consulta el SRI ni almacena archivos en un servidor.</p></header>
    <section className="grid gap-4 md:grid-cols-3"><article className="rounded-xl border bg-white p-5"><p className="text-xs text-slate-500">Próxima obligación</p><strong className="mt-1 block">{client.proximaObligacion}</strong><p className="mt-2 text-sm text-slate-600">Vence {client.fechaVencimiento} · en {client.diasRestantes} días</p></article><article className="rounded-xl border bg-white p-5"><p className="text-xs text-slate-500">Estado de cumplimiento</p><strong className="mt-1 block">{client.estadoAlerta.replace('_',' ')}</strong><p className="mt-2 text-sm text-slate-600">{client.facturasMes} comprobantes este mes (dato de ejemplo)</p></article><article className="rounded-xl border bg-white p-5"><p className="text-xs text-slate-500">Permiso de acceso</p><strong className="mt-1 block">Consentimiento simulado</strong><p className="mt-2 text-sm text-slate-600">En producción debe existir autorización del cliente.</p></article></section>

    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-3"><button type="button" onClick={() => setShowEvidenceForm(!showEvidenceForm)} aria-expanded={showEvidenceForm} className="flex w-full items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-left"><span className="flex items-center gap-2 text-sm font-bold text-blue-900"><Upload className="h-4 w-4"/>Registrar evidencia entregada</span><span className="text-xs text-blue-700">{showEvidenceForm ? 'Ocultar' : 'Abrir carga'}</span></button>
      {showEvidenceForm && <form onSubmit={submitEvidence} className="space-y-4 rounded-xl border bg-white p-5"><h2 className="font-bold">Adjuntar evidencia del trabajo realizado</h2>
        <label className="block text-sm font-medium">Obligación<select value={obligation} onChange={(event) => setObligation(event.target.value as typeof obligation)} className="mt-1.5 w-full rounded-lg border p-2.5"><option>IVA mensual</option><option>Impuesto a la renta</option><option>ATS / anexo</option><option>Otra obligación</option></select></label>
        <label className="block text-sm font-medium">Periodo<input required type="month" value={period} onChange={(event) => setPeriod(event.target.value)} className="mt-1.5 w-full rounded-lg border p-2.5"/></label>
        <label className="block text-sm font-medium">Declaración o comprobante de respaldo (.PDF o .XML)<input id="audit-evidence-file" required type="file" accept=".pdf,.xml,application/pdf,application/xml,text/xml" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-1.5 block w-full rounded-lg border p-2 text-sm"/><span className="mt-1 block text-xs text-slate-500">{file ? `Seleccionado: ${file.name}` : 'Selecciona la evidencia que entregas al cliente.'}</span></label>
        <label className="block text-sm font-medium">Nota de entrega (opcional)<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Ej. Declaración preparada para el periodo indicado. Incluye comprobante de recepción si aplica." className="mt-1.5 w-full rounded-lg border p-2.5"/></label>
        <button disabled={!file} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><Upload className="h-4 w-4"/>Registrar evidencia entregada</button>
        {savedMessage && <p role="status" className="flex items-start gap-2 text-sm text-emerald-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0"/>{savedMessage}</p>}
      </form>}
      </div>

      <section className="overflow-hidden rounded-xl border bg-white"><div className="border-b p-5"><h2 className="font-bold">Evidencias entregadas</h2><p className="text-xs text-slate-500">El contribuyente podría consultar estos entregables en su expediente.</p></div>{evidence.length === 0 ? <div className="p-8 text-center"><FileText className="mx-auto h-8 w-8 text-slate-300"/><p className="mt-2 text-sm font-semibold">Aún no hay evidencia registrada</p><p className="text-xs text-slate-500">Al registrar una declaración, aparecerá aquí con su obligación y periodo.</p></div> : <ul className="divide-y">{evidence.map((entry) => <li key={entry.id} className="p-4"><div className="flex items-start justify-between gap-2"><div className="flex min-w-0 items-start gap-2"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"/><div className="min-w-0"><strong className="block truncate text-sm">{entry.fileName}</strong><span className="mt-0.5 block text-xs text-slate-600">{entry.obligation} · periodo {entry.period}</span>{entry.note && <p className="mt-2 text-xs text-slate-500">{entry.note}</p>}</div></div><span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-800">{entry.status}</span></div><div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-500"><span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5"/>Entregado {entry.uploadedAt}</span><span>Formato {entry.fileType} · archivo no retenido por la demo</span></div></li>)}</ul>}</section>
    </section>
    <section className="rounded-xl border bg-white p-5"><h2 className="flex items-center gap-2 font-bold"><Building2 className="h-4 w-4 text-blue-600"/>Datos del cliente</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><p className="rounded-lg bg-slate-50 p-3 text-sm"><span className="block text-xs text-slate-500">Razón social</span>{client.razonSocial}</p><p className="rounded-lg bg-slate-50 p-3 text-sm"><span className="block text-xs text-slate-500">RUC</span>{client.ruc}</p></div></section>
  </div>;
};
