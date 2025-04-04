
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Advisor from "./pages/Advisor";
import Connect from "./pages/Connect";
import OpenFinance from "./pages/OpenFinance";
import Calendar from "./pages/Calendar";
import Team from "./pages/Team";
import Market from "./pages/Market";
import Reports from "./pages/Reports";
import Finances from "./pages/Finances";
import Runway from "./pages/Runway";
import Settings from "./pages/Settings";
import InvestorsSettings from "./pages/InvestorsSettings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/layouts/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            <Route path="/auth" element={
              <ProtectedRoute requireAuth={false} redirectTo="/dashboard">
                <Auth />
              </ProtectedRoute>
            } />
            
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/advisor" element={
              <ProtectedRoute>
                <Advisor />
              </ProtectedRoute>
            } />
            
            <Route path="/connect" element={
              <ProtectedRoute>
                <Connect />
              </ProtectedRoute>
            } />
            
            <Route path="/open-finance" element={
              <ProtectedRoute>
                <OpenFinance />
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
            
            <Route path="/market" element={
              <ProtectedRoute>
                <Market />
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            
            <Route path="/finances" element={
              <ProtectedRoute>
                <Finances />
              </ProtectedRoute>
            } />
            
            <Route path="/runway" element={
              <ProtectedRoute>
                <Runway />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            <Route path="/settings/investors" element={
              <ProtectedRoute>
                <InvestorsSettings />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
