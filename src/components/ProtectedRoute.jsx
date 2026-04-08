import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFinanceData } from "../context/FinanceDataContext";

export default function ProtectedRoute({ children, requireOnboardingComplete = true }) {
  const { currentUser } = useAuth();
  const { profile, profileLoading } = useFinanceData();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (profileLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-app">
        <div className="card flex items-center gap-3 px-5 py-4">
          <span className="h-3 w-3 animate-pulse rounded-full bg-blue-600" />
          <p className="text-sm text-slate-600">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  const onboardingCompleted = Boolean(profile?.onboardingCompleted);

  if (requireOnboardingComplete && !onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!requireOnboardingComplete && onboardingCompleted) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}
