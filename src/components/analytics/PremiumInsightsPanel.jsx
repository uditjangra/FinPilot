import React, { useMemo } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Sparkles } from "lucide-react";
import { formatCurrency, formatCurrencyRounded } from "../../utils/currency";
import {
    buildSpendingInsight,
    computeFinancialHealthScore,
    getTopCategoryShare,
    groupTransactionsByMonth,
} from "../../utils/finance";

export default function PremiumInsightsPanel({
    transactions = [],
    selectedMonthKey,
    emiBurdenPercent = 0,
    monthlyIncome = 0,
    monthlyExpense = 0,
}) {
    const monthlySeries = useMemo(() => groupTransactionsByMonth(transactions).slice(-8), [transactions]);

    const spendingInsight = useMemo(
        () => buildSpendingInsight(transactions, selectedMonthKey),
        [transactions, selectedMonthKey]
    );

    const topCategoryShare = useMemo(
        () => getTopCategoryShare(transactions, selectedMonthKey),
        [transactions, selectedMonthKey]
    );

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;
    const financialHealthScore = computeFinancialHealthScore({
        savingsRate,
        emiBurdenRate: emiBurdenPercent,
        topCategoryShare,
    });

    return (
        <section className="glass rounded-3xl p-6 md:p-8 space-y-6">
            <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-text-primary">Dashboard Analytics</h2>
                <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mt-1">
                    Monthly spending, savings growth, EMI burden, and habit insights
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-primary-bg border border-border rounded-2xl p-4">
                    <p className="text-[10px] uppercase tracking-widest font-black text-text-secondary">EMI Burden</p>
                    <p className="text-2xl font-black text-rose-500 mt-1">{emiBurdenPercent.toFixed(1)}%</p>
                </div>
                <div className="bg-primary-bg border border-border rounded-2xl p-4">
                    <p className="text-[10px] uppercase tracking-widest font-black text-text-secondary">Savings Rate</p>
                    <p className="text-2xl font-black text-emerald-500 mt-1">{savingsRate.toFixed(1)}%</p>
                </div>
                <div className="bg-primary-bg border border-border rounded-2xl p-4">
                    <p className="text-[10px] uppercase tracking-widest font-black text-text-secondary">Financial Health Score</p>
                    <p className="text-2xl font-black text-accent mt-1">{financialHealthScore.toFixed(0)} / 100</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-surface border border-border rounded-2xl p-4">
                    <h3 className="text-sm font-black text-text-primary mb-4 uppercase tracking-wider">Monthly Spending Graph</h3>
                    {monthlySeries.length === 0 ? (
                        <div className="h-64 border border-dashed border-border rounded-xl flex items-center justify-center text-sm text-text-secondary">
                            No transaction history yet.
                        </div>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlySeries}>
                                    <defs>
                                        <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--theme-chart-expense)" stopOpacity={0.85} />
                                            <stop offset="100%" stopColor="var(--theme-chart-expense)" stopOpacity={0.15} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-chart-grid)" />
                                    <XAxis dataKey="label" tick={{ fill: "var(--theme-text-secondary)", fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <YAxis tickFormatter={(value) => formatCurrencyRounded(value)} tick={{ fill: "var(--theme-text-secondary)", fontSize: 11 }} tickLine={false} axisLine={false} width={76} />
                                    <Tooltip formatter={(value) => [formatCurrency(value), "Expense"]} />
                                    <Area type="monotone" dataKey="expense" stroke="var(--theme-chart-expense)" fill="url(#spendingGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="bg-surface border border-border rounded-2xl p-4">
                    <h3 className="text-sm font-black text-text-primary mb-4 uppercase tracking-wider">Savings Growth Graph</h3>
                    {monthlySeries.length === 0 ? (
                        <div className="h-64 border border-dashed border-border rounded-xl flex items-center justify-center text-sm text-text-secondary">
                            No transaction history yet.
                        </div>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlySeries}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-chart-grid)" />
                                    <XAxis dataKey="label" tick={{ fill: "var(--theme-text-secondary)", fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <YAxis tickFormatter={(value) => formatCurrencyRounded(value)} tick={{ fill: "var(--theme-text-secondary)", fontSize: 11 }} tickLine={false} axisLine={false} width={76} />
                                    <Tooltip formatter={(value) => [formatCurrency(value), "Savings"]} />
                                    <Line
                                        type="monotone"
                                        dataKey="savings"
                                        stroke="var(--theme-chart-income)"
                                        strokeWidth={3}
                                        dot={{ r: 3, fill: "var(--theme-chart-income)" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-primary-bg border border-border rounded-2xl p-4">
                <p className="text-sm font-black text-text-primary flex items-start gap-2">
                    <Sparkles size={16} className="text-accent mt-0.5 shrink-0" />
                    {spendingInsight}
                </p>
            </div>
        </section>
    );
}
