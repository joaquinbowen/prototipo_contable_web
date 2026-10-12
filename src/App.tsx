import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { WebHeader } from './components/layout/WebHeader';
import { WebSidebar } from './components/layout/WebSidebar';
import { ContextBar } from './components/layout/ContextBar';
import { RideViewerModal } from './components/common/RideViewerModal';
import { DashboardModule } from './components/modules/DashboardModule';
import { TaxCalendarModule } from './components/modules/TaxCalendarModule';
import { InvoicingModule } from './components/modules/InvoicingModule';
import { PurchaseOcrModule } from './components/modules/PurchaseOcrModule';
import { InventoryModule } from './components/modules/InventoryModule';
import { MarketplaceModule } from './components/modules/MarketplaceModule';
import { AccountantDashboardModule } from './components/modules/AccountantDashboardModule';
import { SuperAdminModule, AdminMarketplaceModule, AdminTaxpayersModule, AdminAccountantsModule, AdminActivityModule } from './components/modules/SuperAdminModule';
import { AdminAnalyticsProvider } from './components/modules/AdminAnalyticsContext';
import { ProfileModule } from './components/modules/ProfileModule';
import { ClientWorkspaceModule } from './components/modules/ClientWorkspaceModule';
import { AccessModule } from './components/modules/AccessModule';
import { DocumentHistoryModule } from './components/modules/DocumentHistoryModule';
import { NotificationsModule } from './components/modules/NotificationsModule';
import { VerificationProvider, useVerification } from './features/verification/VerificationContext';
import { ProfessionalOnboarding } from './features/verification/ProfessionalOnboarding';
import { ManagerInbox } from './features/verification/ManagerInbox';
import { ManagerAvailability } from './features/verification/ManagerAvailability';
import { ManagerDashboard } from './features/verification/ManagerDashboard';
import { WorkModule } from './features/marketplace/WorkModule';
import { BusinessOverview } from './features/finance/BusinessOverview';
const SigningWorkspace = React.lazy(() => import('./features/signing/SigningWorkspace').then((module) => ({ default: module.SigningWorkspace })));

const AppContent: React.FC = () => {
  const {
    activeRole,
    isAuthenticated,
    activeTab,
    activeRideInvoice,
    setActiveRideInvoice
  } = useApp();
  const { application } = useVerification();

  if (!isAuthenticated) return <AccessModule />;

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-[#f3f6f5] text-slate-900 font-sans">
      <a href="#main-content" className="sr-only z-[100] rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow focus:not-sr-only focus:absolute focus:left-4 focus:top-4">
        Ir al contenido principal
      </a>
      {/* Top SaaS Header */}
      <WebHeader />
      <ContextBar />

      {/* Main Layout Area */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left SaaS Sidebar */}
        <WebSidebar />

        {/* Content Viewport */}
        <main key={`${activeRole}:${activeTab}`} id="main-content" className="min-w-0 flex-1 overflow-y-auto px-3 py-5 sm:px-5 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-[1520px]">
          {activeRole === 'CONTRIBUYENTE' && activeTab === 'dashboard' && <DashboardModule />}
          {activeRole === 'CONTRIBUYENTE' && activeTab === 'invoicing' && <InvoicingModule />}
          {activeRole === 'CONTRIBUYENTE' && activeTab === 'document_history' && <DocumentHistoryModule />}
          {activeRole === 'CONTRIBUYENTE' && activeTab === 'vault' && <ProfileModule initialSection="vault" />}
          {activeRole === 'CONTRIBUYENTE' && activeTab === 'purchases' && <PurchaseOcrModule />}
          {activeRole === 'CONTRIBUYENTE' && activeTab === 'inventory' && <InventoryModule />}
          {activeRole === 'CONTRIBUYENTE' && activeTab === 'business' && <BusinessOverview />}
          {activeRole === 'CONTRIBUYENTE' && activeTab === 'sign_pdf' && <React.Suspense fallback={<p className="rounded-xl bg-white p-5 text-sm">Abriendo visor PDF…</p>}><SigningWorkspace /></React.Suspense>}
          {activeRole === 'CONTRIBUYENTE' && activeTab === 'calendar' && <TaxCalendarModule />}
          {activeRole === 'CONTRIBUYENTE' && activeTab === 'onboarding' && <ProfileModule initialSection="tax" />}
          {activeTab === 'profile' && <ProfileModule />}
          {activeRole === 'CONTADOR_PROFESIONAL' && activeTab === 'verification' && <ProfessionalOnboarding />}
          {activeRole === 'GESTOR_CONTADORES' && activeTab === 'manager_dashboard' && <ManagerDashboard />}
          {activeRole === 'GESTOR_CONTADORES' && activeTab === 'manager_applications' && <ManagerInbox />}
          {activeRole === 'GESTOR_CONTADORES' && activeTab === 'manager_interviews' && <ManagerAvailability />}
          {(activeRole === 'CONTRIBUYENTE' || (activeRole === 'CONTADOR_PROFESIONAL' && application.status === 'VERIFICADO')) && activeTab === 'work' && <WorkModule />}
          {activeRole !== 'SUPER_ADMIN' && activeRole !== 'GESTOR_CONTADORES' && activeTab === 'notifications' && <NotificationsModule />}
          {activeRole !== 'SUPER_ADMIN' && activeRole !== 'GESTOR_CONTADORES' && ['marketplace', 'accountant_proposals', 'accountant_clients'].includes(activeTab) && (activeRole === 'CONTRIBUYENTE' || application.status === 'VERIFICADO' ? <MarketplaceModule /> : <ProfessionalOnboarding />)}
          {activeRole === 'CONTADOR_PROFESIONAL' && activeTab === 'accountant_dashboard' && (application.status === 'VERIFICADO' ? <AccountantDashboardModule /> : <ProfessionalOnboarding />)}
          {activeRole === 'CONTADOR_PROFESIONAL' && activeTab === 'client_workspace' && (application.status === 'VERIFICADO' ? <ClientWorkspaceModule /> : <ProfessionalOnboarding />)}
          {activeRole === 'SUPER_ADMIN' && activeTab === 'admin_console' && <SuperAdminModule />}
          {activeRole === 'SUPER_ADMIN' && activeTab === 'admin_marketplace' && <AdminMarketplaceModule />}
          {activeRole === 'SUPER_ADMIN' && activeTab === 'admin_taxpayers' && <AdminTaxpayersModule />}
          {activeRole === 'SUPER_ADMIN' && activeTab === 'admin_accountants' && <AdminAccountantsModule />}
          {activeRole === 'SUPER_ADMIN' && activeTab === 'admin_activity' && <AdminActivityModule />}
          </div>
        </main>
      </div>

      {/* RIDE Modal Viewer */}
      {activeRideInvoice && (
        <RideViewerModal
          invoice={activeRideInvoice}
          onClose={() => setActiveRideInvoice(null)}
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <VerificationProvider><AdminAnalyticsProvider><AppContent /></AdminAnalyticsProvider></VerificationProvider>
    </AppProvider>
  );
}
