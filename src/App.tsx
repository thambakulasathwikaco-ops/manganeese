import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { SmartMineField } from './components/SmartMineField';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ManganeseMapPage } from './pages/ManganeseMapPage';
import { ProductionPage } from './pages/ProductionPage';
import { ShortfallPage } from './pages/ShortfallPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { WeatherPage } from './pages/WeatherPage';
import { DataUploadPage } from './pages/DataUploadPage';
import { SiteIntelligencePage } from './pages/SiteIntelligencePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Landing Page has its own full-bleed layout with background field
  if (location.pathname === '/') {
    return (
      <>
        <SmartMineField />
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-txt-primary flex flex-col selection:bg-brand-primary/30 selection:text-brand-secondary relative">
      <SmartMineField />
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex relative z-10">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/manganese-map" element={<ManganeseMapPage />} />
            <Route path="/production" element={<ProductionPage />} />
            <Route path="/shortfall" element={<ShortfallPage />} />
            <Route path="/equipment" element={<EquipmentPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/data" element={<DataUploadPage />} />
            <Route path="/analyzed-locations" element={<SiteIntelligencePage />} />
            <Route path="/site-intelligence" element={<Navigate to="/analyzed-locations" replace />} />
            <Route path="/models" element={<Navigate to="/analyzed-locations" replace />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
