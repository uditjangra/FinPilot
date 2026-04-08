import React, { useId, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Cell,
    PieChart,
    Pie,
} from "recharts";
import { formatCurrency, formatCurrencyRounded } from "../utils/currency";
import { parseTransactionDate } from "../utils/transactionDate";

const PIE_COLORS = ["#0b63f6", "#14b8a6", "#f97316", "#ef4444", "#8b5cf6", "#f59e0b", "#06b6d4"];

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const ChartContainer = ({ title, children }) => (
    <div className="bg-surface p-5 sm:p-6 rounded-2xl shadow-sm border border-border">
        <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-5 font-display">{title}</h3>
        <div className="h-[290px] sm:h-[340px] w-full">{children}</div>
    </div>
);

const EmptyChart = ({ message }) => (
    <div className="h-full w-full border border-dashed border-border rounded-xl flex items-center justify-center">
        <p className="text-xs font-semibold text-text-secondary">{message}</p>
    </div>
);

export default function DetailedCharts({ transactions }) {
    const lineGradientId = `${useId().replace(/:/g, "")}-line`;

    const { lineData, radarData, pieData, hasTransactions } = useMemo(() => {
        const validTransactions = transactions
            .filter((transaction) => Boolean(parseTransactionDate(transaction.date)))
            .sort((a, b) => {
                const timeA = parseTransactionDate(a.date)?.getTime() ?? 0;
                const timeB = parseTransactionDate(b.date)?.getTime() ?? 0;
                return timeA - timeB;
            });

        const computedLineData = validTransactions.reduce((accumulator, transaction) => {
            const parsedDate = parseTransactionDate(transaction.date);
            if (!parsedDate) {
                return accumulator;
            }

            const amount = toNumber(transaction.amount);
            const lastBalance = accumulator.length > 0 ? accumulator[accumulator.length - 1].balance : 0;
            const nextBalance = lastBalance + (transaction.type === "income" ? amount : -amount);

            accumulator.push({
                label: parsedDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
                balance: nextBalance,
                amount,
                type: transaction.type,
            });

            return accumulator;
        }, []);

        const categoryTotals = validTransactions.reduce((accumulator, transaction) => {
            if (transaction.type !== "expense") {
                return accumulator;
            }

            const category = transaction.category || "Other";
            accumulator[category] = (accumulator[category] || 0) + toNumber(transaction.amount);
            return accumulator;
        }, {});

        const maxCategoryValue = Math.max(0, ...Object.values(categoryTotals));

        const computedRadarData = Object.entries(categoryTotals).map(([category, amount]) => ({
            subject: category,
            amount,
            fullMark: maxCategoryValue * 1.15 || 100,
        }));

        const computedPieData = Object.entries(categoryTotals).map(([name, value]) => ({
            name,
            value,
        }));

        return {
            lineData: computedLineData,
            radarData: computedRadarData,
            pieData: computedPieData,
            hasTransactions: validTransactions.length > 0,
        };
    }, [transactions]);

    return (
        <div className="space-y-8">
            <ChartContainer title="Net Balance Trend">
                {hasTransactions ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={lineGradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--theme-chart-income)" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="var(--theme-chart-income)" stopOpacity={0.2} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-chart-grid)" />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: "var(--theme-text-secondary)", fontSize: 11, fontWeight: 700 }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={28}
                            />
                            <YAxis
                                tick={{ fill: "var(--theme-text-secondary)", fontSize: 11, fontWeight: 700 }}
                                tickLine={false}
                                axisLine={false}
                                width={78}
                                tickFormatter={(value) => formatCurrencyRounded(value)}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "1px solid var(--theme-border)", background: "var(--theme-surface-solid)" }}
                                formatter={(value) => [formatCurrency(value), "Balance"]}
                            />
                            <Line
                                type="monotone"
                                dataKey="balance"
                                stroke={`url(#${lineGradientId})`}
                                strokeWidth={3}
                                dot={{ fill: "var(--theme-chart-income)", strokeWidth: 2, r: 4, stroke: "var(--theme-surface-solid)" }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: "var(--theme-chart-income)" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyChart message="Add transactions to unlock trend insights." />
                )}
            </ChartContainer>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="Spending Habits">
                    {radarData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="76%" data={radarData}>
                                <PolarGrid stroke="var(--theme-chart-grid)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--theme-text-secondary)", fontSize: 11, fontWeight: 700 }} />
                                <PolarRadiusAxis angle={24} domain={[0, "auto"]} tick={false} axisLine={false} />
                                <Radar
                                    name="Spending"
                                    dataKey="amount"
                                    stroke="var(--theme-chart-income)"
                                    fill="var(--theme-chart-income)"
                                    fillOpacity={0.45}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: "12px", border: "1px solid var(--theme-border)", background: "var(--theme-surface-solid)" }}
                                    formatter={(value) => [formatCurrency(value), "Spending"]}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart message="No expense categories yet." />
                    )}
                </ChartContainer>

                <ChartContainer title="Expense Allocation">
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={64}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} cornerRadius={5} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: "12px", border: "1px solid var(--theme-border)", background: "var(--theme-surface-solid)" }}
                                    formatter={(value, name) => [formatCurrency(value), name]}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={28}
                                    wrapperStyle={{ color: "var(--theme-text-secondary)", fontSize: "12px", fontWeight: 600 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart message="No expense allocation data available." />
                    )}
                </ChartContainer>
            </div>
        </div>
    );
}
