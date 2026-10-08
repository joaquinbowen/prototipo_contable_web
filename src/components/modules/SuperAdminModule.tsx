import { useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowUpRight, Download, Search } from 'lucide-react';
import { adminDaysBetween, adminHoursBetween } from '../../domain/adminDemoData';
import { exportAdminCsv, useAdminAnalytics } from './AdminAnalyticsContext';
import { useApp } from '../../context/AppContext';

const money = (value: number) => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const percentage = (part: number, total: number) => total ? `${Math.round(part / total * 100)}%` : '0%';
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const hours = (value: number) => value >= 24 ? `${(value / 24).toFixed(1)} días` : `${value.toFixed(1)} h`;
const sum = (items: { amount: number }[]) => items.reduce((total, item) => total + item.amount, 0);
const panel = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';

function AdminShell({ title, subtitle, file, rows, children }: { title: string; subtitle: string; file: string; rows: Record<string, string | number | boolean | null | undefined>[]; children: ReactNode }) {
  const { period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo } = useAdminAnalytics();
  return <div className="space-y-4">
    <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-blue-200 bg-white px-5 py-4 shadow-sm">
      <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">Superadmin · datos simulados</p><h1 className="mt-1 text-xl font-bold text-slate-950">{title}</h1><p className="mt-1 text-xs text-slate-600">{subtitle}</p></div>
      <div className="flex flex-wrap items-end gap-2"><label className="grid gap-1 text-[11px] font-semibold text-slate-600">Período<select aria-label="Período global del superadmin" value={period} onChange={(event) => setPeriod(event.target.value as typeof period)} className="min-h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-900"><option value="today">Hoy</option><option value="7d">Últimos 7 días</option><option value="month">Mes actual</option><option value="quarter">Último trimestre</option><option value="custom">Personalizado</option></select></label>{period === 'custom' && <><label className="grid gap-1 text-[11px] font-semibold text-slate-600">Desde<input type="date" value={customFrom} max={customTo} onChange={(event) => setCustomFrom(event.target.value)} className="min-h-9 rounded-lg border border-slate-300 px-2 text-xs" /></label><label className="grid gap-1 text-[11px] font-semibold text-slate-600">Hasta<input type="date" value={customTo} min={customFrom} onChange={(event) => setCustomTo(event.target.value)} className="min-h-9 rounded-lg border border-slate-300 px-2 text-xs" /></label></>}<button type="button" onClick={() => exportAdminCsv(file, rows)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-blue-900 px-3 text-xs font-semibold text-white hover:bg-blue-800"><Download className="h-3.5 w-3.5" />Exportar CSV</button></div>
    </header>
    {children}
  </div>;
}

function Line({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-2.5 last:border-b-0"><span className="text-sm text-slate-700">{label}{hint && <small className="ml-1 text-[11px] text-slate-400">{hint}</small>}</span><strong className="text-sm text-blue-950">{value}</strong></div>;
}

function BarRow({ label, count, total }: { label: string; count: number; total: number }) {
  return <div className="space-y-1.5 py-1"><div className="flex justify-between text-xs"><span className="text-slate-700">{label}</span><strong className="text-blue-900">{count} · {percentage(count, total)}</strong></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-teal-500" style={{ width: percentage(count, total) }}/></div></div>;
}

function AlertBanner({ children, action, onAction }: { children: ReactNode; action?: string; onAction?: () => void }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"><span className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{children}</span></span>{action && <button type="button" onClick={onAction} className="rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-100">{action} →</button>}</div>;
}

export function SuperAdminModule() {
  const { data, inPeriod, to } = useAdminAnalytics();
  const { setActiveTab } = useApp();
  const billed = sum(data.billing.filter((item) => inPeriod(item.at)));
  const paid = data.requests.filter((item) => item.paid > 0 && item.acceptedAt && inPeriod(item.acceptedAt));
  const gmv = paid.reduce((total, item) => total + item.paid, 0);
  const commissions = paid.reduce((total, item) => total + item.commission, 0);
  const refunds = sum(data.refunds.filter((item) => inPeriod(item.at)));
  const costs = sum(data.costs.filter((item) => inPeriod(item.at)));
  const net = billed + commissions - refunds - costs;
  const mrr = data.users.filter((user) => user.role === 'contribuyente' && user.plan && user.createdAt.slice(0, 10) <= to && (!user.cancelledAt || user.cancelledAt.slice(0, 10) > to)).reduce((total, user) => total + (user.plan ?? 0), 0);
  const recentSessions = data.sessions.filter((item) => adminDaysBetween(item.at, `${to}T23:59:59`) >= 0 && adminDaysBetween(item.at, `${to}T23:59:59`) < 30);
  const dailySessions = recentSessions.filter((item) => item.at.slice(0, 10) === to);
  const mau = new Set(recentSessions.map((item) => item.userId));
  const dau = new Set(dailySessions.map((item) => item.userId));
  const byRole = (ids: Set<string>, role: 'contribuyente' | 'contador') => data.users.filter((user) => ids.has(user.id) && user.role === role).length;
  const overdue = data.requests.filter((item) => inPeriod(item.at) && (!item.firstOfferAt || item.firstOfferAt.slice(0, 10) > to) && adminHoursBetween(item.at, `${to}T23:59:59`) > 24);
  const docs = data.documents.filter((item) => inPeriod(item.at));
  const errorRate = docs.length ? docs.filter((item) => item.failed).length / docs.length * 100 : 0;
  const rows = [{ mrr, arr: mrr * 12, subscriptionRevenue: billed, gmv, commissions, takeRatePercent: gmv ? commissions / gmv * 100 : 0, refunds, directCosts: costs, netRevenue: net, dau: dau.size, mau: mau.size, mauTaxpayers: byRole(mau, 'contribuyente'), mauAccountants: byRole(mau, 'contador') }];
  return <AdminShell title="Panorama del negocio" subtitle="Ingresos, transacciones y uso activo de la muestra." file="superadmin-panorama" rows={rows}>
    {overdue.length > 0 && <AlertBanner action="Ver marketplace" onAction={() => setActiveTab('admin_marketplace')}><strong>{overdue.length} solicitudes</strong> llevan más de 24 horas sin propuesta.</AlertBanner>}
    {errorRate > 3 && <AlertBanner action="Ver auditoría" onAction={() => setActiveTab('admin_activity')}><strong>Error de emisión: {errorRate.toFixed(1)}%.</strong> Supera el umbral del 3% del período.</AlertBanner>}
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]"><article className={`${panel} border-blue-200`}><p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Ingreso neto del período</p><strong className="mt-2 block text-4xl font-bold tracking-tight text-blue-950">{money(net)}</strong><p className="mt-1 text-xs text-slate-500">Suscripciones + comisiones − reembolsos − costos directos</p><div className="mt-4 grid gap-x-5 sm:grid-cols-2"><Line label="Suscripciones" value={money(billed)}/><Line label="Comisiones" value={money(commissions)}/><Line label="Reembolsos" value={money(refunds)}/><Line label="Costos directos" value={money(costs)}/></div></article><article className={panel}><h2 className="font-bold text-slate-900">Ingresos recurrentes y marketplace</h2><div className="mt-2"><Line label="MRR" value={money(mrr)} hint="corte al fin del período"/><Line label="ARR" value={money(mrr * 12)} hint="MRR × 12"/><Line label="GMV" value={money(gmv)} hint="servicios cobrados"/><Line label="Take rate real" value={percentage(commissions, gmv)} hint="comisión / GMV"/></div></article></section>
    <section className={panel}><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="font-bold text-slate-900">Usuarios activos</h2><p className="text-xs text-slate-500">DAU: día final del período · MAU: 30 días hasta ese día</p></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-blue-50 px-4 py-3"><span className="text-xs text-blue-700">DAU · {to}</span><strong className="mt-1 block text-2xl text-blue-950">{dau.size}</strong><span className="text-xs text-slate-600">{byRole(dau, 'contribuyente')} contribuyentes · {byRole(dau, 'contador')} contadores</span></div><div className="rounded-xl bg-teal-50 px-4 py-3"><span className="text-xs text-teal-800">MAU</span><strong className="mt-1 block text-2xl text-blue-950">{mau.size}</strong><span className="text-xs text-slate-600">{byRole(mau, 'contribuyente')} contribuyentes · {byRole(mau, 'contador')} contadores</span></div></div></section>
  </AdminShell>;
}

export function AdminMarketplaceModule() {
  const { data, inPeriod, from, to } = useAdminAnalytics();
  const requests = data.requests.filter((item) => inPeriod(item.at));
  const accepted = requests.filter((item) => item.acceptedAt && item.acceptedAt.slice(0, 10) <= to);
  const responseTimes = requests.filter((item) => item.firstOfferAt && item.firstOfferAt.slice(0, 10) <= to).map((item) => adminHoursBetween(item.at, item.firstOfferAt!));
  const awardTimes = accepted.map((item) => adminHoursBetween(item.at, item.acceptedAt!));
  const sessionIds = new Set(data.sessions.filter((item) => inPeriod(item.at)).map((item) => item.userId));
  const taxpayers = data.users.filter((item) => item.role === 'contribuyente' && sessionIds.has(item.id)).length;
  const accountants = data.users.filter((item) => item.role === 'contador' && sessionIds.has(item.id)).length;
  const categories = [...new Set(data.requests.map((item) => item.category))];
  const returning = new Set(accepted.filter((item) => data.requests.some((previous) => previous.taxpayerId === item.taxpayerId && previous.acceptedAt && previous.acceptedAt < item.acceptedAt! && adminDaysBetween(previous.acceptedAt, item.acceptedAt!) <= 180)).map((item) => item.taxpayerId));
  const clients = new Set(accepted.map((item) => item.taxpayerId));
  const overdue = requests.filter((item) => (!item.firstOfferAt || item.firstOfferAt.slice(0, 10) > to) && adminHoursBetween(item.at, `${to}T23:59:59`) > 24);
  const listedRequests = [...requests].sort((left, right) => Number(overdue.includes(right)) - Number(overdue.includes(left)) || right.at.localeCompare(left.at));
  const rows = requests.map((item) => ({ requestId: item.id, category: item.category, publishedAt: item.at, firstOfferAt: item.firstOfferAt && item.firstOfferAt.slice(0, 10) <= to ? item.firstOfferAt : '', acceptedAt: item.acceptedAt && item.acceptedAt.slice(0, 10) <= to ? item.acceptedAt : '', quotedUsd: item.quoted, paidUsd: item.acceptedAt && item.acceptedAt.slice(0, 10) <= to ? item.paid : 0, commissionUsd: item.acceptedAt && item.acceptedAt.slice(0, 10) <= to ? item.commission : 0 }));
  return <AdminShell title="Salud del marketplace" subtitle="Liquidez entre requerimientos y profesionales de la demo." file="superadmin-marketplace" rows={rows}>
    {overdue.length > 0 && <AlertBanner action="Ver solicitudes" onAction={() => document.getElementById('admin-solicitudes')?.scrollIntoView({ behavior: 'smooth' })}><strong>{overdue.length} solicitudes</strong> llevan más de 24 horas sin propuesta. Revisar cobertura en oportunidades.</AlertBanner>}
    <section className="grid gap-4 lg:grid-cols-2"><article className={panel}><h2 className="font-bold">Cobertura y tiempos</h2><Line label="Fill rate" value={percentage(accepted.length, requests.length)} hint={`${accepted.length} aceptadas / ${requests.length} publicadas`}/><Line label="Primera propuesta" value={hours(average(responseTimes))} hint="promedio"/><Line label="Adjudicación" value={hours(average(awardTimes))} hint="promedio"/><Line label="Clientes por contador activo" value={accountants ? `${(taxpayers / accountants).toFixed(1)} : 1` : 'Sin base'} hint={`${taxpayers} / ${accountants}`}/><Line label="Recurrencia a 6 meses" value={percentage(returning.size, clients.size)} hint="clientes que vuelven a contratar"/></article><article className={panel}><h2 className="font-bold">Demanda por servicio</h2><p className="mb-3 text-xs text-slate-500">Solicitudes entre {from} y {to}</p>{categories.map((category) => <BarRow key={category} label={category} count={requests.filter((item) => item.category === category).length} total={requests.length}/>)}</article></section>
    <section id="admin-solicitudes" className={panel}><h2 className="font-bold">Solicitudes {overdue.length ? 'que requieren atención' : 'recientes'}</h2><div className="mt-2 divide-y divide-slate-100">{listedRequests.slice(0, 8).map((item) => <div key={item.id} className="flex flex-wrap justify-between gap-2 py-2.5 text-xs"><span className="font-semibold text-blue-900">{item.id} · {item.category}</span><span className={overdue.includes(item) ? 'font-semibold text-amber-800' : 'text-slate-600'}>{overdue.includes(item) ? 'Más de 24 h sin propuesta' : item.firstOfferAt && item.firstOfferAt.slice(0, 10) <= to ? item.acceptedAt && item.acceptedAt.slice(0, 10) <= to ? 'Adjudicada' : 'Con propuesta' : 'Sin propuesta'} · {item.at.slice(0, 10)}</span></div>)}</div></section>
  </AdminShell>;
}

export function AdminTaxpayersModule() {
  const { data, inPeriod, to } = useAdminAnalytics();
  const [search, setSearch] = useState('');
  const users = data.users.filter((item) => item.role === 'contribuyente' && item.createdAt.slice(0, 10) <= to);
  const docs = data.documents.filter((item) => inPeriod(item.at));
  const inactive = users.filter((item) => { const lastSession = data.sessions.filter((session) => session.userId === item.id && session.at.slice(0, 10) <= to).sort((a, b) => b.at.localeCompare(a.at))[0]; return (item.cancelledAt && item.cancelledAt.slice(0, 10) <= to) || !lastSession || adminDaysBetween(lastSession.at, `${to}T23:59:59`) > 60; });
  const regimes = [...new Set(users.map((item) => item.regimen!))];
  const docTypes = [...new Set(data.documents.map((item) => item.type))];
  const rows = users.map((item) => ({ id: item.id, name: item.name, regimen: item.regimen, planUsdMonthly: item.plan, lastActiveAt: item.lastActiveAt, cancelledAt: item.cancelledAt, documentsInPeriod: docs.filter((doc) => doc.taxpayerId === item.id).length }));
  return <AdminShell title="Contribuyentes" subtitle="Adopción del software y retención de la muestra." file="superadmin-contribuyentes" rows={rows}>
    <section className="grid gap-4 lg:grid-cols-2"><article className={panel}><h2 className="font-bold">Uso del sistema</h2><Line label="Documentos emitidos" value={docs.length} hint="en el período"/>{docTypes.map((type) => <Line key={type} label={type} value={docs.filter((item) => item.type === type).length}/>)}</article><article className={panel}><h2 className="font-bold">Retención y régimen</h2><Line label="Cancelación / inactividad 60 días" value={percentage(inactive.length, users.length)} hint={`${inactive.length} de ${users.length} perfiles`}/><div className="mt-3 space-y-2">{regimes.map((regimen) => <BarRow key={regimen} label={regimen} count={users.filter((item) => item.regimen === regimen).length} total={users.length}/>)}</div></article></section>
    <section className={panel}><div className="flex flex-wrap justify-between gap-3"><h2 className="font-bold">Directorio</h2><label className="flex items-center gap-2 rounded-lg border px-2"><Search className="h-4 w-4 text-slate-400"/><input aria-label="Buscar contribuyente" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar contribuyente" className="min-h-9 text-xs outline-none"/></label></div><div className="mt-2 divide-y divide-slate-100">{users.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())).map((item) => <div key={item.id} className="flex flex-wrap justify-between gap-2 py-2.5 text-xs"><span><strong>{item.name}</strong><span className="ml-2 text-slate-500">{item.regimen}</span></span><span className="text-slate-600">{docs.filter((doc) => doc.taxpayerId === item.id).length} documentos</span></div>)}</div></section>
  </AdminShell>;
}

export function AdminAccountantsModule() {
  const { data, inPeriod } = useAdminAnalytics();
  const accountants = data.users.filter((item) => item.role === 'contador');
  const requests = data.requests.filter((item) => inPeriod(item.at));
  const offers = requests.flatMap((item) => item.offers.filter((offer) => inPeriod(offer.at)).map((offer) => ({ ...offer, accepted: offer.accepted && Boolean(item.acceptedAt && inPeriod(item.acceptedAt)), requestId: item.id })));
  const paid = data.requests.filter((item) => item.paid > 0 && item.acceptedAt && inPeriod(item.acceptedAt));
  const rated = paid.filter((item) => item.rating !== undefined);
  const rows = accountants.map((item) => { const own = offers.filter((offer) => offer.accountantId === item.id); return { accountant: item.name, proposalsSent: own.length, proposalsAccepted: own.filter((offer) => offer.accepted).length, conversionPercent: own.length ? Math.round(own.filter((offer) => offer.accepted).length / own.length * 100) : 0, quotedUsd: own.reduce((total, offer) => total + offer.amount, 0), paidUsd: paid.filter((request) => request.accountantId === item.id).reduce((total, request) => total + request.paid, 0), disputes: paid.filter((request) => request.accountantId === item.id && request.disputed).length } });
  return <AdminShell title="Contadores" subtitle="Conversión, valor de servicios y calidad profesional." file="superadmin-contadores" rows={rows}>
    <section className="grid gap-4 lg:grid-cols-2"><article className={panel}><h2 className="font-bold">Rendimiento</h2><Line label="Conversión de propuestas" value={percentage(offers.filter((item) => item.accepted).length, offers.length)} hint="aceptadas / enviadas"/><Line label="Ticket medio cotizado" value={money(average(offers.map((item) => item.amount)))}/><Line label="Ticket medio cobrado" value={money(average(paid.map((item) => item.paid)))}/></article><article className={panel}><h2 className="font-bold">Calidad del servicio</h2><Line label="Contratos con disputa" value={percentage(paid.filter((item) => item.disputed).length, paid.length)} hint="sobre servicios cobrados"/><Line label="Rating medio" value={rated.length ? `${average(rated.map((item) => item.rating!)).toFixed(1)} / 5` : 'Sin calificaciones'} hint={`${rated.length} reseñas`}/><p className="mt-3 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">Las calificaciones y disputas son registros simulados de contratos de la muestra.</p></article></section>
    <section className={panel}><h2 className="font-bold">Conversión por contador</h2><div className="mt-2 divide-y divide-slate-100">{rows.map((item) => <div key={item.accountant} className="grid gap-1 py-2.5 text-xs sm:grid-cols-[1fr_auto_auto]"><strong className="text-slate-800">{item.accountant}</strong><span className="text-slate-600">{item.proposalsAccepted} / {item.proposalsSent} propuestas</span><span className="font-semibold text-blue-900 sm:w-16 sm:text-right">{item.conversionPercent}%</span></div>)}</div></section>
  </AdminShell>;
}

export function AdminActivityModule() {
  const { data, inPeriod, to } = useAdminAnalytics();
  const docs = data.documents.filter((item) => inPeriod(item.at));
  const failed = docs.filter((item) => item.failed);
  const events = data.security.filter((item) => inPeriod(item.at));
  const stored = data.storage.filter((item) => item.at.slice(0, 10) <= to).reduce((total, item) => total + item.bytes, 0) / 1_000_000_000;
  const newStored = data.storage.filter((item) => inPeriod(item.at)).reduce((total, item) => total + item.bytes, 0) / 1_000_000_000;
  const errorRate = docs.length ? failed.length / docs.length * 100 : 0;
  const rows = [...docs.map((item) => ({ type: 'emisión', id: item.id, date: item.at, detail: item.failed ? 'Intento fallido' : 'Emitido', severity: item.failed ? 'media' : '' })), ...events.map((item) => ({ type: 'seguridad', id: item.id, date: item.at, detail: item.kind, severity: item.severity }))];
  return <AdminShell title="Actividad y auditoría" subtitle="Emisión, alertas de seguridad y consumo de adjuntos." file="superadmin-actividad" rows={rows}>
    {errorRate > 3 && <AlertBanner action="Ver intentos" onAction={() => document.getElementById('admin-emisiones')?.scrollIntoView({ behavior: 'smooth' })}><strong>Tasa de error en emisión: {errorRate.toFixed(1)}%.</strong> Supera el umbral del 3% en el período seleccionado.</AlertBanner>}
    {events.some((item) => item.severity === 'alta') && <AlertBanner action="Ver registro" onAction={() => document.getElementById('admin-alertas')?.scrollIntoView({ behavior: 'smooth' })}><strong>Alerta de seguridad alta:</strong> revisar los inicios de sesión sospechosos.</AlertBanner>}
    <section className="grid gap-4 lg:grid-cols-2"><article className={panel}><h2 className="font-bold">Operación técnica</h2><Line label="Error en emisión" value={`${errorRate.toFixed(1)}%`} hint={`${failed.length} fallidos / ${docs.length} intentos`}/><Line label="Alertas de seguridad" value={events.length}/><Line label="Almacenamiento total" value={`${stored.toFixed(2)} GB`} hint="al final del período"/><Line label="Nuevo almacenamiento" value={`${newStored.toFixed(2)} GB`} hint="en el período"/></article><article id="admin-alertas" className={panel}><h2 className="font-bold">Registro de alertas</h2><div className="mt-2 divide-y divide-slate-100">{events.length ? events.map((item) => <div key={item.id} className="py-2.5 text-xs"><div className="flex justify-between gap-2"><strong className="text-slate-800">{item.kind}</strong><span className={item.severity === 'alta' ? 'font-semibold text-rose-700' : 'text-amber-700'}>{item.severity}</span></div><p className="mt-1 text-slate-600">{item.detail} · {item.at.slice(0, 16).replace('T', ' ')}</p></div>) : <p className="py-3 text-xs text-slate-500">Sin alertas en el período.</p>}</div></article></section>
    <section id="admin-emisiones" className={panel}><h2 className="flex items-center gap-1.5 font-bold">Intentos de emisión recientes <ArrowUpRight className="h-4 w-4 text-blue-600"/></h2><div className="mt-2 divide-y divide-slate-100">{docs.slice(0, 8).map((item) => <div key={item.id} className="flex justify-between gap-3 py-2 text-xs"><span>{item.id} · {item.type}</span><span className={item.failed ? 'font-semibold text-rose-700' : 'text-emerald-700'}>{item.failed ? 'Fallido' : 'Correcto'}</span></div>)}</div></section>
  </AdminShell>;
}
