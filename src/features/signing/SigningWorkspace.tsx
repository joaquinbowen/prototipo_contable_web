import { WorkspaceModal } from '../../components/common/WorkspaceModal';
import { useApp } from '../../context/AppContext';
import React, { useEffect, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy, type PageViewport } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { loadEvidenceFile, saveEvidenceFile } from '../verification/evidenceFiles';
import { toPdfRect } from './pdfCoordinates';
import { stampDemoPdf } from './pdfStamp';

GlobalWorkerOptions.workerSrc = workerUrl;

type SignedRecord = { id: string; originalName: string; originalKey: string; copyKey: string; page: number; at: string };
const historyKey = 'cont-marjo-signed-pdf-v1';
const stampWidth = 185;
const stampHeight = 62;

export function SigningWorkspace() {
  const { profile } = useApp();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState('');
  const drag = useRef<{ x: number; y: number } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [source, setSource] = useState<File | null>(null);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [viewport, setViewport] = useState<PageViewport | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [signer, setSigner] = useState(profile.razonSocial);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<SignedRecord[]>(() => { try { return JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch { return []; } });

  const chooseFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) { setError('Selecciona un PDF.'); return; }
    if (file.size > 20 * 1024 * 1024) { setError('El PDF no puede superar 20 MB.'); return; }
    try {
      const pdf = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      if (pdf.numPages > 100) { await pdf.cleanup(); throw new Error('El PDF no puede superar 100 páginas.'); }
      await document?.cleanup();
      setReady(false); setOpen(true); setSuccess(''); setSource(file); setDocument(pdf); setPage(1); setZoom(1); setRotation(0); setPosition(null); setError('');
    } catch (cause) { setError(`No se pudo abrir el PDF: ${(cause as Error).message}`); }
  };
  useEffect(() => {
    setReady(false);
    if (!open || !document || !canvas.current) return;
    let cancelled = false;
    let task: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']> | null = null;
    document.getPage(page).then((pdfPage) => {
      if (cancelled || !canvas.current) return;
      const view = pdfPage.getViewport({ scale: zoom, rotation });
      const element = canvas.current;
      element.width = Math.ceil(view.width);
      element.height = Math.ceil(view.height);
      setViewport(view);
      const context = element.getContext('2d');
      if (!context) return;
      task = pdfPage.render({ canvasContext: context, canvas: element, viewport: view });
      task.promise.then(() => { if (!cancelled) setReady(true); }).catch((cause: Error) => { if (!cancelled && cause.name !== 'RenderingCancelledException') setError('No se pudo mostrar esta página.'); });
    }).catch(() => { if (!cancelled) setError('No se pudo abrir esta página.'); });
    return () => { cancelled = true; task?.cancel(); };
  }, [document, page, zoom, rotation, open]);

  const sign = async () => {
    if (!ready || !source || !viewport || !position || !signer.trim()) { setError('Elige la página, coloca la firma y escribe el nombre.'); return; }
    setSaving(true);
    try {
      const originalBytes = await source.arrayBuffer();
      const width = Math.min(stampWidth * zoom, viewport.width);
      const height = Math.min(stampHeight * zoom, viewport.height);
      const rect = toPdfRect(viewport, { x: position.x * (viewport.width - width), y: position.y * (viewport.height - height), width, height });
      const bytes = await stampDemoPdf(originalBytes, page - 1, rect, signer);
      const copyName = source.name.replace(/\.pdf$/i, '') + '-firma-demo.pdf';
      const signedFile = new File([new Uint8Array(bytes)], copyName, { type: 'application/pdf' });
      const id = crypto.randomUUID();
      const originalKey = `signature:original:${id}`;
      const copyKey = `signature:copy:${id}`;
      await saveEvidenceFile(originalKey, source);
      await saveEvidenceFile(copyKey, signedFile);
      const next = [{ id, originalName: source.name, originalKey, copyKey, page, at: new Date().toISOString() }, ...history];
      localStorage.setItem(historyKey, JSON.stringify(next));
      setHistory(next);
      const url = URL.createObjectURL(signedFile);
      const anchor = window.document.createElement('a');
      anchor.href = url; anchor.download = copyName; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setError(''); setOpen(false); setSuccess('Copia creada y descargada. También está disponible en tu historial.');
    } catch (cause) { setError(`No se pudo crear la copia: ${(cause as Error).message}`); }
    finally { setSaving(false); }
  };
  const download = async (record: SignedRecord, original = false) => {
    try { const blob = await loadEvidenceFile(original ? record.originalKey : record.copyKey); if (!blob) throw new Error('Archivo no disponible.'); const url = URL.createObjectURL(blob); const anchor = window.document.createElement('a'); anchor.href = url; anchor.download = original ? record.originalName : record.originalName.replace(/\.pdf$/i, '') + '-firma-demo.pdf'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 30_000); setError(''); } catch (cause) { setError((cause as Error).message); }
  };
  const markWidth = viewport ? Math.min(stampWidth * zoom, viewport.width) : 0;
  const markHeight = viewport ? Math.min(stampHeight * zoom, viewport.height) : 0;
  const place = (clientX: number, clientY: number, offset = { x: markWidth / 2, y: markHeight / 2 }) => {
    if (!ready || !canvas.current || !viewport || saving) return;
    const bounds = canvas.current.getBoundingClientRect();
    setPosition({ x: Math.max(0, Math.min(1, ((clientX - bounds.left) * viewport.width / bounds.width - offset.x) / Math.max(1, viewport.width - markWidth))), y: Math.max(0, Math.min(1, ((clientY - bounds.top) * viewport.height / bounds.height - offset.y) / Math.max(1, viewport.height - markHeight))) });
  };
  return <div className="space-y-5"><header className="rounded-2xl border bg-white p-5"><p className="text-xs font-bold uppercase text-blue-700">Documentos · Demostración</p><h1 className="mt-1 text-2xl font-bold">Firmar un PDF</h1><p className="mt-1 text-sm text-slate-600">Elige una página, haz clic para colocar la firma y arrástrala con el mouse para ajustarla. Descargarás una copia con una firma visible de demostración.</p><p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">Esta marca no usa certificado digital y no tiene validez criptográfica.</p></header>
    <section className="rounded-2xl border bg-white p-5"><label className="block text-sm font-semibold">Seleccionar PDF (máx. 20 MB, 100 páginas)<input type="file" accept="application/pdf,.pdf" onChange={(event) => { void chooseFile(event.target.files?.[0]); event.target.value = ''; }} className="mt-2 block w-full rounded-lg border p-2"/></label>{document && <button onClick={() => setOpen(true)} className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Abrir visor para firmar</button>}</section>
    {open && document && <WorkspaceModal title="Colocar firma en el PDF" wide busy={saving} onClose={() => setOpen(false)}><section className="bg-slate-100 p-4"><div className="mt-4 flex flex-wrap items-end gap-3"><button disabled={page === 1 || saving} onClick={() => { setReady(false); setPage(page - 1); setPosition(null); }} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">← Anterior</button><label className="text-sm">Página <select disabled={saving} aria-label="Página del PDF" value={page} onChange={(event) => { const next = Number(event.target.value); if (next !== page) { setReady(false); setPage(next); setPosition(null); } }} className="rounded-lg border bg-white p-2">{Array.from({ length: document.numPages }, (_, index) => <option key={index + 1}>{index + 1}</option>)}</select> de {document.numPages}</label><button disabled={page === document.numPages || saving} onClick={() => { setReady(false); setPage(page + 1); setPosition(null); }} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Siguiente →</button><label className="text-sm">Zoom<select disabled={saving} value={zoom} onChange={(event) => { setReady(false); setZoom(Number(event.target.value)); }} className="ml-2 rounded-lg border p-2"><option value={0.5}>50 %</option><option value={1}>100 %</option><option value={1.5}>150 %</option><option value={2}>200 %</option></select></label><button disabled={saving} onClick={() => { setReady(false); setPosition(null); setRotation((value) => (value + 90) % 360); }} className="rounded-lg border px-3 py-2 text-sm">Girar vista</button></div><p className="my-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{!ready ? 'Cargando página…' : position ? 'Arrastra la firma con el mouse para ajustar su posición.' : 'Haz clic en la página para colocar tu firma.'}</p><div className="h-[48dvh] overflow-auto rounded-lg bg-slate-200 p-3"><div style={{ width: viewport?.width, height: viewport?.height }} className="relative mx-auto bg-white shadow-lg"><canvas ref={canvas} onClick={(event) => place(event.clientX, event.clientY)} aria-label={`Página ${page} del PDF; haz clic para colocar la firma`} className="block cursor-crosshair"/>{position && ready && <div onPointerDown={(event) => { if (saving || !viewport || !canvas.current) return; event.preventDefault(); const bounds = canvas.current.getBoundingClientRect(); drag.current = { x: (event.clientX - bounds.left) * viewport.width / bounds.width - position.x * (viewport.width - markWidth), y: (event.clientY - bounds.top) * viewport.height / bounds.height - position.y * (viewport.height - markHeight) }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={(event) => { if (drag.current) place(event.clientX, event.clientY, drag.current); }} onPointerUp={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }} className="cursor-move touch-none select-none absolute border border-blue-600 bg-blue-50/90 p-1 text-[10px] text-blue-900" style={{ left: position.x * ((viewport?.width || 0) - markWidth), top: position.y * ((viewport?.height || 0) - markHeight), width: markWidth, height: markHeight }}><strong className="block truncate">{signer || 'Nombre del firmante'}</strong><small>FIRMA SIMULADA · SIN VALIDEZ CRIPTOGRÁFICA</small></div>}</div></div><div className="mt-4 flex flex-wrap items-end gap-3"><label className="text-sm">Firmante de demostración<input maxLength={80} disabled={saving} value={signer} onChange={(event) => setSigner(event.target.value)} className="mt-1 block rounded-lg border p-2"/></label>{position && <button disabled={saving} onClick={() => setPosition(null)} className="rounded-lg border px-3 py-2 text-sm">Quitar marca</button>}<button disabled={!ready || !position || !signer.trim() || saving} onClick={sign} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Creando copia…' : 'Firmar y descargar copia'}</button></div>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</section></WorkspaceModal>}
    {error && !open && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {success && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}
    <section className="rounded-2xl border bg-white p-5"><h2 className="font-bold">Historial de copias</h2><div className="mt-3 space-y-2">{history.length ? history.map((record) => <div key={record.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"><div><strong>{record.originalName}</strong><span className="ml-2 text-slate-500">Página {record.page} · {new Date(record.at).toLocaleString('es-EC')}</span></div><div className="flex gap-2"><button onClick={() => download(record, true)} className="font-semibold text-blue-700 underline">Original</button><button onClick={() => download(record)} className="font-semibold text-blue-700 underline">Copia</button></div></div>) : <p className="text-sm text-slate-500">Todavía no has creado copias firmadas.</p>}</div></section>
  </div>;
}
