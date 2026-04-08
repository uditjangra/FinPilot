import React, { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, BriefcaseBusiness, CirclePlus, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { getMonthLabelFromKey } from "../../utils/finance";

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const initialSource = {
    name: "",
    amount: "",
    payoutDay: "",
};

export default function IncomeTrackerSection({
    incomeSources = [],
    selectedMonthKey,
    monthlyIncome = 0,
    monthlyExpense = 0,
    onAddIncomeSource,
    onDeleteIncomeSource,
    onLogIncomeFromSource,
}) {
    const [formData, setFormData] = useState(initialSource);
    const [saving, setSaving] = useState(false);
    const [loggingSourceId, setLoggingSourceId] = useState("");

    const projectedRecurringIncome = useMemo(
        () => incomeSources.reduce((sum, source) => sum + toNumber(source.amount), 0),
        [incomeSources]
    );

    const netCashFlow = monthlyIncome - monthlyExpense;

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddSource = async (event) => {
        event.preventDefault();
        const payload = {
            name: formData.name.trim(),
            amount: toNumber(formData.amount),
            payoutDay: Math.max(1, Math.min(31, Math.floor(toNumber(formData.payoutDay) || 1))),
        };

        if (!payload.name || payload.amount <= 0) {
            alert("Income source name and amount are required.");
            return;
        }

        setSaving(true);
        try {
            const result = await onAddIncomeSource(payload);
            if (result !== false) {
                setFormData(initialSource);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleLogIncome = async (source) => {
        setLoggingSourceId(source.id);
        try {
            await onLogIncomeFromSource(source);
        } finally {
            setLoggingSourceId("");
        }
    };

    return (
        <section className="glass rounded-3xl p-6 md:p-8 space-y-6">
            <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-text-primary">Income Tracker</h2>
                <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mt-1">
                    Multiple income sources with monthly cash-flow comparison
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-primary-bg border border-border rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Income ({getMonthLabelFromKey(selectedMonthKey)})</p>
                    <p className="text-xl font-black text-emerald-500 mt-1 flex items-center gap-1">
                        <ArrowUpRight size={18} />
                        {formatCurrency(monthlyIncome)}
                    </p>
                </div>
                <div className="bg-primary-bg border border-border rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Expense ({getMonthLabelFromKey(selectedMonthKey)})</p>
                    <p className="text-xl font-black text-rose-500 mt-1 flex items-center gap-1">
                        <ArrowDownRight size={18} />
                        {formatCurrency(monthlyExpense)}
                    </p>
                </div>
                <div className="bg-primary-bg border border-border rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Net Cash Flow</p>
                    <p className={`text-xl font-black mt-1 ${netCashFlow >= 0 ? "text-accent" : "text-rose-500"}`}>
                        {formatCurrency(netCashFlow)}
                    </p>
                </div>
            </div>

            <form onSubmit={handleAddSource} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Income source name"
                    className="bg-primary-bg border border-border rounded-xl px-3 py-2 text-sm font-semibold md:col-span-2"
                    required
                />
                <input
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Monthly amount"
                    className="bg-primary-bg border border-border rounded-xl px-3 py-2 text-sm font-semibold"
                    required
                />
                <input
                    name="payoutDay"
                    value={formData.payoutDay}
                    onChange={handleChange}
                    type="number"
                    min="1"
                    max="31"
                    step="1"
                    placeholder="Payout day"
                    className="bg-primary-bg border border-border rounded-xl px-3 py-2 text-sm font-semibold"
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-xs font-black uppercase tracking-widest px-4 py-3 flex items-center justify-center gap-2 md:col-span-4"
                >
                    <CirclePlus size={14} />
                    {saving ? "Saving..." : "Add Income Source"}
                </button>
            </form>

            <div className="bg-surface border border-border rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">Sources</h3>
                    <span className="text-xs font-bold text-text-secondary">
                        Projected recurring income: {formatCurrency(projectedRecurringIncome)}
                    </span>
                </div>
                {incomeSources.length === 0 ? (
                    <p className="text-sm text-text-secondary">No income sources added yet.</p>
                ) : (
                    <div className="space-y-2">
                        {incomeSources.map((source) => (
                            <div key={source.id} className="bg-primary-bg border border-border rounded-xl px-3 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <p className="font-black text-text-primary flex items-center gap-2">
                                        <BriefcaseBusiness size={14} className="text-accent" />
                                        {source.name}
                                    </p>
                                    <p className="text-xs text-text-secondary">
                                        {formatCurrency(source.amount)} monthly{source.payoutDay ? ` • Day ${source.payoutDay}` : ""}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleLogIncome(source)}
                                        disabled={loggingSourceId === source.id}
                                        className="btn-secondary text-[10px] font-black uppercase tracking-widest px-3 py-2"
                                    >
                                        {loggingSourceId === source.id ? "Logging..." : "Log This Month"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDeleteIncomeSource?.(source.id)}
                                        className="p-2 rounded-lg text-text-secondary hover:text-rose-500 hover:bg-rose-500/10"
                                        title="Delete income source"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
