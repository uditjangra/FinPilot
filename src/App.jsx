import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { FinanceDataProvider } from "./context/FinanceDataContext";
import { ToastProvider } from "./components/ui/ToastContext";
import AppShell from "./components/app/AppShell";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Tracking from "./pages/Tracking";
import Emi from "./pages/Emi";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <AuthProvider>
        <FinanceDataProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute requireOnboardingComplete={false}>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tracking" element={<Tracking />} />
                <Route path="emi" element={<Emi />} />
                <Route path="goals" element={<Goals />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </FinanceDataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
