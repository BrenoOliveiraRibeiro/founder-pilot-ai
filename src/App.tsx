
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layouts/ProtectedRoute";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Finances from "@/pages/Finances";
import Runway from "@/pages/Runway";
import Market from "@/pages/Market";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Team from "@/pages/Team";
import Calendar from "@/pages/Calendar";
import Auth from "@/pages/Auth";
import Onboarding from "@/pages/Onboarding";
import OpenFinance from "@/pages/OpenFinance";
import Advisor from "@/pages/Advisor";
import NotFound from "@/pages/NotFound";
import MarketSize from "@/pages/MarketSize";
import Connect from "@/pages/Connect";
import InvestorsSettings from "@/pages/InvestorsSettings";
import PluggyIntegration from "@/pages/PluggyIntegration";
import { PluggyUpdate } from "@/pages/PluggyUpdate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/finances" element={<ProtectedRoute><Finances /></ProtectedRoute>} />
            <Route path="/runway" element={<ProtectedRoute><Runway /></ProtectedRoute>} />
            <Route path="/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
            <Route path="/market-size" element={<ProtectedRoute><MarketSize /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/open-finance" element={<ProtectedRoute><OpenFinance /></ProtectedRoute>} />
            <Route path="/advisor" element={<ProtectedRoute><Advisor /></ProtectedRoute>} />
            <Route path="/connect" element={<ProtectedRoute><Connect /></ProtectedRoute>} />
            <Route path="/investors-settings" element={<ProtectedRoute><InvestorsSettings /></ProtectedRoute>} />
            <Route path="/pluggy" element={<ProtectedRoute><PluggyIntegration /></ProtectedRoute>} />
            <Route path="/pluggy-update" element={<ProtectedRoute><PluggyUpdate /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
