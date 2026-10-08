import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MarketplaceRequest, MarketplaceOffer } from '../../types';
import {
  Store,
  Plus,
  Send,
  Star,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Lock,
  Unlock,
  Building2,
  FileText,
  BadgeDollarSign,
  ChevronRight
} from 'lucide-react';

const ContributorMarketplaceView: React.FC = () => {
  const {
    activeRole,
    marketplaceRequests,
    createMarketplaceRequest,
    submitMarketplaceOffer,
    acceptOffer,
    chatMessages,
    sendChatMessage,
    clientPermissions,
    toggleClientPermission
  } = useApp();

  // New Request Form state
  const [showNewReqModal, setShowNewReqModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqCategory, setReqCategory] = useState<MarketplaceRequest['categoria']>('DECLARACION_IVA');
  const [reqBudget, setReqBudget] = useState('$35 - $60 USD');
  const [reqUrgency, setReqUrgency] = useState<MarketplaceRequest['urgencia']>('MEDIA');
  const [reqDesc, setReqDesc] = useState('');

  // Offer Submission Modal state (For Contador role)
  const [activeReqForOffer, setActiveReqForOffer] = useState<MarketplaceRequest | null>(null);
  const [offerTarifa, setOfferTarifa] = useState('45.00');
  const [offerTime, setOfferTime] = useState('24 horas');
  const [offerMsg, setOfferMsg] = useState('Revisión completa de facturas emitidas y recepción de retenciones en formulario oficial.');

  // Chat input
  const [chatInput, setChatInput] = useState('');
  const visibleRequests = marketplaceRequests.filter((request) => activeRole === 'CONTADOR_PROFESIONAL'
    ? request.status === 'ABIERTA' || request.status === 'OFERTADA' || request.status === 'EN_PROCESO'
    : request.clientId === 'CLI-001');
  const activeContract = marketplaceRequests.find((request) => request.status === 'EN_PROCESO');
  const contractedOffer = activeContract?.offers.find((offer) => offer.estado === 'ACEPTADA');

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle || !reqDesc) return;

    createMarketplaceRequest({
      title: reqTitle,
      categoria: reqCategory,
      budgetRange: reqBudget,
      urgencia: reqUrgency,
      description: reqDesc
    });

    setShowNewReqModal(false);
    setReqTitle('');
    setReqDesc('');
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReqForOffer) return;

    submitMarketplaceOffer(activeReqForOffer.id, {
      tarifaUsd: parseFloat(offerTarifa) || 50,
      tiempoEstimado: offerTime,
      mensaje: offerMsg
    });

    setActiveReqForOffer(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-1">
            <Store className="w-4 h-4" />
            <span>{activeRole === 'CONTADOR_PROFESIONAL' ? 'OPORTUNIDADES PROFESIONALES' : 'ASESORÍA CONTABLE'}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {activeRole === 'CONTADOR_PROFESIONAL' ? 'Encargos para tu estudio' : 'Encuentra apoyo contable'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {activeRole === 'CONTADOR_PROFESIONAL'
              ? 'Revisa solicitudes abiertas y envía tus propuestas de servicio.'
              : 'Publica lo que necesitas y compara propuestas de profesionales contables.'}
          </p>
        </div>

        {/* Action Button */}
        <div>
          {activeRole === 'CONTRIBUYENTE' && (
            <button
              onClick={() => setShowNewReqModal(true)}
              className="flex min-h-11 items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publicar solicitud</span>
            </button>
          )}
          {activeRole === 'CONTADOR_PROFESIONAL' && (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 inline-block">
              Modo Contador Activo: Postula tus honorarios en el feed
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Requests & Bid Comparison Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              {activeRole === 'CONTADOR_PROFESIONAL'
                ? 'Feed de Oportunidades Abiertas'
                : 'Mis Requerimientos y Propuestas de Contadores'}
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {visibleRequests.length} {activeRole === 'CONTADOR_PROFESIONAL' ? 'oportunidades' : 'solicitudes propias'}
            </span>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {visibleRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 transition-all shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                        {req.categoria.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {req.id}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                          req.urgencia === 'ALTA'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Urgencia {req.urgencia}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{req.title}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Empresa: <strong>{req.clientName}</strong> · RUC: {req.clientRuc}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">Presupuesto</span>
                    <span className="font-mono font-bold text-sm text-slate-900">{req.budgetRange}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {req.description}
                </p>

                {/* Proposals comparison section */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Propuestas Recibidas ({req.offers.length})</span>
                    {activeRole === 'CONTADOR_PROFESIONAL' && req.status !== 'EN_PROCESO' && (
                      <button
                        onClick={() => setActiveReqForOffer(req)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                      >
                        + Enviar Mi Propuesta
                      </button>
                    )}
                  </div>

                  {req.offers.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">
                      Esperando propuestas de profesionales contables...
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {req.offers.map((offer) => (
                        <div
                          key={offer.id}
                          className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            offer.estado === 'ACEPTADA'
                              ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{offer.accountantName}</span>
                              <span className="flex items-center text-amber-500 font-semibold text-[11px]">
                                <Star className="w-3 h-3 fill-amber-400 mr-0.5" /> {offer.accountantRating}
                              </span>
                              <span className="text-[10px] text-slate-400">({offer.reviewsCount} opiniones)</span>
                            </div>
                            <p className="text-[11px] text-slate-600">{offer.mensaje}</p>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Entrega estimada: {offer.tiempoEstimado}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Tarifa</span>
                              <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                                ${offer.tarifaUsd.toFixed(2)} USD
                              </span>
                            </div>

                            {activeRole === 'CONTRIBUYENTE' && offer.estado === 'PENDIENTE' && (
                              <button
                                onClick={() => acceptOffer(req.id, offer.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                              >
                                [Aceptar Propuesta]
                              </button>
                            )}

                            {offer.estado === 'ACEPTADA' && (
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Contratado
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Shared Direct Chat & File Authorization Toggles */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 flex flex-col h-[650px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-xs font-bold text-slate-900">Sala de Chat & Colaboración Directa</h3>
                  <span className="text-[10px] text-slate-600 font-medium flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${activeContract ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {activeContract ? (activeRole === 'CONTADOR_PROFESIONAL' ? activeContract.clientName : contractedOffer?.accountantName) : 'Disponible al aceptar una propuesta'}
                </span>
              </div>
            </div>
          </div>

          {/* Granular Permission Toggles (Security & Compliance) */}
          {activeRole === 'CONTRIBUYENTE' ? <div className="p-3 bg-blue-50/70 border-b border-blue-100 text-xs space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-950 flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                Permisos de Acceso al Documental 2026
              </span>
              <span className="text-[10px] text-blue-700">Control Contribuyente</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <button
                onClick={() => toggleClientPermission('invoices2026')}
                className={`flex items-center justify-between p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  clientPermissions.invoices2026
                    ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-medium'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span>[Acceso Facturas 2026]</span>
                {clientPermissions.invoices2026 ? <Unlock className="w-3.5 h-3.5 text-emerald-700" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              <button
                onClick={() => toggleClientPermission('sriTaxAccess')}
                className={`flex items-center justify-between p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  clientPermissions.sriTaxAccess
                    ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-medium'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span>[Consulta RUC SRI]</span>
                {clientPermissions.sriTaxAccess ? <Unlock className="w-3.5 h-3.5 text-emerald-700" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
          </div> : <div className="p-3 bg-slate-50 border-b text-[11px] text-slate-600">El contribuyente conserva el control de los permisos; aquí se muestran los que haya concedido.</div>}

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 text-xs">
            {!activeContract && <p className="rounded-lg border border-slate-200 bg-white p-4 text-center text-slate-500">El chat se activa cuando el contribuyente acepta una propuesta.</p>}
            {activeContract && chatMessages.map((msg) => {
              const isMe =
                (activeRole === 'CONTRIBUYENTE' && msg.senderRole === 'CLIENTE') ||
                (activeRole === 'CONTADOR_PROFESIONAL' && msg.senderRole === 'CONTADOR');
              const isSys = msg.senderRole === 'SISTEMA';

              if (isSys) {
                return (
                  <div key={msg.id} className="text-center py-1">
                    <span className="text-[10px] text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                    {msg.senderName} · {msg.timestamp}
                  </span>
                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Message Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
            <input
              type="text"
              placeholder="Escriba un mensaje al contador..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={!activeContract}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!activeContract}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* New Request Modal */}
      {showNewReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Publicar Requerimiento en el Marketplace</h3>
            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Título de la Solicitud</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Declaración IVA Semestral RIMPE y Depuración"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Categoría Tributaria</label>
                  <select
                    value={reqCategory}
                    onChange={(e) => setReqCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="DECLARACION_IVA">Declaración de IVA (104)</option>
                    <option value="IMPUESTO_RENTA">Impuesto a la Renta (102/101)</option>
                    <option value="AUDITORIA">Auditoría / Conciliación</option>
                    <option value="DEVOLUCION_IVA">Devolución de IVA Tercera Edad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Presupuesto Estimado</label>
                  <input
                    type="text"
                    value={reqBudget}
                    onChange={(e) => setReqBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Descripción Detallada</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explique el estado de sus facturas, obligaciones pendientes y fecha límite de entrega..."
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewReqModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Publicar en la Red
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Submission Modal (Accountant Side) */}
      {activeReqForOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Enviar Cotización a {activeReqForOffer.clientName}
            </h3>
            <p className="text-xs text-slate-500">Solicitud: {activeReqForOffer.title}</p>

            <form onSubmit={handleSendOffer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tarifa Propuesta (USD)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={offerTarifa}
                    onChange={(e) => setOfferTarifa(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tiempo de Entrega</label>
                  <input
                    type="text"
                    required
                    value={offerTime}
                    onChange={(e) => setOfferTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mensaje Explicativo</label>
                <textarea
                  rows={3}
                  required
                  value={offerMsg}
                  onChange={(e) => setOfferMsg(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveReqForOffer(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Enviar Oferta Formal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AccountantMarketplaceView: React.FC = () => {
  const { activeTab, setActiveTab, marketplaceRequests, submitMarketplaceOffer, accountantClients, setImpersonatedClientId } = useApp();
  const view = activeTab === 'accountant_proposals' ? 'proposals' : activeTab === 'accountant_clients' ? 'clients' : 'opportunities';
  const [selectedRequest, setSelectedRequest] = useState<MarketplaceRequest | null>(null);
  const [price, setPrice] = useState('45');
  const [time, setTime] = useState('24 horas');
  const [message, setMessage] = useState('Prepararé la declaración y adjuntaré la evidencia del trabajo realizado.');
  const ownOffers = marketplaceRequests.flatMap((request) => request.offers.filter((offer) => offer.accountantId === 'ACC-PRO-CURRENT').map((offer) => ({ request, offer })));
  const opportunities = marketplaceRequests.filter((request) => (request.status === 'ABIERTA' || request.status === 'OFERTADA') && !request.offers.some((offer) => offer.accountantId === 'ACC-PRO-CURRENT'));
  const submitOffer = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedRequest) return;
    submitMarketplaceOffer(selectedRequest.id, { tarifaUsd: Number(price) || 45, tiempoEstimado: time, mensaje: message });
    setSelectedRequest(null);
    setActiveTab('accountant_proposals');
  };
  const nav = [{ id: 'marketplace', label: 'Oportunidades' }, { id: 'accountant_proposals', label: `Mis propuestas${ownOffers.length ? ` (${ownOffers.length})` : ''}` }, { id: 'accountant_clients', label: 'Mis clientes' }];

  return <div className="space-y-5">
    <header className="rounded-xl border bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Espacio profesional</p><h1 className="mt-1 text-2xl font-bold">Marketplace para contadores</h1><p className="mt-1 text-sm text-slate-600">Encuentra encargos, sigue tus cotizaciones y entra a los expedientes de tus clientes.</p></header>
    <nav className="flex flex-wrap gap-2">{nav.map((item) => <button key={item.id} onClick={() => setActiveTab(item.id)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${view === (item.id === 'marketplace' ? 'opportunities' : item.id === 'accountant_proposals' ? 'proposals' : 'clients') ? 'bg-blue-600 text-white' : 'border bg-white text-slate-700'}`}>{item.label}</button>)}</nav>

    {view === 'opportunities' && <section className="space-y-3"><div><h2 className="font-bold">Encargos abiertos</h2><p className="text-xs text-slate-500">Presenta tu propia cotización. Las propuestas de otros contadores no se muestran en esta vista.</p></div>{opportunities.length === 0 ? <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">No hay oportunidades abiertas por ahora.</div> : opportunities.map((request) => <article key={request.id} className="rounded-xl border bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">{request.categoria.replaceAll('_',' ')}</span><h3 className="mt-2 text-lg font-bold">{request.title}</h3><p className="mt-1 text-xs text-slate-500">Cliente: {request.clientName} · {request.clientRuc}</p></div><div className="text-right"><strong className="block">{request.budgetRange}</strong><span className="text-xs text-slate-500">{request.urgencia === 'ALTA' ? 'Prioridad alta' : `Publicado ${request.fechaPublicacion}`}</span></div></div><p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{request.description}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-slate-500">{request.offersCount} profesional(es) han cotizado</span><button onClick={() => setSelectedRequest(request)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Enviar mi propuesta</button></div></article>)}</section>}

    {view === 'proposals' && <section className="space-y-3"><div><h2 className="font-bold">Propuestas que enviaste</h2><p className="text-xs text-slate-500">Aquí aparecen tus cotizaciones, su estado y el cliente solicitante.</p></div>{ownOffers.length === 0 ? <div className="rounded-xl border bg-white p-8 text-center"><p className="font-semibold">Todavía no has enviado propuestas</p><p className="mt-1 text-sm text-slate-500">Ve a Oportunidades y envía una cotización para verla aquí.</p><button onClick={() => setActiveTab('marketplace')} className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Ver oportunidades</button></div> : ownOffers.map(({request, offer}) => <article key={offer.id} className="rounded-xl border bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="text-xs font-semibold uppercase text-blue-700">{request.clientName}</span><h3 className="mt-1 font-bold">{request.title}</h3><p className="mt-1 text-sm text-slate-600">{offer.mensaje}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${offer.estado === 'ACEPTADA' ? 'bg-emerald-50 text-emerald-700' : offer.estado === 'RECHAZADA' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'}`}>{offer.estado === 'PENDIENTE' ? 'Pendiente de respuesta' : offer.estado}</span></div><div className="mt-4 flex flex-wrap gap-4 border-t pt-3 text-sm"><span>Tarifa: <strong>${offer.tarifaUsd.toFixed(2)} USD</strong></span><span>Entrega: <strong>{offer.tiempoEstimado}</strong></span><span>Solicitud: <strong>{request.id}</strong></span></div></article>)}</section>}

    {view === 'clients' && <section className="space-y-3"><div><h2 className="font-bold">Cartera de clientes</h2><p className="text-xs text-slate-500">Abre un expediente para revisar obligaciones y registrar evidencia entregada.</p></div>{accountantClients.map((client) => <article key={client.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4"><div><strong className="block">{client.razonSocial}</strong><span className="text-xs text-slate-500">RUC {client.ruc} · {client.regimen}</span><p className="mt-1 text-xs text-slate-600">Próxima obligación: {client.proximaObligacion} · vence {client.fechaVencimiento}</p></div><button onClick={() => {setImpersonatedClientId(client.id);setActiveTab('client_workspace');}} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Abrir expediente</button></article>)}</section>}

    {selectedRequest && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"><form onSubmit={submitOffer} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl"><div><h2 className="text-lg font-bold">Enviar propuesta</h2><p className="text-sm text-slate-600">{selectedRequest.title} · {selectedRequest.clientName}</p></div><label className="block text-sm font-medium">Honorarios en USD<input required type="number" min="1" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label><label className="block text-sm font-medium">Tiempo estimado<input required value={time} onChange={(event) => setTime(event.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label><label className="block text-sm font-medium">Alcance y entregables<textarea required rows={4} value={message} onChange={(event) => setMessage(event.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setSelectedRequest(null)} className="rounded-lg border px-3 py-2 text-sm">Cancelar</button><button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">Enviar propuesta</button></div></form></div>}
  </div>;
};

export const MarketplaceModule: React.FC = () => {
  const { activeRole } = useApp();
  return activeRole === 'CONTADOR_PROFESIONAL' ? <AccountantMarketplaceView /> : <ContributorMarketplaceView />;
};
