import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { StoreProvider } from "./lib/store";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Children from "./pages/Children";
import Platforms from "./pages/Platforms";
import SettingsPage from "./pages/SettingsPage";
import Analyzer from "./pages/Analyzer";
import Simulator from "./pages/Simulator";
import Intelligence from "./pages/Intelligence";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return <QueryClientProvider client={queryClient}>
    <TooltipProvider><Toaster /><Sonner />
      <BrowserRouter><AuthProvider><StoreProvider><Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/children" element={<Children />} />
          <Route path="/platforms" element={<Platforms />} />
          <Route path="/analyzer" element={<Analyzer />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes></StoreProvider></AuthProvider></BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>;
}
