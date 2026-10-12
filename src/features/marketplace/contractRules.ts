export type ContractStatus = 'EN_CURSO' | 'ENTREGADO' | 'CAMBIOS_SOLICITADOS' | 'COMPLETADO';
export type ContractEvent = { id: string; at: string; actorId: string; kind: 'CONTRATADO' | 'ENTREGADO' | 'CAMBIOS_SOLICITADOS' | 'COMPLETADO' | 'CALIFICADO' | 'MENSAJE'; note: string };
export type ServiceContract = {
  id: string;
  requestId: string;
  offerId: string;
  clientId: string;
  accountantId: string;
  accountantName: string;
  title: string;
  scope: string;
  priceUsd: number;
  estimatedTime: string;
  status: ContractStatus;
  deliveries: { id: string; version: number; name: string; storageKey: string; note: string; at: string }[];
  messages: { id: string; at: string; authorId: string; text: string }[];
  review: { stars: number; comment: string; at: string } | null;
  events: ContractEvent[];
};

const event = (kind: ContractEvent['kind'], actorId: string, note: string): ContractEvent => ({ id: crypto.randomUUID(), at: new Date().toISOString(), kind, actorId, note });

export function createContract(request: { id: string; clientId: string; title: string }, offer: { id: string; accountantId: string; accountantName: string; tarifaUsd: number; tiempoEstimado: string; mensaje: string }): ServiceContract {
  return {
    id: crypto.randomUUID(), requestId: request.id, offerId: offer.id, clientId: request.clientId,
    accountantId: offer.accountantId, accountantName: offer.accountantName, title: request.title,
    scope: offer.mensaje, priceUsd: offer.tarifaUsd, estimatedTime: offer.tiempoEstimado,
    status: 'EN_CURSO', deliveries: [], messages: [], review: null,
    events: [event('CONTRATADO', request.clientId, `Propuesta ${offer.id} aceptada`)]
  };
}

export function addDelivery(contract: ServiceContract, accountantId: string, file: { name: string; storageKey: string }, note: string): ServiceContract {
  if (accountantId !== contract.accountantId || !['EN_CURSO', 'CAMBIOS_SOLICITADOS'].includes(contract.status)) throw new Error('No puedes entregar este trabajo en su estado actual.');
  return { ...contract, status: 'ENTREGADO', deliveries: [...contract.deliveries, { id: crypto.randomUUID(), version: contract.deliveries.length + 1, name: file.name, storageKey: file.storageKey, note, at: new Date().toISOString() }], events: [...contract.events, event('ENTREGADO', accountantId, note)] };
}

export function requestChanges(contract: ServiceContract, clientId: string, note: string): ServiceContract {
  if (clientId !== contract.clientId || contract.status !== 'ENTREGADO' || !note.trim()) throw new Error('Indica los cambios requeridos para este trabajo.');
  return { ...contract, status: 'CAMBIOS_SOLICITADOS', events: [...contract.events, event('CAMBIOS_SOLICITADOS', clientId, note)] };
}

export function acceptDelivery(contract: ServiceContract, clientId: string): ServiceContract {
  if (clientId !== contract.clientId || contract.status !== 'ENTREGADO') throw new Error('Solo el cliente puede aceptar una entrega pendiente.');
  return { ...contract, status: 'COMPLETADO', events: [...contract.events, event('COMPLETADO', clientId, 'Entrega aceptada')] };
}

export function rateContract(contract: ServiceContract, clientId: string, stars: number, comment = ''): ServiceContract {
  if (clientId !== contract.clientId || contract.status !== 'COMPLETADO' || contract.review || !Number.isInteger(stars) || stars < 1 || stars > 5) throw new Error('La calificación requiere un trabajo completado y solo puede enviarse una vez.');
  return { ...contract, review: { stars, comment: comment.trim(), at: new Date().toISOString() }, events: [...contract.events, event('CALIFICADO', clientId, `${stars} estrellas`)] };
}

export function addContractMessage(contract: ServiceContract, authorId: string, text: string): ServiceContract {
  if (![contract.clientId, contract.accountantId].includes(authorId) || !text.trim()) throw new Error('No puedes enviar mensajes a este trabajo.');
  return { ...contract, messages: [...contract.messages, { id: crypto.randomUUID(), at: new Date().toISOString(), authorId, text: text.trim() }], events: [...contract.events, event('MENSAJE', authorId, 'Mensaje enviado')] };
}

export function getRating(contracts: ServiceContract[], accountantId?: string) {
  const reviews = contracts.filter((item) => (!accountantId || item.accountantId === accountantId) && item.review).map((item) => item.review!.stars);
  return { average: reviews.length ? Math.round(reviews.reduce((sum, stars) => sum + stars, 0) / reviews.length * 10) / 10 : null, count: reviews.length };
}
