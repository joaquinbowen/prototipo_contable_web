import React, { createContext, useContext, useState } from 'react';
import {
  UserRole,
  DeviceMode,
  TaxpayerProfile,
  ElectronicInvoice,
  VaultDocument,
  TaxDeadline,
  MarketplaceRequest,
  MarketplaceOffer,
  ChatMessage,
  ClientPortfolioItem,
  ExpenseRecord,
  AccountPayable,
  InventoryItem,
  PurchaseInvoiceParsed,
  DocumentType,
  InvoiceItem,
  ClientAuditEvidence
} from '../types';

export interface ToastAlert {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

interface AppContextType {
  isAuthenticated: boolean;
  authenticateDemo: (role: UserRole, isRegistration: boolean, displayName: string, email: string, professionalLicense?: string) => void;
  signOutDemo: () => void;
  accountantProfile: { displayName: string; email: string; professionalLicense: string };
  updateAccountantProfile: (updated: Partial<{ displayName: string; email: string; professionalLicense: string }>) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activePurchaseSection: 'review' | 'expenses' | 'payables' | 'inventory';
  setActivePurchaseSection: (section: 'review' | 'expenses' | 'payables' | 'inventory') => void;
  startNewDocument: (type: DocumentType) => void;
  selectedDocumentType: DocumentType;
  profileSetupComplete: boolean;
  completeProfileSetup: () => void;
  simulatePurchaseOcr: (fileName?: string) => Promise<PurchaseInvoiceParsed>;
  
  // Taxpayer Profile & Onboarding
  profile: TaxpayerProfile;
  updateProfile: (updated: Partial<TaxpayerProfile>) => void;
  simulateRucOcrUpload: (fileName: string) => Promise<void>;
  isParsingRuc: boolean;
  ocrProgressStep: string;
  
  // Invoicing & SRI
  invoices: ElectronicInvoice[];
  activeRideInvoice: ElectronicInvoice | null;
  setActiveRideInvoice: (inv: ElectronicInvoice | null) => void;
  emitInvoiceWithStepper: (invoiceData: Omit<ElectronicInvoice, 'id' | 'claveAcceso' | 'numeroAutorizacion' | 'status'>) => Promise<ElectronicInvoice>;
  isEmitting: boolean;
  emissionStep: number; // 0: Idle, 1: XML, 2: PFX, 3: SRI, 4: Autorizado
  
  // Vault & Digital Signature
  vaultDocuments: VaultDocument[];
  addVaultDocument: (doc: Omit<VaultDocument, 'id' | 'fechaSubida'>) => void;
  signDocument: (docId: string, password: string) => Promise<{ success: boolean; hash: string }>;
  isSigning: boolean;
  updateCertificate: (issuer: string, expiryDate: string) => void;
  
  // Tax Calendar & Deadlines
  taxDeadlines: TaxDeadline[];
  recalculateDeadlinesForRuc: (ruc: string) => void;
  markDeadlineDone: (id: string) => void;
  
  // Purchase OCR & Sync
  parsedPurchases: PurchaseInvoiceParsed[];
  expenses: ExpenseRecord[];
  payables: AccountPayable[];
  inventory: InventoryItem[];
  processPurchase: (purchaseId: string, actions: { expense: boolean; payable: boolean; inventory: boolean }) => void;
  
  // Marketplace
  marketplaceRequests: MarketplaceRequest[];
  createMarketplaceRequest: (request: Omit<MarketplaceRequest, 'id' | 'clientId' | 'clientName' | 'clientRuc' | 'fechaPublicacion' | 'offersCount' | 'offers' | 'status'>) => void;
  submitMarketplaceOffer: (requestId: string, offer: Omit<MarketplaceOffer, 'id' | 'accountantId' | 'accountantName' | 'accountantTitle' | 'accountantRating' | 'reviewsCount' | 'fechaOferta' | 'estado'>) => void;
  acceptOffer: (requestId: string, offerId: string) => void;
  
  // Shared Chat & Permissions
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, attachmentName?: string) => void;
  clientPermissions: {
    invoices2026: boolean;
    sriTaxAccess: boolean;
    bankStatements: boolean;
  };
  toggleClientPermission: (perm: 'invoices2026' | 'sriTaxAccess' | 'bankStatements') => void;
  
  // Accountant Portfolio (Multi-tenant)
  accountantClients: ClientPortfolioItem[];
  clientAuditEvidence: ClientAuditEvidence[];
  addClientAuditEvidence: (entry: Omit<ClientAuditEvidence, 'id' | 'uploadedAt' | 'status'>) => void;
  impersonatedClientId: string | null;
  setImpersonatedClientId: (id: string | null) => void;
  
