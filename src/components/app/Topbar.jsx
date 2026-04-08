import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useFinanceData } from "../../context/FinanceDataContext";

const MotionDiv = motion.div;

const titles = {
  "/app/dashboard": { title: "Dashboard", subtitle: "Your monthly financial snapshot" },
  "/app/tracking": { title: "Tracking", subtitle: "Manage income and expense records" },
  "/app/emi": { title: "EMI", subtitle: "Monitor loans and payments" },
  "/app/goals": { title: "Savings Goals", subtitle: "Stay on track with your targets" },
  "/app/analytics": { title: "Analytics", subtitle: "Financial insights and performance trends" },
  "/app/profile": { title: "Profile", subtitle: "Personal, security, and account settings" },
};

export default function Topbar({ onOpenSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { profile } = useFinanceData();
  const [menuOpen, setMenuOpen] = useState(false);

  const headerCopy = useMemo(() => titles[location.pathname] || titles["/app/dashboard"], [location.pathname]);

  const userName = profile?.name?.trim() || "User";
  const initials = userName.slice(0, 1).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-900">{headerCopy.title}</p>
            <p className="text-xs text-slate-500">{headerCopy.subtitle}</p>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-slate-300"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 text-xs font-semibold text-white">
              {initials}
            </span>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-slate-900">{userName}</p>
              <p className="text-[11px] text-slate-500">{profile?.email || "Account"}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>

          <AnimatePresence>
            {menuOpen ? (
              <MotionDiv
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
              >
                <Link
                  to="/app/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  <UserRound className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </MotionDiv>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
