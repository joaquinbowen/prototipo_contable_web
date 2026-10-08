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
import { MarketplaceModule } from './components/modules/MarketplaceModule';
import { AccountantDashboardModule } from './components/modules/AccountantDashboardModule';
import { SuperAdminModule, AdminMarketplaceModule, AdminTaxpayersModule, AdminAccountantsModule, AdminActivityModule } from './components/modules/SuperAdminModule';
import { AdminAnalyticsProvider } from './components/modules/AdminAnalyticsContext';
import { ProfileModule } from './components/modules/ProfileModule';
import { ClientWorkspaceModule } from './components/modules/ClientWorkspaceModule';
import { AccessModule } from './components/modules/AccessModule';
import { DocumentHistoryModule } from './components/modules/DocumentHistoryModule';
import { NotificationsModule } from './components/modules/NotificationsModule';

const AppContent: React.FC = () => {
  const {
    activeRole,
    isAuthenticated,
    activeTab,
    activeRideInvoice,
    setActiveRideInvoice
  } = useApp();

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
          {activeRole === 'CONTRIBUYENTE' && activeTab === 'calendar' && <TaxCalendarModule />}
          {activeRole === 'CONTRIBUYENTE' && activeTab === 'onboarding' && <ProfileModule initialSection="tax" />}
          {activeTab === 'profile' && <ProfileModule />}
          {activeRole !== 'SUPER_ADMIN' && activeTab === 'notifications' && <NotificationsModule />}
          {activeRole !== 'SUPER_ADMIN' && ['marketplace', 'accountant_proposals', 'accountant_clients'].includes(activeTab) && <MarketplaceModule />}
          {activeRole === 'CONTADOR_PROFESIONAL' && activeTab === 'accountant_dashboard' && <AccountantDashboardModule />}
          {activeRole === 'CONTADOR_PROFESIONAL' && activeTab === 'client_workspace' && <ClientWorkspaceModule />}
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
      <AdminAnalyticsProvider><AppContent /></AdminAnalyticsProvider>
    </AppProvider>
  );
}
