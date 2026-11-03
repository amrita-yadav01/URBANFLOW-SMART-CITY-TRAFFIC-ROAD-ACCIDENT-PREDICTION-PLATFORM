import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { HotspotsPage } from './pages/HotspotsPage';
import { TrafficPage } from './pages/TrafficPage';
import { PredictionPage } from './pages/PredictionPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DataManagementPage } from './pages/DataManagementPage';
import { ModelsPage } from './pages/ModelsPage';
import { SettingsPage } from './pages/SettingsPage';

function AppLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="min-h-screen bg-[#06141B] text-[#CCD0CF] flex font-sans antialiased">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area with dynamic margin based on sidebar state */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-250 ${
          collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <Navbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-5 max-w-7xl w-full mx-auto" key={refreshKey}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  onNavigateToHotspots={() => navigate('/hotspots')}
                  onNavigateToTraffic={() => navigate('/traffic')}
                  onNavigateToPrediction={() => navigate('/risk-prediction')}
                />
              }
            />

            <Route path="/hotspots" element={<HotspotsPage />} />

            <Route path="/traffic" element={<TrafficPage />} />
            <Route path="/traffic-forecast" element={<Navigate to="/traffic" replace />} />

            <Route path="/risk-prediction" element={<PredictionPage />} />
            <Route path="/prediction" element={<Navigate to="/risk-prediction" replace />} />

            <Route path="/analytics" element={<AnalyticsPage />} />

            <Route path="/datasets" element={<DataManagementPage />} />

            <Route path="/models" element={<ModelsPage />} />

            <Route path="/settings" element={<SettingsPage />} />

            {/* Fallback to Dashboard for unknown routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Global Precision Technical Footer */}
        <footer className="border-t border-[#253745] bg-[#11212D] py-3 px-6 text-center text-xs text-[#9BA8AB] font-mono">
          <span>URBANFLOW v2.2 • Smart City Traffic & Road Accident Prediction Platform</span>
          <span className="mx-2 text-[#4A5C6A]">•</span>
          <span className="text-[#FF7A00]">Maharashtra GIS Scope (Demo: Mumbai MMR)</span>
          <span className="mx-2 text-[#4A5C6A]">•</span>
          <span>FastAPI • Scikit-Learn • WGS84 Spatial Layer • PostGIS Compatible</span>
        </footer>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
