import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirebaseProvider } from "./lib/firebase-context";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Services from "./pages/Services";
import Billings from "./pages/Billings";
import Birthdays from "./pages/Birthdays";
import Templates from "./pages/Templates";
import Messaging from "./pages/Messaging";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <FirebaseProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Customers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Services />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/billings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Billings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/birthdays"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Birthdays />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Templates />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/messaging"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Messaging />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </FirebaseProvider>
);

export default App;
