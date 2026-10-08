export type UserRole = 'CONTRIBUYENTE' | 'CONTADOR_PROFESIONAL' | 'SUPER_ADMIN';
export type DeviceMode = 'desktop' | 'mobile';

export interface TaxpayerProfile {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  regimen: string;
  actividadEconomica: string;
  direccion: string;
  email: string;
  telefono: string;
  obligadoContabilidad: boolean;
  agenteRetencion: boolean;
  signatureConfigured: boolean;
  signatureExpiryDays: number;
  signatureCertIssuer: string;
  signatureCertExpiryDate: string;
  sriAccountConfigured: boolean;
  sriUsername: string;
  obligaciones: string[];
  storageUsed: number;
  storageLimit: number;
}

export interface InvoiceItem {
  id: string;
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxPercent: number; // 15% IVA standard in Ecuador
  taxAmount: number;
  total: number;
}

export type DocumentType = 'FACTURA' | 'NOTA_CREDITO' | 'NOTA_DEBITO' | 'RETENCION' | 'GUIA_REMISION' | 'LIQUIDACION_COMPRA';
export type SriStatus = 'BORRADOR' | 'PENDIENTE_SRI' | 'APROBADO_ENVIADO' | 'DEVUELTO';

export interface ElectronicInvoice {
  id: string;
  secuencial: string;
  establecimiento: string;
  puntoEmision: string;
  claveAcceso: string;
  numeroAutorizacion: string;
  clientRucName: string;
  clientRuc: string;
  clientEmail: string;
  clientAddress: string;
  date: string;
  horaEmision?: string;
  type: DocumentType;
  subtotal15: number;
  subtotal0: number;
  iva15: number;
  total: number;
  status: SriStatus;
  items: InvoiceItem[];
  formaPago: string;
  observaciones?: string;
}

export interface VaultDocument {
  id: string;
  nombre: string;
  tipo: 'CONTRATO' | 'BALANCE' | 'RUC_PDF' | 'DECLARACION_SRI' | 'FACTURA_COMPRA' | 'COMPROBANTE_RETENCION';
  formato: 'PDF' | 'XML' | 'ZIP';
  tamanoMb: number;
  fechaSubida: string;
  estadoFirma: 'FIRMADO' | 'PENDIENTE_FIRMA' | 'NO_REQUIERE';
  firmadoPor?: string;
  fechaFirma?: string;
  hashFirma?: string;
  descripcion: string;
}

export interface TaxDeadline {
  id: string;
  titulo: string;
  codigoImpuesto: string;
  periodo: string;
  fechaVencimiento: string;
  diasRestantes: number;
  estado: 'URGENTE' | 'PROXIMO' | 'AL_DIA' | 'CUMPLIDO';
  tipoObligacion: 'IVA_SEMESTRAL' | 'IVA_MENSUAL' | 'RENTA' | 'ATS' | 'PATENTES';
  descripcion: string;
}

export interface MarketplaceOffer {
  id: string;
  accountantId: string;
  accountantName: string;
  accountantTitle: string;
  accountantRating: number;
  reviewsCount: number;
  tarifaUsd: number;
  tiempoEstimado: string;
  mensaje: string;
  fechaOferta: string;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
}

export interface MarketplaceRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientRuc: string;
  title: string;
  description: string;
  categoria: 'DECLARACION_IVA' | 'IMPUESTO_RENTA' | 'AUDITORIA' | 'CONTABILIDAD_MENSUAL' | 'DEVOLUCION_IVA';
  budgetRange: string;
  urgencia: 'ALTA' | 'MEDIA' | 'NORMAL';
  fechaPublicacion: string;
  status: 'ABIERTA' | 'OFERTADA' | 'EN_PROCESO' | 'FINALIZADA';
  offersCount: number;
  offers: MarketplaceOffer[];
}

export interface ChatMessage {
  id: string;
  senderRole: 'CLIENTE' | 'CONTADOR' | 'SISTEMA';
  senderName: string;
  timestamp: string;
  text: string;
  attachmentName?: string;
}

export interface ClientPortfolioItem {
  id: string;
  ruc: string;
  razonSocial: string;
  regimen: string;
  novenoDigito: number;
  proximaObligacion: string;
  fechaVencimiento: string;
  diasRestantes: number;
  estadoAlerta: 'CRITICO' | 'ALERTA' | 'AL_DIA';
  honorariosMensuales: number;
  estadoPago: 'PAGADO' | 'PENDIENTE' | 'VENCIDO';
  facturasMes: number;
}

export interface ClientAuditEvidence {
  id: string;
  clientId: string;
  obligation: 'IVA mensual' | 'Impuesto a la renta' | 'ATS / anexo' | 'Otra obligación';
  period: string;
  fileName: string;
  fileType: 'PDF' | 'XML';
  note: string;
  uploadedAt: string;
  status: 'Entregada · demo';
}

export interface PurchaseInvoiceParsed {
  id: string;
  numero: string;
  proveedor: string;
  rucProveedor: string;
  fecha: string;
  subtotal: number;
  iva: number;
  total: number;
  categoriaSugerida: string;
  items: { descripcion: string; cantidad: number; precio: number }[];
}

export interface InventoryItem {
  id: string;
  codigo: string;
  nombre: string;
  stock: number;
  costoPromedio: number;
  categoria: string;
  facturaOrigen?: string;
  fechaIngreso?: string;
}

export interface AccountPayable {
  id: string;
  proveedor: string;
  monto: number;
  fechaVence: string;
  estado: 'PENDIENTE' | 'PAGADO';
}

export interface ExpenseRecord {
  id: string;
  proveedor: string;
  concepto: string;
  monto: number;
  fecha: string;
  deducible: boolean;
  categoria: string;
}
