import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useFinanceData } from "../context/FinanceDataContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin, currentUser } = useAuth();
  const { profile, profileLoading } = useFinanceData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser || profileLoading) {
      return;
    }
    navigate(profile?.onboardingCompleted ? "/app/dashboard" : "/onboarding", { replace: true });
  }, [currentUser, profile, profileLoading, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/app/dashboard");
    } catch {
      setError("Unable to sign in with provided credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await googleLogin();
      navigate("/app/dashboard");
    } catch {
      setError("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-2">
        <div className="hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-600 to-emerald-500 p-8 text-white lg:block">
          <p className="text-sm font-medium text-blue-100">FinPilot</p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight">Personal finance workspace for everyday consistency.</h1>
          <p className="mt-4 text-sm text-blue-100">
            Track expenses, income, EMIs, savings goals, and performance from one premium SaaS-style dashboard.
          </p>
        </div>

        <div className="card rounded-3xl p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Continue to your finance workspace.</p>

          {error ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Email</span>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Password</span>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                required
              />
            </label>

            <button type="submit" disabled={loading} className="btn-primary inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm">
              {loading ? "Signing in..." : "Sign in"}
              {!loading ? <ArrowRight className="h-4 w-4" /> : null}
            </button>
          </form>

          <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="btn-secondary mt-3 w-full px-4 py-2.5 text-sm">
            Continue with Google
          </button>

          <p className="mt-5 text-sm text-slate-500">
            New here?{" "}
            <Link to="/signup" className="font-medium text-blue-700 hover:text-blue-800">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
