import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-app px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2">
            <span className="text-sm font-semibold text-white">FinPilot</span>
            <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-semibold text-slate-900">SaaS</span>
          </div>
          <div className="flex gap-2">
            <Link to="/login" className="btn-secondary px-4 py-2 text-sm">
              Login
            </Link>
            <Link to="/signup" className="btn-primary px-4 py-2 text-sm">
              Get Started
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card rounded-3xl p-8">
            <p className="text-sm font-medium text-blue-700">Modern Personal Finance Platform</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
              Track EMIs, expenses, income, goals, and performance in one clean workspace.
            </h1>
            <p className="mt-4 max-w-xl text-sm text-slate-600">
              Built with onboarding-first authentication, structured dashboard architecture, and separated flows for
              tracking, EMI management, savings goals, analytics, and profile controls.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Onboarding Flow", "Dashboard Overview", "Graph Analytics", "Profile & Security"].map((item) => (
                <span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="card rounded-3xl bg-gradient-to-br from-blue-600 to-emerald-500 p-8 text-white">
            <h2 className="text-xl font-semibold">Why FinPilot</h2>
            <ul className="mt-4 space-y-3 text-sm text-blue-50">
              <li>Onboarding with progress tracking and financial priorities selection.</li>
              <li>Scalable module separation: Dashboard, Tracking, EMI, Goals, Analytics, Profile.</li>
              <li>Professional UX patterns: toasts, skeleton loaders, empty states, confirmation modals.</li>
              <li>Realtime data model designed for production-grade Firestore usage.</li>
            </ul>
            <Link to="/signup" className="btn-secondary mt-6 inline-block bg-white px-4 py-2 text-sm text-slate-900">
              Create your account
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
