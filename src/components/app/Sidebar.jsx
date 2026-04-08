import { NavLink } from "react-router-dom";
import {
  BarChart3,
  ChevronLeft,
  Goal,
  HandCoins,
  LayoutDashboard,
  WalletCards,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const MotionDiv = motion.div;
const MotionAside = motion.aside;

const links = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/tracking", label: "Tracking", icon: HandCoins },
  { to: "/app/emi", label: "EMI", icon: WalletCards },
  { to: "/app/goals", label: "Savings Goals", icon: Goal },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/profile", label: "Profile", icon: UserRound },
];

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col rounded-r-3xl border-r border-slate-200/80 bg-white/95 px-4 py-5 backdrop-blur">
      <div className="mb-8 px-2">
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2">
          <span className="text-sm font-semibold tracking-tight text-white">FinPilot</span>
          <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-semibold text-slate-900">SaaS</span>
        </div>
      </div>

      <nav className="space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-emerald-50 p-4">
        <p className="text-xs font-semibold text-slate-700">Daily Tip</p>
        <p className="mt-1 text-xs text-slate-600">Log every expense before end-of-day to keep analytics accurate.</p>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 lg:block">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/45 lg:hidden"
          >
            <MotionAside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              className="h-full w-72 bg-transparent"
            >
              <div className="flex h-16 items-center justify-end px-4">
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="rounded-lg bg-white p-2 text-slate-700 shadow"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent onNavigate={onCloseMobile} />
            </MotionAside>
          </MotionDiv>
        ) : null}
      </AnimatePresence>
    </>
  );
}
