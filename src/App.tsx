
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layouts/ProtectedRoute";

import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import OpenFinance from "@/pages/OpenFinance";
import Finances from "@/pages/Finances";
import Advisor from "@/pages/Advisor";
import Settings from "@/pages/Settings";
import Market from "@/pages/Market";
import MarketSize from "@/pages/MarketSize";
import Runway from "@/pages/Runway";
import Calendar from "@/pages/Calendar";
import Team from "@/pages/Team";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/NotFound";
import Connect from "@/pages/Connect";
import N8NIntegration from "@/pages/N8NIntegration";
import InvestorsSettings from "@/pages/InvestorsSettings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Páginas públicas */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={
            <ProtectedRoute requireAuth={false} redirectTo="/dashboard">
              <Auth />
            </ProtectedRoute>
          } />

          {/* Páginas protegidas */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          <Route path="/open-finance" element={
            <ProtectedRoute>
              <OpenFinance />
            </ProtectedRoute>
          } />
          <Route path="/finances" element={
            <ProtectedRoute>
              <Finances />
            </ProtectedRoute>
          } />
          <Route path="/advisor" element={
            <ProtectedRoute>
              <Advisor />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/market" element={
            <ProtectedRoute>
              <Market />
            </ProtectedRoute>
          } />
          <Route path="/market-size" element={
            <ProtectedRoute>
              <MarketSize />
            </ProtectedRoute>
          } />
          <Route path="/runway" element={
            <ProtectedRoute>
              <Runway />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          } />
          <Route path="/team" element={
            <ProtectedRoute>
              <Team />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/connect" element={
            <ProtectedRoute>
              <Connect />
            </ProtectedRoute>
          } />
          <Route path="/n8n-integration" element={
            <ProtectedRoute>
              <N8NIntegration />
            </ProtectedRoute>
          } />
          <Route path="/investors-settings" element={
            <ProtectedRoute>
              <InvestorsSettings />
            </ProtectedRoute>
          } />
          
          {/* Página 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
