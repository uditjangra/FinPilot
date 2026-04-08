import React, { useId, useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import { formatCurrency, formatCurrencyRounded } from "../utils/currency";
import { parseTransactionDate } from "../utils/transactionDate";

const CHART_COLORS = ["#0b63f6", "#14b8a6", "#f97316", "#ef4444", "#8b5cf6", "#f59e0b"];

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="bg-surface/95 border border-border p-4 rounded-xl backdrop-blur-md shadow-xl">
            {label && <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1">{label}</p>}
            {payload.map((entry) => (
                <p key={entry.dataKey} className="text-sm font-black" style={{ color: entry.color }}>
                    {entry.name}: <span className="text-text-primary">{formatCurrency(entry.value)}</span>
                </p>
            ))}
        </div>
    );
};

export default function Charts({ transactions }) {
    const gradientSeed = useId().replace(/:/g, "");
    const incomeGradientId = `${gradientSeed}-income`;
    const expenseGradientId = `${gradientSeed}-expense`;

    const { pieData, barData } = useMemo(() => {
        const expensesByCategory = {};
        const monthlyData = {};

        transactions.forEach((transaction) => {
            const amount = toNumber(transaction.amount);
            if (amount <= 0) {
                return;
            }

            if (transaction.type === "expense") {
                const category = transaction.category || "Other";
                expensesByCategory[category] = (expensesByCategory[category] || 0) + amount;
            }

            const transactionDate = parseTransactionDate(transaction.date);
            if (!transactionDate) {
                return;
            }

            const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, "0")}`;
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    monthDate: new Date(transactionDate.getFullYear(), transactionDate.getMonth(), 1),
                    name: transactionDate.toLocaleString("en-IN", { month: "short", year: "2-digit" }),
                    income: 0,
                    expense: 0,
                };
            }

            if (transaction.type === "income") {
                monthlyData[monthKey].income += amount;
            }
            if (transaction.type === "expense") {
                monthlyData[monthKey].expense += amount;
            }
        });

        const normalizedPieData = Object.entries(expensesByCategory)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const normalizedBarData = Object.values(monthlyData)
            .sort((a, b) => a.monthDate - b.monthDate)
            .slice(-6)
            .map(({ name, income, expense }) => ({ name, income, expense }));

        return {
            pieData: normalizedPieData,
            barData: normalizedBarData,
        };
    }, [transactions]);

    return (
        <div className="grid grid-cols-1 gap-10">
            <div className="flex flex-col items-center">
                <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-7 text-center">
                    Allocation <span className="text-accent">Structure</span>
                </h3>
                {pieData.length > 0 ? (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={58}
                                    outerRadius={92}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell
                                            key={entry.name}
                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-3xl w-full">
                        <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">No expense data yet</p>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center">
                <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-7 text-center">
                    Cash <span className="text-accent">Flow</span>
                </h3>
                {barData.length > 0 ? (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                                <defs>
                                    <linearGradient id={incomeGradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--theme-chart-income)" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="var(--theme-chart-income)" stopOpacity={0.25} />
                                    </linearGradient>
                                    <linearGradient id={expenseGradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--theme-chart-expense)" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="var(--theme-chart-expense)" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-chart-grid)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "var(--theme-text-secondary)", fontSize: 10, fontWeight: 800 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "var(--theme-text-secondary)", fontSize: 10, fontWeight: 700 }}
                                    width={72}
                                    tickFormatter={(value) => formatCurrencyRounded(value)}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--theme-accent-soft)" }} />
                                <Bar
                                    dataKey="income"
                                    fill={`url(#${incomeGradientId})`}
                                    name="Income"
                                    radius={[6, 6, 0, 0]}
                                />
                                <Bar
                                    dataKey="expense"
                                    fill={`url(#${expenseGradientId})`}
                                    name="Expense"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-3xl w-full">
                        <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">No monthly data yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