  // Notifications / Toast simulator
  toasts: ToastAlert[];
  dismissToast: (id: string) => void;
  triggerSamplePushAlert: (title?: string, message?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Generate valid 49-digit Ecuadorian SRI Clave de Acceso
export function generateSriAccessKey(dateStr: string, ruc: string, secuencial: string, docCode: string = '01'): string {
  const cleanDate = dateStr.replace(/-/g, ''); // yyyymmdd or ddmmyyyy
  const ddmmyyyy = cleanDate.length === 8 ? `${cleanDate.slice(6, 8)}${cleanDate.slice(4, 6)}${cleanDate.slice(0, 4)}` : '06102026';
  const tipoAmbiente = '2'; // 2 = Producción, 1 = Pruebas
  const serie = '001001';
  const secuencialPadded = secuencial.padStart(9, '0');
  const codigoNumerico = '12345678';
  const tipoEmision = '1'; // Normal
  
  const base48 = `${ddmmyyyy}${docCode}${ruc.padStart(13, '0')}${tipoAmbiente}${serie}${secuencialPadded}${codigoNumerico}${tipoEmision}`;
  
  // Módulo 11 check digit calculation
  let sum = 0;
  let factor = 2;
  for (let i = base48.length - 1; i >= 0; i--) {
    sum += parseInt(base48.charAt(i), 10) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const mod = sum % 11;
  let checkDigit = 11 - mod;
  if (checkDigit === 11) checkDigit = 0;
  if (checkDigit === 10) checkDigit = 1;
  
  return `${base48}${checkDigit}`;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('CONTRIBUYENTE');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountantProfile, setAccountantProfile] = useState({ displayName: 'Estudio Contable Demo', email: 'contador@demo.local', professionalLicense: 'Registro de ejemplo' });
  const updateAccountantProfile = (updated: Partial<typeof accountantProfile>) => setAccountantProfile((current) => ({ ...current, ...updated }));
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activePurchaseSection, setActivePurchaseSection] = useState<'review' | 'expenses' | 'payables' | 'inventory'>('review');
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>('FACTURA');
  const [profileSetupComplete, setProfileSetupComplete] = useState(false);

  const authenticateDemo = (role: UserRole, isRegistration: boolean, displayName: string, email: string, professionalLicense = '') => {
    setIsAuthenticated(true);
    setActiveRole(role);
    if (role === 'CONTRIBUYENTE') {
      setProfile((current) => ({ ...current, ...(displayName ? { razonSocial: displayName } : {}), ...(email ? { email } : {}) }));
    } else if (role === 'CONTADOR_PROFESIONAL' && isRegistration) {
      setAccountantProfile((current) => ({ ...current, displayName: displayName || current.displayName, email: email || current.email, professionalLicense: professionalLicense || 'Pendiente de completar' }));
    }
    setActiveTab(isRegistration && role === 'CONTRIBUYENTE' ? 'onboarding' : role === 'CONTADOR_PROFESIONAL' ? 'accountant_dashboard' : 'dashboard');
  };
  const signOutDemo = () => {
    setIsAuthenticated(false);
    setActiveRole('CONTRIBUYENTE');
    setImpersonatedClientId(null);
    setActiveTab('dashboard');
  };

  const changeActiveRole = (role: UserRole) => {
    setActiveRole(role);
    setImpersonatedClientId(null);
    setActiveTab(role === 'SUPER_ADMIN' ? 'admin_console' : role === 'CONTADOR_PROFESIONAL' ? 'accountant_dashboard' : 'dashboard');
  };
  const startNewDocument = (type: DocumentType) => {
    setSelectedDocumentType(type);
    setActiveTab('invoicing');
  };
  const completeProfileSetup = () => {
    setProfileSetupComplete(true);
    triggerSamplePushAlert('Perfil listo', 'Configuración guardada en esta simulación local.');
  };
  
  // Profile state
  const [profile, setProfile] = useState<TaxpayerProfile>({
    ruc: '1792847592001',
    razonSocial: 'EMPRESA DEMO ECUADOR S.A.S.',
    nombreComercial: 'DEMO ECUADOR TECH SOLUTIONS',
    regimen: 'RIMPE - Emprendedor',
    actividadEconomica: 'Servicios profesionales y comerciales de tecnología y asesoría',
    direccion: 'Av. Amazonas N24-196 y Av. República, Edif. Las Cámaras, Quito, Ecuador',
    email: 'facturacion@demotaxecuador.com',
    telefono: '+593 99 823 4512',
    obligadoContabilidad: false,
    agenteRetencion: false,
    signatureConfigured: false,
    signatureExpiryDays: 0,
    signatureCertIssuer: 'Pendiente de configuración',
    signatureCertExpiryDate: '—',
    storageUsed: 0,
    storageLimit: 20,
  });

  const [isParsingRuc, setIsParsingRuc] = useState(false);
  const [ocrProgressStep, setOcrProgressStep] = useState('');

  // Invoicing state
  const [invoices, setInvoices] = useState<ElectronicInvoice[]>([
    {
      id: 'FAC-001-001-000000102',
      secuencial: '000000102',
      establecimiento: '001',
      puntoEmision: '001',
      claveAcceso: '0510202601179284759200120010010000001021234567811',
      numeroAutorizacion: '0510202601179284759200120010010000001021234567811',
      clientRucName: 'COMERCIALIZADORA ECUATECH S.A.',
      clientRuc: '1792345678001',
      clientEmail: 'compras@ecuatech.com.ec',
      clientAddress: 'Av. Shyris y Naciones Unidas, Quito',
      date: '2026-10-05',
      horaEmision: '14:22:10',
      type: 'FACTURA',
      subtotal15: 1000.00,
      subtotal0: 0,
      iva15: 150.00,
      total: 1150.00,
      status: 'AUTORIZADO',
      formaPago: '20 - OTROS CON UTILIZACION DEL SISTEMA FINANCIERO',
      items: [
        { id: 'item-1', code: 'SRV-01', description: 'Consultoría e Implementación de Software Web', quantity: 1, unitPrice: 1000.00, discount: 0, taxPercent: 15, taxAmount: 150.00, total: 1150.00 }
      ]
    },
    {
      id: 'FAC-001-001-000000103',
      secuencial: '000000103',
      establecimiento: '001',
      puntoEmision: '001',
      claveAcceso: '0610202601179284759200120010010000001031234567812',
      numeroAutorizacion: '0610202601179284759200120010010000001031234567812',
      clientRucName: 'AGENCIA DIGITAL GUAYAQUIL CIA. LTDA.',
      clientRuc: '0992384712001',
      clientEmail: 'pagos@agenciagye.ec',
      clientAddress: 'Malecón 2000 y 9 de Octubre, Guayaquil',
      date: '2026-10-06',
      horaEmision: '10:15:33',
      type: 'FACTURA',
      subtotal15: 400.00,
      subtotal0: 0,
      iva15: 60.00,
      total: 460.00,
      status: 'AUTORIZADO',
      formaPago: '01 - SIN UTILIZACION DEL SISTEMA FINANCIERO (EFECTIVO)',
      items: [
        { id: 'item-2', code: 'SRV-02', description: 'Mantenimiento preventivo mensual y soporte en nube', quantity: 1, unitPrice: 400.00, discount: 0, taxPercent: 15, taxAmount: 60.00, total: 460.00 }
      ]
    },
    {
      id: 'RET-001-001-000000045',
      secuencial: '000000045',
      establecimiento: '001',
      puntoEmision: '001',
      claveAcceso: '0110202607179284759200120010010000000451234567818',
      numeroAutorizacion: '0110202607179284759200120010010000000451234567818',
      clientRucName: 'SUMINISTROS PICHINCHA CIA.',
      clientRuc: '1790012345001',
      clientEmail: 'admin@suministrospichincha.com',
      clientAddress: 'Av. 10 de Agosto, Quito',
      date: '2026-10-01',
      horaEmision: '16:45:00',
      type: 'RETENCION',
      subtotal15: 250.00,
      subtotal0: 0,
      iva15: 37.50,
      total: 4.38,
      status: 'AUTORIZADO',
      formaPago: '20 - OTROS CON SISTEMA FINANCIERO',
      items: [
        { id: 'item-3', code: 'RET-303', description: 'Retención Impuesto a la Renta 1.75% por Transferencia de Bienes', quantity: 1, unitPrice: 4.38, discount: 0, taxPercent: 0, taxAmount: 0, total: 4.38 }
      ]
    }
  ]);

  const [activeRideInvoice, setActiveRideInvoice] = useState<ElectronicInvoice | null>(null);
  const [isEmitting, setIsEmitting] = useState(false);
  const [emissionStep, setEmissionStep] = useState(0);

  // Vault Documents
  const [vaultDocuments, setVaultDocuments] = useState<VaultDocument[]>([]);

  const [isSigning, setIsSigning] = useState(false);

  // Tax Deadlines
  const [taxDeadlines, setTaxDeadlines] = useState<TaxDeadline[]>([
    {
      id: 'TAX-001',
      titulo: 'Declaración IVA Semestral (1er Semestre)',
      codigoImpuesto: 'SRI Form 104A',
      periodo: 'Julio 2026 - RIMPE',
      fechaVencimiento: '2026-10-26',
      diasRestantes: 19,
      estado: 'AL_DIA',
      tipoObligacion: 'IVA_SEMESTRAL',
      descripcion: 'Contribuyentes RIMPE Emprendedor con 9no dígito 9 vencen el 26 del mes de declaración.'
    },
    {
      id: 'TAX-002',
      titulo: 'Anexo Transaccional Simplificado (ATS)',
      codigoImpuesto: 'SRI ATS-2026',
      periodo: 'Septiembre 2026',
      fechaVencimiento: '2026-10-26',
      diasRestantes: 19,
      estado: 'AL_DIA',
      tipoObligacion: 'ATS',
      descripcion: 'Reporte mensual de compras, ventas y comprobantes anulados.'
    },
    {
      id: 'TAX-003',
      titulo: 'Retenciones en la Fuente de Impuesto a la Renta',
      codigoImpuesto: 'SRI Form 103',
      periodo: 'Septiembre 2026',
      fechaVencimiento: '2026-10-26',
      diasRestantes: 19,
      estado: 'AL_DIA',
      tipoObligacion: 'IVA_MENSUAL',
      descripcion: 'Liquidación de retenciones practicadas a proveedores durante el periodo.'
    },
    {
      id: 'TAX-004',
      titulo: 'Patente Municipal de Quito - DMQ',
      codigoImpuesto: 'MDMQ-PAT26',
      periodo: 'Ejercicio Fiscal 2026',
      fechaVencimiento: '2026-10-09',
      diasRestantes: 1,
      estado: 'URGENTE',
      tipoObligacion: 'PATENTES',
      descripcion: 'Pago de ejemplo de patente municipal; confirma la fecha real con el municipio.'
    }
  ]);

  // Purchases OCR & Inventory
  const [parsedPurchases, setParsedPurchases] = useState<PurchaseInvoiceParsed[]>([
    {
      id: 'PUR-001',
      numero: '001-002-00049281',
      proveedor: 'CORPOESA S.A. CORPORACION ECUATORIANA',
      rucProveedor: '1791234567001',
      fecha: '2026-10-04',
      subtotal: 391.30,
      iva: 58.70,
      total: 450.00,
      categoriaSugerida: 'Suministros y Equipos de Oficina',
      items: [
        { descripcion: 'Cartuchos Tóner HP LaserJet Pro', cantidad: 2, precio: 95.00 },
        { descripcion: 'Resmas de Papel Bond Report A4 75g', cantidad: 10, precio: 5.50 },
        { descripcion: 'Mobiliario Ergonómico Soporte Monitor', cantidad: 3, precio: 48.77 }
      ]
    }
  ]);

  const [expenses, setExpenses] = useState<ExpenseRecord[]>([
    {
      id: 'EXP-01',
      proveedor: 'CNT E.P. Corporación Nacional de Telecomunicaciones',
      concepto: 'Internet de Fibra Óptica Oficina',
      monto: 65.00,
      fecha: '2026-10-02',
      deducible: true,
      categoria: 'Servicios Básicos'
    },
    {
      id: 'EXP-02',
      proveedor: 'EEQ Empresa Eléctrica Quito',
      concepto: 'Suministro Eléctrico Matriz',
      monto: 42.50,
      fecha: '2026-10-03',
      deducible: true,
      categoria: 'Servicios Básicos'
    }
  ]);

  const [payables, setPayables] = useState<AccountPayable[]>([
    {
      id: 'PAY-01',
      proveedor: 'DATA STORAGE HOSTING ECUADOR',
      monto: 120.00,
      fechaVence: '2026-10-20',
      estado: 'PENDIENTE'
    }
  ]);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [purchaseSequence, setPurchaseSequence] = useState(2);

  // Marketplace state
  const [marketplaceRequests, setMarketplaceRequests] = useState<MarketplaceRequest[]>([
    {
      id: 'REQ-101',
      clientId: 'CLI-001',
      clientName: 'EMPRESA DEMO ECUADOR S.A.S.',
      clientRuc: '1792847592001',
      title: 'Declaración IVA Semestral y Conciliación RIMPE 2026',
      description: 'Requiero revisión de retenciones recibidas y emitidas, depuración de gastos no deducibles y presentación en formulario SRI 104A en línea.',
      categoria: 'DECLARACION_IVA',
      budgetRange: '$40 - $70 USD',
      urgencia: 'MEDIA',
      fechaPublicacion: '2026-10-04',
      status: 'OFERTADA',
      offersCount: 2,
      offers: [
        {
          id: 'OFF-201',
          accountantId: 'ACC-01',
          accountantName: 'CPA. Carlos Andrés Mendoza V.',
          accountantTitle: 'Contador Público Autorizado · Reg. 17-29384',
          accountantRating: 4.9,
          reviewsCount: 48,
          tarifaUsd: 45.00,
          tiempoEstimado: '24 horas',
          mensaje: 'Hola. Cuento con 11 años de experiencia en empresas de servicios y RIMPE. Reviso tus facturas emitidas, retenciones en el portal SRI y te entrego comprobante de recepción oficial.',
          fechaOferta: '2026-10-05 09:30',
          estado: 'PENDIENTE'
        },
        {
          id: 'OFF-202',
          accountantId: 'ACC-02',
          accountantName: 'Estudio Contable & Tributario Gómez & Asoc.',
          accountantTitle: 'Firma de Auditoría y Asesoría Fiscal',
          accountantRating: 4.8,
          reviewsCount: 32,
          tarifaUsd: 60.00,
          tiempoEstimado: '12 horas',
          mensaje: 'Garantizamos revisión integral con conciliación bancaria y validación de comprobantes anulados para evitar glosas del SRI. Entrega prioritaria.',
          fechaOferta: '2026-10-05 11:15',
          estado: 'PENDIENTE'
        }
      ]
    },
    {
      id: 'REQ-102',
      clientId: 'CLI-002',
      clientName: 'IMPORTADORA ANDINA QUITO S.A.',
      clientRuc: '1790098765001',
      title: 'Devolución de IVA Tercera Edad y Crédito Tributario Exportaciones',
      description: 'Necesitamos preparar anexos de soporte y tramitar ante ventanilla electrónica del SRI la solicitud de reintegro por $4,850.',
      categoria: 'DEVOLUCION_IVA',
      budgetRange: '$150 - $250 USD',
      urgencia: 'ALTA',
      fechaPublicacion: '2026-10-06',
      status: 'ABIERTA',
      offersCount: 1,
      offers: [
        {
          id: 'OFF-203',
          accountantId: 'ACC-03',
          accountantName: 'Ing. CPA. Marcela Benalcázar',
          accountantTitle: 'Especialista en Fiscalidad Internacional',
          accountantRating: 5.0,
          reviewsCount: 19,
          tarifaUsd: 180.00,
          tiempoEstimado: '3 días laborables',
          mensaje: 'Manejo el proceso de devolución de IVA habitualmente. Verificamos la validez de los RIDE y evitamos rechazos por facturas caducadas.',
          fechaOferta: '2026-10-06 14:00',
          estado: 'PENDIENTE'
        }
      ]
    }
  ]);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'MSG-01',
      senderRole: 'SISTEMA',
      senderName: 'CONT MARJO 360',
      timestamp: '2026-10-05 09:30',
      text: 'Se ha abierto la sala de comunicación directa con CPA. Carlos Andrés Mendoza para la solicitud "Declaración IVA Semestral".'
    },
    {
      id: 'MSG-02',
      senderRole: 'CONTADOR',
      senderName: 'CPA. Carlos Andrés Mendoza V.',
      timestamp: '2026-10-05 09:35',
      text: 'Buenos días estimado. Gracias por contactarme. Para iniciar con la revisión del IVA de Septiembre, ¿podría compartirme el acceso a las facturas electrónicas emitidas en CONT MARJO?'
    },
    {
      id: 'MSG-03',
      senderRole: 'CLIENTE',
      senderName: 'EMPRESA DEMO ECUADOR S.A.S.',
      timestamp: '2026-10-05 09:42',
      text: '¡Hola Carlos! Acabo de activar el permiso seguro para que puedas auditar el lote de facturas de 2026 desde tu panel.'
    }
  ]);

  const [clientPermissions, setClientPermissions] = useState({
    invoices2026: true,
    sriTaxAccess: false,
    bankStatements: false
  });

  // Accountant Portfolio (Multi-tenant)
  const [accountantClients] = useState<ClientPortfolioItem[]>([
    {
      id: 'CLI-01',
      ruc: '1792847592001',
      razonSocial: 'EMPRESA DEMO ECUADOR S.A.S.',
      regimen: 'RIMPE - Emprendedor',
      novenoDigito: 9,
      proximaObligacion: 'Declaración IVA Semestral',
      fechaVencimiento: '2026-10-26',
      diasRestantes: 20,
      estadoAlerta: 'AL_DIA',
      honorariosMensuales: 80.00,
      estadoPago: 'PAGADO',
      facturasMes: 18
    },
    {
      id: 'CLI-02',
      ruc: '1791823901001',
      razonSocial: 'RESTAURANTE EL CRISTOBAL CIA. LTDA.',
      regimen: 'General',
      novenoDigito: 1,
      proximaObligacion: 'Declaración IVA Mensual Form 104',
      fechaVencimiento: '2026-10-10',
      diasRestantes: 4,
      estadoAlerta: 'CRITICO',
      honorariosMensuales: 150.00,
      estadoPago: 'PENDIENTE',
      facturasMes: 142
    },
    {
      id: 'CLI-03',
      ruc: '0992384712001',
      razonSocial: 'AGENCIA DIGITAL GUAYAQUIL CIA. LTDA.',
      regimen: 'RIMPE - Negocio Popular',
      novenoDigito: 2,
      proximaObligacion: 'Cuota RIMPE Anual 2026',
      fechaVencimiento: '2026-10-12',
      diasRestantes: 6,
      estadoAlerta: 'CRITICO',
      honorariosMensuales: 60.00,
      estadoPago: 'PAGADO',
      facturasMes: 9
    },
    {
      id: 'CLI-04',
      ruc: '1790012345001',
      razonSocial: 'IMPORTADORA ANDINA QUITO S.A.',
      regimen: 'General',
      novenoDigito: 3,
      proximaObligacion: 'Anexo Transaccional ATS',
      fechaVencimiento: '2026-10-14',
      diasRestantes: 8,
      estadoAlerta: 'ALERTA',
      honorariosMensuales: 220.00,
      estadoPago: 'PENDIENTE',
      facturasMes: 84
    },
    {
      id: 'CLI-05',
      ruc: '1718293840001',
      razonSocial: 'JUAN PABLO PÉREZ (SERVICIOS)',
      regimen: 'RIMPE - Emprendedor',
      novenoDigito: 0,
      proximaObligacion: 'Declaración Semestral IVA',
      fechaVencimiento: '2026-10-28',
      diasRestantes: 22,
      estadoAlerta: 'AL_DIA',
      honorariosMensuales: 50.00,
      estadoPago: 'PAGADO',
      facturasMes: 12
    },
    {
      id: 'CLI-06',
      ruc: '1792940291001',
      razonSocial: 'LOGÍSTICA TRANS-ORIENTE EXPRESS',
      regimen: 'General',
      novenoDigito: 4,
      proximaObligacion: 'Retenciones Form 103',
      fechaVencimiento: '2026-10-16',
      diasRestantes: 10,
      estadoAlerta: 'ALERTA',
      honorariosMensuales: 190.00,
      estadoPago: 'VENCIDO',
      facturasMes: 67
    }
  ]);
  const [clientAuditEvidence, setClientAuditEvidence] = useState<ClientAuditEvidence[]>([]);
  const addClientAuditEvidence = (entry: Omit<ClientAuditEvidence, 'id' | 'uploadedAt' | 'status'>) => {
    const now = new Date();
    setClientAuditEvidence((current) => [{ ...entry, id: `EVD-${now.getTime()}`, uploadedAt: now.toLocaleString('es-EC'), status: 'Entregada · demo' }, ...current]);
    triggerSamplePushAlert('Evidencia cargada (demo)', `${entry.obligation} · ${entry.period} quedó adjuntada al expediente del cliente.`);
  };
  const [impersonatedClientId, setImpersonatedClientId] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastAlert[]>([
    {
      id: 't-1',
      type: 'info',
      title: 'Aviso de demostración',
      message: 'El prototipo calcula un IVA de ejemplo; verifica la tarifa y tratamiento tributario aplicables.',
      timestamp: '17:35'
    }
  ]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerSamplePushAlert = (title?: string, message?: string) => {
    const newToast: ToastAlert = {
      id: `toast-${Date.now()}`,
      type: 'warning',
      title: title || 'Alerta SRI: Vencimiento Próximo',
      message: message || `El 9no dígito de su RUC (9) tiene vencimiento tributario el 26 de Octubre. Revise sus retenciones en CONT MARJO.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setToasts((prev) => [newToast, ...prev]);
  };

  // Profile update
  const updateProfile = (updated: Partial<TaxpayerProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  // Module 1: RUC PDF Parser OCR Simulator
  const simulateRucOcrUpload = async (fileName: string) => {
    setIsParsingRuc(true);
    setOcrProgressStep('Cargando documento PDF del RUC...');
    await new Promise((r) => setTimeout(r, 400));
    
    setOcrProgressStep('Analizando firmas electrónicas y códigos QR oficiales del SRI...');
    await new Promise((r) => setTimeout(r, 500));
    
    setOcrProgressStep('Extrayendo RUC 1792847592001, Régimen RIMPE y obligaciones...');
    await new Promise((r) => setTimeout(r, 600));

    // Update taxpayer profile with extracted Ecuador data
    setProfile((previous) => ({
      ...previous,
      ruc: '1792847592001',
      razonSocial: 'EMPRESA DEMO ECUADOR S.A.S.',
      nombreComercial: 'DEMO ECUADOR TECH SOLUTIONS',
      regimen: 'RIMPE - Emprendedor',
      actividadEconomica: 'Servicios profesionales y comerciales de tecnología y consultoría contable',
      direccion: 'Av. Amazonas N24-196 y Av. República, Quito, Pichincha, Ecuador',
      email: previous.email || 'contacto@demotaxecuador.com',
      telefono: previous.telefono || '+593 99 823 4512',
      storageUsed: Math.min(previous.storageLimit, previous.storageUsed + 1)
    }));

    // Add vault document
    const newDoc: VaultDocument = {
      id: `DOC-RUC-${Date.now()}`,
      nombre: fileName || 'RUC_Oficial_Descargado_SRI.pdf',
      tipo: 'RUC_PDF',
      formato: 'PDF',
      tamanoMb: 1.4,
      fechaSubida: new Date().toISOString().slice(0, 10),
      estadoFirma: 'NO_REQUIERE',
      descripcion: 'Ejemplo local cargado para simular la extracción de datos del RUC.'
    };
    setVaultDocuments((prev) => [newDoc, ...prev]);

    setIsParsingRuc(false);
    setOcrProgressStep('');

    triggerSamplePushAlert(
      'Datos RUC extraídos (demo)',
      'Revisa y confirma los campos detectados antes de completar el perfil.'
    );
  };

  // Recalculate deadlines based on 9th digit
  const recalculateDeadlinesForRuc = (ruc: string) => {
    const ninth = ruc.length >= 10 ? parseInt(ruc.charAt(8), 10) : 9;
    // SRI Ecuador 9th digit calendar schedule:
    // 1 -> 10, 2 -> 12, 3 -> 14, 4 -> 16, 5 -> 18, 6 -> 20, 7 -> 22, 8 -> 24, 9 -> 26, 0 -> 28
    const dayMap: Record<number, number> = {
      1: 10, 2: 12, 3: 14, 4: 16, 5: 18, 6: 20, 7: 22, 8: 24, 9: 26, 0: 28
    };
    const dueDay = dayMap[ninth] || 26;
    
    setTaxDeadlines((prev) =>
      prev.map((d) => ({
        ...d,
        fechaVencimiento: `2026-10-${dueDay.toString().padStart(2, '0')}`,
        diasRestantes: Math.max(0, dueDay - 8)
      }))
    );
  };

  const markDeadlineDone = (id: string) => {
    setTaxDeadlines((prev) =>
      prev.map((d) => (d.id === id ? { ...d, estado: 'CUMPLIDO', diasRestantes: 0 } : d))
    );
    triggerSamplePushAlert('Obligación Cumplida', 'Se ha registrado la presentación de la obligación ante el SRI.');
  };

  // Module 4: Invoicing with 4-step stepper
  const emitInvoiceWithStepper = async (
    invoiceData: Omit<ElectronicInvoice, 'id' | 'claveAcceso' | 'numeroAutorizacion' | 'status'>
  ): Promise<ElectronicInvoice> => {
    setIsEmitting(true);
    setEmissionStep(1); // Generando XML

    await new Promise((r) => setTimeout(r, 550));
    setEmissionStep(2); // Firmando PFX

    await new Promise((r) => setTimeout(r, 600));
    setEmissionStep(3); // Enviando SRI

    await new Promise((r) => setTimeout(r, 750));
    setEmissionStep(4); // 🟢 AUTORIZADO

    const nextSecNumber = (invoices.length + 104).toString().padStart(9, '0');
    const documentDetails: Record<DocumentType, { prefix: string; code: string; label: string }> = {
      FACTURA: { prefix: 'FAC', code: '01', label: 'FACTURA' },
      NOTA_CREDITO: { prefix: 'NCR', code: '04', label: 'NOTA DE CRÉDITO' },
      NOTA_DEBITO: { prefix: 'NDB', code: '05', label: 'NOTA DE DÉBITO' },
      RETENCION: { prefix: 'RET', code: '07', label: 'RETENCIÓN' },
      GUIA_REMISION: { prefix: 'GUI', code: '06', label: 'GUÍA DE REMISIÓN' },
      LIQUIDACION_COMPRA: { prefix: 'LIQ', code: '03', label: 'LIQUIDACIÓN DE COMPRA' }
    };
    const details = documentDetails[invoiceData.type];
    const newId = `${details.prefix}-001-001-${nextSecNumber}`;
    const accessKey = generateSriAccessKey(invoiceData.date, profile.ruc, nextSecNumber, details.code);

    const created: ElectronicInvoice = {
      ...invoiceData,
      id: newId,
      secuencial: nextSecNumber,
      establecimiento: '001',
      puntoEmision: '001',
      claveAcceso: accessKey,
      numeroAutorizacion: accessKey,
      status: 'AUTORIZADO',
      horaEmision: new Date().toLocaleTimeString()
    };

    setInvoices((prev) => [created, ...prev]);
    setActiveRideInvoice(created);

    await new Promise((r) => setTimeout(r, 400));
    setIsEmitting(false);
    setEmissionStep(0);

    triggerSamplePushAlert(
      'Comprobante de demostración listo',
      `${details.label} ${created.id} por $${created.total.toFixed(2)}. Vista previa local; no se envió al SRI.`
    );

    return created;
  };

  // Module 3: Digital signature
  const signDocument = async (docId: string, _password: string) => {
    setIsSigning(true);
    await new Promise((r) => setTimeout(r, 1200));

    const mockHash = `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    setVaultDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            estadoFirma: 'FIRMADO',
            firmadoPor: `${profile.razonSocial} (Certificado Validado)`,
            fechaFirma: new Date().toISOString().replace('T', ' ').slice(0, 19),
            hashFirma: mockHash
          };
        }
        return doc;
      })
    );

    setIsSigning(false);
    triggerSamplePushAlert(
      'Firma simulada',
      'La vista previa de firma se actualizó localmente; no se aplicó una firma criptográfica real.'
    );
    return { success: true, hash: mockHash };
  };

  const addVaultDocument = (doc: Omit<VaultDocument, 'id' | 'fechaSubida'>) => {
    if (profile.storageUsed >= profile.storageLimit) {
      triggerSamplePushAlert('Bóveda llena', 'Libera espacio para guardar otro documento en esta demo.');
      return;
    }
    const newDoc: VaultDocument = {
      ...doc,
      id: `DOC-${Date.now()}`,
      fechaSubida: new Date().toISOString().slice(0, 10)
    };
    setVaultDocuments((prev) => [newDoc, ...prev]);
    setProfile((prev) => ({ ...prev, storageUsed: Math.min(prev.storageLimit, prev.storageUsed + 1) }));
    triggerSamplePushAlert('Documento de demostración', `"${doc.nombre}" se añadió a la lista local de la bóveda.`);
  };

  const updateCertificate = (issuer: string, expiryDate: string) => {
    setProfile((prev) => ({
      ...prev,
      signatureConfigured: true,
      signatureCertIssuer: issuer,
      signatureCertExpiryDate: expiryDate,
      signatureExpiryDays: 365
    }));
    triggerSamplePushAlert('Estado de certificado actualizado', 'Se guardó información de ejemplo; el archivo no fue validado ni almacenado.');
  };

  // Module 5: Purchase OCR processing
  const simulatePurchaseOcr = async (fileName?: string) => {
    setPurchaseSequence((previous) => previous + 1);
    const sequence = purchaseSequence;
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const purchase: PurchaseInvoiceParsed = {
      id: `PUR-${String(sequence).padStart(3, '0')}`,
      numero: `001-002-${String(49281 + sequence).padStart(8, '0')}`,
      proveedor: sequence % 2 ? 'CORPOESA S.A. CORPORACION ECUATORIANA' : 'SUMINISTROS QUITO S.A.',
      rucProveedor: sequence % 2 ? '1791234567001' : '1792233445001',
      fecha: new Date().toISOString().slice(0, 10),
      subtotal: 391.30,
      iva: 58.70,
      total: 450.00,
      categoriaSugerida: 'Suministros y Equipos de Oficina',
      items: [
        { descripcion: 'Cartuchos Tóner HP LaserJet Pro', cantidad: 2, precio: 95.00 },
        { descripcion: 'Resmas de Papel Bond Report A4 75g', cantidad: 10, precio: 5.50 },
        { descripcion: 'Mobiliario Ergonómico Soporte Monitor', cantidad: 3, precio: 48.77 }
      ]
    };
    setParsedPurchases((previous) => [purchase, ...previous]);
    triggerSamplePushAlert('Factura leída (demo)', `${fileName || purchase.numero}: ${purchase.proveedor}, $${purchase.total.toFixed(2)} detectados.`);
    return purchase;
  };

  const processPurchase = (
    purchaseId: string,
    actions: { expense: boolean; payable: boolean; inventory: boolean }
  ) => {
    const purchase = parsedPurchases.find((p) => p.id === purchaseId);
    if (!purchase || !Object.values(actions).some(Boolean)) return;

    if (actions.expense) {
      const newExp: ExpenseRecord = {
        id: `EXP-${Date.now()}`,
        proveedor: purchase.proveedor,
        concepto: `Compra según factura ${purchase.numero}`,
        monto: purchase.total,
        fecha: purchase.fecha,
        deducible: true,
        categoria: purchase.categoriaSugerida
      };
      setExpenses((prev) => [newExp, ...prev]);
    }

    if (actions.payable) {
      const newPay: AccountPayable = {
        id: `PAY-${Date.now()}`,
        proveedor: purchase.proveedor,
        monto: purchase.total,
        fechaVence: '2026-10-31',
        estado: 'PENDIENTE'
      };
      setPayables((prev) => [newPay, ...prev]);
    }

    if (actions.inventory) {
      const newInvItems: InventoryItem[] = purchase.items.map((it, idx) => ({
        id: `INV-${purchase.id}-${idx}`,
        codigo: `PROD-${purchase.id}-${idx + 1}`,
        nombre: it.descripcion,
        stock: it.cantidad,
        costoPromedio: it.precio,
        categoria: 'Suministros Corporativos',
        facturaOrigen: purchase.numero,
        fechaIngreso: purchase.fecha
      }));
      setInventory((prev) => [...newInvItems, ...prev]);
    }

    // Remove from pending OCR
    setParsedPurchases((prev) => prev.filter((p) => p.id !== purchaseId));
    triggerSamplePushAlert(
      'Compra Contabilizada',
      `Factura ${purchase.numero} integrada a gastos y módulos correspondientes.`
    );
  };

  // Module 6: Marketplace
  const createMarketplaceRequest = (
    reqData: Omit<MarketplaceRequest, 'id' | 'clientId' | 'clientName' | 'clientRuc' | 'fechaPublicacion' | 'offersCount' | 'offers' | 'status'>
  ) => {
    const newReq: MarketplaceRequest = {
      ...reqData,
      id: `REQ-${Date.now().toString().slice(-4)}`,
      clientId: 'CLI-001',
      clientName: profile.razonSocial,
      clientRuc: profile.ruc,
      fechaPublicacion: new Date().toISOString().slice(0, 10),
      status: 'ABIERTA',
      offersCount: 0,
      offers: []
    };
    setMarketplaceRequests((prev) => [newReq, ...prev]);
    triggerSamplePushAlert('Requerimiento Publicado', 'Los contadores verificados de la red ya pueden enviarte propuestas.');
  };

  const submitMarketplaceOffer = (
    requestId: string,
    offerData: Omit<MarketplaceOffer, 'id' | 'accountantId' | 'accountantName' | 'accountantTitle' | 'accountantRating' | 'reviewsCount' | 'fechaOferta' | 'estado'>
  ) => {
    const newOffer: MarketplaceOffer = {
      ...offerData,
      id: `OFF-${Date.now().toString().slice(-4)}`,
      accountantId: 'ACC-PRO-CURRENT',
      accountantName: 'Tu Estudio Contable Asociado',
      accountantTitle: 'Contador Certificado CONT MARJO 360',
      accountantRating: 5.0,
      reviewsCount: 12,
      fechaOferta: new Date().toISOString().replace('T', ' ').slice(0, 16),
      estado: 'PENDIENTE'
    };

    setMarketplaceRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            offersCount: r.offersCount + 1,
            status: 'OFERTADA',
            offers: [...r.offers, newOffer]
          };
        }
        return r;
      })
    );
    triggerSamplePushAlert('Propuesta Enviada', 'Tu cotización ha sido notificada al contribuyente.');
  };

  const acceptOffer = (requestId: string, offerId: string) => {
    const request = marketplaceRequests.find((entry) => entry.id === requestId);
    const selectedOffer = request?.offers.find((offer) => offer.id === offerId);
    setMarketplaceRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'EN_PROCESO',
            offers: r.offers.map((o) => (o.id === offerId ? { ...o, estado: 'ACEPTADA' } : { ...o, estado: 'RECHAZADA' }))
          };
        }
        return r;
      })
    );
    setChatMessages([{ id: `SYS-${Date.now()}`, senderRole: 'SISTEMA', senderName: 'Sistema', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `Contrato de demostración iniciado: ${request?.title || requestId} · ${selectedOffer?.accountantName || 'profesional'}.` }]);
    triggerSamplePushAlert('Propuesta aceptada (demo)', 'El estado de contratación y el chat se actualizaron localmente.');
  };

  // Chat
  const sendChatMessage = (text: string, attachmentName?: string) => {
    const contract = marketplaceRequests.find((request) => request.status === 'EN_PROCESO');
    const acceptedProvider = contract?.offers.find((offer) => offer.estado === 'ACEPTADA')?.accountantName || 'Contador asociado';
    const newMsg: ChatMessage = {
      id: `MSG-${Date.now()}`,
      senderRole: activeRole === 'CONTADOR_PROFESIONAL' ? 'CONTADOR' : 'CLIENTE',
      senderName: activeRole === 'CONTADOR_PROFESIONAL' ? 'Tu estudio contable' : profile.razonSocial,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      attachmentName
    };
    setChatMessages((prev) => [...prev, newMsg]);

    // Simulated response from other side after 1s
    if (activeRole === 'CONTRIBUYENTE') {
      setTimeout(() => {
        const replyMsg: ChatMessage = {
          id: `MSG-${Date.now() + 1}`,
          senderRole: 'CONTADOR',
          senderName: acceptedProvider,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Mensaje recibido en esta simulación. Puedes continuar la conversación de ejemplo aquí.'
        };
        setChatMessages((prev) => [...prev, replyMsg]);
      }, 1200);
    }
  };

  const toggleClientPermission = (perm: 'invoices2026' | 'sriTaxAccess' | 'bankStatements') => {
    setClientPermissions((prev) => {
      const updated = { ...prev, [perm]: !prev[perm] };
      triggerSamplePushAlert(
        'Permiso de Acceso Actualizado',
        `Autorización para ${perm}: ${updated[perm] ? '🟢 Concedido al Contador' : '🔴 Revocado'}`
      );
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        authenticateDemo,
        signOutDemo,
        accountantProfile,
        updateAccountantProfile,
        activeRole,
        setActiveRole: changeActiveRole,
        deviceMode,
        setDeviceMode,
        activeTab,
        setActiveTab,
        activePurchaseSection,
        setActivePurchaseSection,
        startNewDocument,
        selectedDocumentType,
        profileSetupComplete,
        completeProfileSetup,
        profile,
        updateProfile,
        simulateRucOcrUpload,
        isParsingRuc,
        ocrProgressStep,
        invoices,
        activeRideInvoice,
        setActiveRideInvoice,
        emitInvoiceWithStepper,
        isEmitting,
        emissionStep,
        vaultDocuments,
        addVaultDocument,
        signDocument,
        isSigning,
        updateCertificate,
        taxDeadlines,
        recalculateDeadlinesForRuc,
        markDeadlineDone,
        parsedPurchases,
        expenses,
        payables,
        inventory,
        processPurchase,
        simulatePurchaseOcr,
        marketplaceRequests,
        createMarketplaceRequest,
        submitMarketplaceOffer,
        acceptOffer,
        chatMessages,
        sendChatMessage,
        clientPermissions,
        toggleClientPermission,
        accountantClients,
        clientAuditEvidence,
        addClientAuditEvidence,
        impersonatedClientId,
        setImpersonatedClientId,
        toasts,
        dismissToast,
        triggerSamplePushAlert
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
