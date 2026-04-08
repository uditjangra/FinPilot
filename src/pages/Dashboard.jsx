import { useMemo } from "react";
import { BellRing, CalendarClock, PiggyBank } from "lucide-react";
import { useFinanceData } from "../context/FinanceDataContext";
import { formatCurrency, formatDate, getMonthKey } from "../utils/format";
import PageHeader from "../components/ui/PageHeader";
import MetricCard from "../components/ui/MetricCard";
import { CardSkeleton } from "../components/Skeleton";
import EmptyState from "../components/ui/EmptyState";

function inMonth(items, monthKey) {
  return items.filter((item) => (item.date || "").slice(0, 7) === monthKey);
}

export default function Dashboard() {
  const { income, expenses, emis, goals, collectionsLoading } = useFinanceData();

  const monthKey = getMonthKey(new Date());
  const monthlyIncome = useMemo(
    () => inMonth(income, monthKey).reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [income, monthKey]
  );
  const monthlyExpenses = useMemo(
    () => inMonth(expenses, monthKey).reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses, monthKey]
  );
  const netSavings = monthlyIncome - monthlyExpenses;

  const nextDueEmi = useMemo(() => {
    const active = emis.filter((item) => item.status !== "closed" && item.dueDate);
    if (!active.length) {
      return null;
    }
    return [...active].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
  }, [emis]);

  const goalPreview = useMemo(() => goals.slice(0, 3), [goals]);

  return (
    <section>
      <PageHeader
        title="Overview"
        description="Simple monthly snapshot. Keep this page lightweight and actionable."
      />

      {collectionsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Income" value={formatCurrency(monthlyIncome)} helper="Current month" tone="emerald" />
          <MetricCard label="Total Expenses" value={formatCurrency(monthlyExpenses)} helper="Current month" tone="blue" />
          <MetricCard
            label="Net Savings"
            value={formatCurrency(netSavings)}
            helper={netSavings >= 0 ? "Positive balance" : "Spending exceeds income"}
            tone={netSavings >= 0 ? "emerald" : "amber"}
          />
          <div className="card border border-slate-200 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Upcoming EMI Reminder</p>
            {nextDueEmi ? (
              <div className="mt-3">
                <p className="text-lg font-semibold text-slate-900">{nextDueEmi.loanName}</p>
                <p className="text-sm text-slate-600">
                  {formatCurrency(nextDueEmi.EMI)} due on {formatDate(nextDueEmi.dueDate)}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No active EMI reminders.</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-5">
        <div className="card lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-blue-700" />
            <h2 className="text-sm font-semibold text-slate-900">Monthly Summary Card</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryPill label="Income" value={formatCurrency(monthlyIncome)} tone="emerald" />
            <SummaryPill label="Expense" value={formatCurrency(monthlyExpenses)} tone="blue" />
            <SummaryPill label="Savings" value={formatCurrency(netSavings)} tone={netSavings >= 0 ? "emerald" : "amber"} />
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Dashboard intentionally avoids heavy charting. Use Analytics for deeper insights.
          </p>
        </div>

        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-emerald-700" />
            <h2 className="text-sm font-semibold text-slate-900">Savings Goal Preview</h2>
          </div>

          {goalPreview.length ? (
            <div className="space-y-3">
              {goalPreview.map((goal) => {
                const progress = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
                return (
                  <div key={goal.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{goal.goalName}</span>
                      <span className="text-slate-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No goals yet"
              description="Add your first savings goal from the Savings Goals section."
            />
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <InfoCard
          icon={<BellRing className="h-4 w-4 text-blue-700" />}
          title="Daily routine"
          text="Track entries daily in the Tracking page to keep this summary accurate."
        />
        <InfoCard
          icon={<PiggyBank className="h-4 w-4 text-emerald-700" />}
          title="Consistency signal"
          text="Sustained positive net savings over 3 months improves your financial health score."
        />
      </div>
    </section>
  );
}

function SummaryPill({ label, value, tone }) {
  const tones = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
  };
  return (
    <div className={`rounded-xl border px-3 py-2 ${tones[tone] || tones.blue}`}>
      <p className="text-[11px] uppercase tracking-wide opacity-90">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="card">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <p className="text-sm font-semibold text-slate-900">{title}</p>
      </div>
      <p className="text-sm text-slate-600">{text}</p>
    </div>
  );
}
