import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import AuthPage from './pages/AuthPage';
import { AICompanionOrb } from './assets/illustrations/scenes';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import NotificationToast from './components/layout/NotificationToast';
import RecordSaleModal from './components/modals/RecordSaleModal';
import SpellstockAIAssistant from './components/ai/SpellstockAIAssistant';

// Pages
import OverviewPage from './pages/OverviewPage';
import PotionPantryPage from './pages/PotionPantryPage';
import SalesTransactionsPage from './pages/SalesTransactionsPage';
import ProphecyAIPage from './pages/ProphecyAIPage';
import IntelligenceCentrePage from './pages/IntelligenceCentrePage';
import RestockSpellPage from './pages/RestockSpellPage';
import StrangeHappeningsPage from './pages/StrangeHappeningsPage';
import CrystalBallAnalyticsPage from './pages/CrystalBallAnalyticsPage';
import MidnightCursePage from './pages/MidnightCursePage';
import SettingsPage from './pages/SettingsPage';

function DashboardContent() {
  const { activeTab, setActiveTab } = useInventory();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recordSaleModalOpen, setRecordSaleModalOpen] = useState(false);

  const handleOpenRestock = () => {
    setActiveTab('restock');
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewPage
            onOpenRecordSale={() => setRecordSaleModalOpen(true)}
            onOpenRestock={handleOpenRestock}
          />
        );
      case 'pantry':
        return <PotionPantryPage />;
      case 'sales':
        return (
          <SalesTransactionsPage
            isRecordModalOpen={recordSaleModalOpen}
            setIsRecordModalOpen={setRecordSaleModalOpen}
          />
        );
      case 'prophecy':
        return <ProphecyAIPage onOpenRestock={handleOpenRestock} />;
      case 'intelligence':
        return <IntelligenceCentrePage />;
      case 'restock':
        return <RestockSpellPage />;
      case 'happenings':
        return <StrangeHappeningsPage />;
      case 'analytics':
        return <CrystalBallAnalyticsPage />;
      case 'curse':
        return <MidnightCursePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <OverviewPage
            onOpenRecordSale={() => setRecordSaleModalOpen(true)}
            onOpenRestock={handleOpenRestock}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-midnight-500 text-moonlight flex bg-arcane-mesh bg-fixed selection:bg-arcane selection:text-white">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onRecordSaleClick={() => setRecordSaleModalOpen(true)}
          onRestockClick={handleOpenRestock}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Modals, Toast & Floating AI Assistant */}
      <RecordSaleModal
        isOpen={recordSaleModalOpen}
        onClose={() => setRecordSaleModalOpen(false)}
      />
      <NotificationToast />
      <SpellstockAIAssistant />
    </div>
  );
}

function MainApp() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex flex-col items-center justify-center p-4">
        <AICompanionOrb className="w-12 h-12 animate-pulse mb-3" active={true} />
        <p className="text-xs font-mono text-sage-green animate-pulse">Attuning to Sanctum ledger...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <InventoryProvider>
      <DashboardContent />
    </InventoryProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
