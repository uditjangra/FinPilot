import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFinanceData } from "../context/FinanceDataContext";
import PageHeader from "../components/ui/PageHeader";
import { ChartSkeleton } from "../components/Skeleton";
import { formatCurrency, formatMonthKey, getMonthKey } from "../utils/format";

const pieColors = ["#2563eb", "#10b981", "#0ea5e9", "#14b8a6", "#60a5fa", "#34d399"];

function groupByMonth(incomeItems, expenseItems) {
  const map = new Map();

  incomeItems.forEach((entry) => {
    const month = (entry.date || "").slice(0, 7);
    if (!month) {
      return;
    }
    if (!map.has(month)) {
      map.set(month, { month, income: 0, expense: 0, savings: 0 });
    }
    map.get(month).income += Number(entry.amount || 0);
  });

  expenseItems.forEach((entry) => {
    const month = (entry.date || "").slice(0, 7);
    if (!month) {
      return;
    }
    if (!map.has(month)) {
      map.set(month, { month, income: 0, expense: 0, savings: 0 });
    }
    map.get(month).expense += Number(entry.amount || 0);
  });

  const sorted = [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
  return sorted.map((item) => ({
    ...item,
    savings: item.income - item.expense,
    monthLabel: formatMonthKey(item.month),
  }));
}

export default function Analytics() {
  const { income, expenses, emis, collectionsLoading } = useFinanceData();
  const [windowSize, setWindowSize] = useState("6m");

  const monthlyData = useMemo(() => groupByMonth(income, expenses), [income, expenses]);
  const visibleMonthlyData = useMemo(() => {
    if (windowSize === "all") {
      return monthlyData;
    }
    const count = windowSize === "12m" ? 12 : 6;
    return monthlyData.slice(-count);
  }, [monthlyData, windowSize]);

  const currentMonth = getMonthKey(new Date());
  const currentMonthIncome = income
    .filter((entry) => (entry.date || "").slice(0, 7) === currentMonth)
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const currentMonthExpense = expenses
    .filter((entry) => (entry.date || "").slice(0, 7) === currentMonth)
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const currentMonthSavings = currentMonthIncome - currentMonthExpense;

  const emiThisMonth = emis
    .filter((entry) => entry.status !== "closed")
    .reduce((sum, entry) => sum + Number(entry.EMI || 0), 0);
  const emiBurdenRatio = currentMonthIncome > 0 ? (emiThisMonth / currentMonthIncome) * 100 : 0;

  const categoryBreakdown = useMemo(() => {
    const totals = {};
    expenses
      .filter((entry) => (entry.date || "").slice(0, 7) === currentMonth)
      .forEach((entry) => {
        const category = entry.category || "Other";
        totals[category] = (totals[category] || 0) + Number(entry.amount || 0);
      });

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [expenses, currentMonth]);

  const topCategoryShare = useMemo(() => {
    const total = categoryBreakdown.reduce((sum, item) => sum + item.value, 0);
    if (!total || !categoryBreakdown.length) {
      return 0;
    }
    return (categoryBreakdown[0].value / total) * 100;
  }, [categoryBreakdown]);

  const savingsRate = currentMonthIncome > 0 ? (currentMonthSavings / currentMonthIncome) * 100 : 0;
  const financialHealthScore = useMemo(() => {
    const normalizedSavings = Math.max(0, Math.min(100, savingsRate));
    const normalizedEmi = Math.max(0, Math.min(100, emiBurdenRatio));
    const normalizedCategory = Math.max(0, Math.min(100, topCategoryShare));
    return Math.round(normalizedSavings * 0.5 + (100 - normalizedEmi) * 0.3 + (100 - normalizedCategory) * 0.2);
  }, [savingsRate, emiBurdenRatio, topCategoryShare]);

  return (
    <section>
      <PageHeader
        title="Analytics"
        description="Graph-heavy insight workspace for spending, cash flow, debt burden, and financial health."
        actions={
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
            <WindowButton active={windowSize === "6m"} label="6M" onClick={() => setWindowSize("6m")} />
            <WindowButton active={windowSize === "12m"} label="12M" onClick={() => setWindowSize("12m")} />
            <WindowButton active={windowSize === "all"} label="All" onClick={() => setWindowSize("all")} />
          </div>
        }
      />

      {collectionsLoading ? (
        <ChartSkeleton />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MiniMetric label="Monthly Income" value={formatCurrency(currentMonthIncome)} />
            <MiniMetric label="Monthly Expense" value={formatCurrency(currentMonthExpense)} />
            <MiniMetric label="Savings Growth" value={formatCurrency(currentMonthSavings)} />
            <MiniMetric label="Financial Health Score" value={`${financialHealthScore}/100`} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Monthly Expense Graph">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={visibleMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="expense" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Income vs Expense Comparison">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={visibleMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <ChartCard title="Savings Growth Over Time" className="xl:col-span-2">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={visibleMonthlyData}>
                  <defs>
                    <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} fill="url(#savingsFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="EMI Burden Ratio">
              <ResponsiveContainer width="100%" height={280}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="85%"
                  barSize={18}
                  data={[{ value: Math.min(emiBurdenRatio, 100) }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" fill="#2563eb" cornerRadius={10} />
                  <text x="50%" y="46%" textAnchor="middle" className="fill-slate-900 text-2xl font-semibold">
                    {Math.round(emiBurdenRatio)}%
                  </text>
                  <text x="50%" y="56%" textAnchor="middle" className="fill-slate-500 text-xs">
                    of monthly income
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <ChartCard title="Category Breakdown (Current Month)" className="xl:col-span-2">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={96} label>
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Financial Health Score">
              <div className="flex h-[280px] flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 p-6 text-3xl font-semibold text-white shadow-lg">
                  {financialHealthScore}
                </div>
                <p className="max-w-xs text-sm text-slate-600">
                  Score combines savings rate, EMI burden ratio, and expense concentration by top category.
                </p>
              </div>
            </ChartCard>
          </div>
        </div>
      )}
    </section>
  );
}

function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`card ${className}`}>
      <p className="mb-3 text-sm font-semibold text-slate-900">{title}</p>
      {children}
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function WindowButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
        active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}
