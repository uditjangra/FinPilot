import React, { useMemo } from "react";
import { Download, Filter, PieChart as PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "../../utils/currency";
import {
    getCurrentMonthKey,
    getMonthLabelFromKey,
    getMonthlyCategoryBreakdown,
    monthKeyFromDate,
} from "../../utils/finance";
import { toInputDateValue } from "../../utils/transactionDate";

const CHART_COLORS = ["#0b63f6", "#14b8a6", "#f97316", "#ef4444", "#22c55e", "#a855f7", "#06b6d4"];

const toCsvValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export default function MonthlyExpenseSection({
    transactions = [],
    selectedMonthKey = getCurrentMonthKey(),
    onMonthChange,
    availableMonthKeys = [],
}) {
    const monthlyExpenseTransactions = useMemo(
        () =>
            transactions.filter(
                (transaction) =>
                    transaction.type === "expense" && monthKeyFromDate(transaction.date) === selectedMonthKey
            ),
        [transactions, selectedMonthKey]
    );

    const categoryBreakdown = useMemo(
        () => getMonthlyCategoryBreakdown(transactions, selectedMonthKey),
        [transactions, selectedMonthKey]
    );

    const totalExpense = categoryBreakdown.reduce((sum, item) => sum + item.amount, 0);

    const exportCsv = () => {
        const headers = ["Date", "Category", "Title", "Amount"];
        const rows = monthlyExpenseTransactions.map((transaction) => [
            toInputDateValue(transaction.date, ""),
            transaction.category || "Misc",
            transaction.title || "Untitled",
            Number(transaction.amount || 0).toFixed(2),
        ]);

        const csvString = [headers, ...rows]
            .map((row) => row.map((cell) => toCsvValue(cell)).join(","))
            .join("\n");

        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `expenses_${selectedMonthKey}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <section className="glass rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-text-primary">Monthly Expense Tracker</h2>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mt-1">
                        Filter by month, view category pie chart, and export CSV
                    </p>
                </div>
                <button
                    type="button"
                    onClick={exportCsv}
                    className="btn-secondary text-xs font-black uppercase tracking-widest px-4 py-2 flex items-center gap-2"
                >
                    <Download size={14} />
                    Export CSV
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <select
                        value={selectedMonthKey}
                        onChange={(event) => onMonthChange(event.target.value)}
                        className="category-select pr-10 min-w-[180px] text-xs font-bold uppercase tracking-wider"
                    >
                        {availableMonthKeys.map((monthKey) => (
                            <option key={monthKey} value={monthKey}>
                                {getMonthLabelFromKey(monthKey)}
                            </option>
                        ))}
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={14} />
                </div>
                <span className="text-sm font-semibold text-text-secondary">
                    Total expense: <strong className="text-text-primary">{formatCurrency(totalExpense)}</strong>
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface border border-border rounded-2xl p-4">
                    <h3 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                        <PieChartIcon size={14} className="text-accent" />
                        Category Breakdown
                    </h3>
                    {categoryBreakdown.length === 0 ? (
                        <div className="h-64 border border-dashed border-border rounded-xl flex items-center justify-center text-sm text-text-secondary">
                            No expenses found for this month.
                        </div>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryBreakdown} dataKey="amount" nameKey="category" innerRadius={56} outerRadius={96}>
                                        {categoryBreakdown.map((entry, index) => (
                                            <Cell key={entry.category} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="bg-surface border border-border rounded-2xl p-4">
                    <h3 className="text-sm font-black uppercase tracking-wider mb-4">Expense Entries</h3>
                    {monthlyExpenseTransactions.length === 0 ? (
                        <div className="h-64 border border-dashed border-border rounded-xl flex items-center justify-center text-sm text-text-secondary">
                            No entries for the selected month.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-auto pr-1">
                            {monthlyExpenseTransactions
                                .sort((a, b) => {
                                    const timeA = new Date(a.date || 0).getTime();
                                    const timeB = new Date(b.date || 0).getTime();
                                    return timeB - timeA;
                                })
                                .map((transaction) => (
                                    <div key={transaction.id} className="bg-primary-bg border border-border rounded-xl px-3 py-2 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-black text-text-primary">{transaction.title || "Untitled"}</p>
                                            <p className="text-xs font-semibold text-text-secondary">{transaction.category || "Misc"}</p>
                                        </div>
                                        <p className="text-sm font-black text-rose-500">{formatCurrency(transaction.amount)}</p>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
