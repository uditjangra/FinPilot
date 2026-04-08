import React, { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Circle, Landmark, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import {
    calculateEmi,
    calculateLoanRemainingBalance,
    generateMonthKeysFromStart,
    getCurrentMonthKey,
    getMonthLabelFromKey,
    getNextDueMonthKey,
    monthKeyToDate,
} from "../../utils/finance";
import { toInputDateValue } from "../../utils/transactionDate";

const initialForm = {
    loanName: "",
    totalLoanAmount: "",
    interestRate: "",
    tenureMonths: "",
    monthlyEmi: "",
    dueDay: "",
    startDate: toInputDateValue(new Date()),
};

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getLoanViewModel = (loan, selectedMonthKey) => {
    const paymentHistory = Array.isArray(loan.paymentHistory) ? loan.paymentHistory : [];
    const paymentMonthKeys = [...new Set(paymentHistory.map((item) => item.monthKey).filter(Boolean))];
    const scheduleMonths = generateMonthKeysFromStart(loan.startDate, loan.tenureMonths);
    const nextDueMonthKey = getNextDueMonthKey(paymentMonthKeys, scheduleMonths);
    const selectedMonthPaid = paymentMonthKeys.includes(selectedMonthKey);
    const dueInSelectedMonth = scheduleMonths.includes(selectedMonthKey);

    const paidInstallments = paymentMonthKeys.length;
    const totalInstallments = Math.max(0, Math.floor(toNumber(loan.tenureMonths)));
    const remainingBalance = calculateLoanRemainingBalance({
        principal: loan.totalLoanAmount,
        annualInterestRate: loan.interestRate,
        tenureMonths: loan.tenureMonths,
        monthlyEmi: loan.monthlyEmi,
        paidInstallments,
    });

    return {
        ...loan,
        paymentHistory,
        paymentMonthKeys,
        scheduleMonths,
        nextDueMonthKey,
        selectedMonthPaid,
        dueInSelectedMonth,
        paidInstallments,
        totalInstallments,
        remainingBalance,
        progressPercent: totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0,
    };
};

export default function EmiTrackerSection({
    loans = [],
    selectedMonthKey = getCurrentMonthKey(),
    onAddLoan,
    onMarkLoanPaid,
    onDeleteLoan,
}) {
    const [formData, setFormData] = useState(initialForm);
    const [autoCalculate, setAutoCalculate] = useState(true);
    const [saving, setSaving] = useState(false);

    const calculatedEmi = useMemo(
        () =>
            calculateEmi({
                principal: formData.totalLoanAmount,
                annualInterestRate: formData.interestRate,
                tenureMonths: formData.tenureMonths,
            }),
        [formData.totalLoanAmount, formData.interestRate, formData.tenureMonths]
    );

    const normalizedLoans = useMemo(
        () => loans.map((loan) => getLoanViewModel(loan, selectedMonthKey)),
        [loans, selectedMonthKey]
    );

    const selectedMonthDate = monthKeyToDate(selectedMonthKey, 1) || monthKeyToDate(getCurrentMonthKey(), 1) || new Date();
    const daysInMonth = new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth() + 1, 0).getDate();
    const calendarDays = Array.from({ length: daysInMonth }, (_, index) => index + 1);

    const dueByDay = useMemo(() => {
        const map = {};
        normalizedLoans.forEach((loan) => {
            if (!loan.dueInSelectedMonth) {
                return;
            }

            const day = Math.max(1, Math.min(daysInMonth, Math.floor(toNumber(loan.dueDay)) || 1));
            if (!map[day]) {
                map[day] = { total: 0, paid: 0 };
            }
            map[day].total += 1;
            if (loan.selectedMonthPaid) {
                map[day].paid += 1;
            }
        });
        return map;
    }, [normalizedLoans, daysInMonth]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            loanName: formData.loanName.trim(),
            totalLoanAmount: toNumber(formData.totalLoanAmount),
            interestRate: toNumber(formData.interestRate),
            tenureMonths: Math.max(1, Math.round(toNumber(formData.tenureMonths))),
            monthlyEmi: autoCalculate ? calculatedEmi : toNumber(formData.monthlyEmi),
            dueDay: Math.max(1, Math.min(31, Math.round(toNumber(formData.dueDay)))),
            startDate: formData.startDate,
        };

        if (!payload.loanName || payload.totalLoanAmount <= 0 || payload.monthlyEmi <= 0 || !payload.startDate) {
            alert("Please fill valid loan details before saving.");
            return;
        }

        setSaving(true);
        try {
            const result = await onAddLoan(payload);
            if (result !== false) {
                setFormData(initialForm);
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="glass rounded-3xl p-6 md:p-8 space-y-8">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-text-primary">EMI Tracker</h2>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mt-1">
                        Loan management, payment history and calendar view
                    </p>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                    {getMonthLabelFromKey(selectedMonthKey)}
                </span>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
                <input
                    name="loanName"
                    value={formData.loanName}
                    onChange={handleChange}
                    placeholder="Loan name"
                    className="bg-primary-bg border border-border rounded-xl px-3 py-2 text-sm font-semibold"
                    required
                />
                <input
                    name="totalLoanAmount"
                    value={formData.totalLoanAmount}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Loan amount"
                    className="bg-primary-bg border border-border rounded-xl px-3 py-2 text-sm font-semibold"
                    required
                />
                <input
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Interest %"
                    className="bg-primary-bg border border-border rounded-xl px-3 py-2 text-sm font-semibold"
                    required
                />
                <input
                    name="tenureMonths"
                    value={formData.tenureMonths}
                    onChange={handleChange}
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Tenure (months)"
                    className="bg-primary-bg border border-border rounded-xl px-3 py-2 text-sm font-semibold"
                    required
                />
                <input
                    name="dueDay"
                    value={formData.dueDay}
                    onChange={handleChange}
                    type="number"
                    min="1"
                    max="31"
                    step="1"
                    placeholder="Due day"
                    className="bg-primary-bg border border-border rounded-xl px-3 py-2 text-sm font-semibold"
                    required
                />
                <input
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    type="date"
                    className="bg-primary-bg border border-border rounded-xl px-3 py-2 text-sm font-semibold"
                    required
                />
                <div className="bg-primary-bg border border-border rounded-xl px-3 py-2 text-sm font-semibold flex items-center justify-between gap-3">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Monthly EMI</p>
                        <p className="text-sm font-black text-text-primary">
                            {autoCalculate ? formatCurrency(calculatedEmi) : formatCurrency(formData.monthlyEmi || 0)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setAutoCalculate((prev) => !prev)}
                        className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-border hover:border-accent/40"
                    >
                        {autoCalculate ? "Auto" : "Manual"}
                    </button>
                </div>
                {!autoCalculate && (
                    <input
                        name="monthlyEmi"
                        value={formData.monthlyEmi}
                        onChange={handleChange}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Manual EMI"
                        className="bg-primary-bg border border-border rounded-xl px-3 py-2 text-sm font-semibold md:col-span-2 xl:col-span-2"
                        required
                    />
                )}
                <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-xs font-black uppercase tracking-widest px-4 py-3 flex items-center justify-center gap-2 md:col-span-2 xl:col-span-1"
                >
                    <Plus size={14} />
                    {saving ? "Saving..." : "Add EMI"}
                </button>
            </form>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-4">
                    {normalizedLoans.length === 0 ? (
                        <div className="border border-dashed border-border rounded-2xl p-8 text-center text-sm font-semibold text-text-secondary">
                            Add your first loan to start EMI tracking.
                        </div>
                    ) : (
                        normalizedLoans.map((loan) => {
                            const nextDueDate = loan.nextDueMonthKey ? monthKeyToDate(loan.nextDueMonthKey, loan.dueDay) : null;
                            const history = [...loan.paymentHistory].sort((a, b) => {
                                const timeA = new Date(a.paidOn || 0).getTime();
                                const timeB = new Date(b.paidOn || 0).getTime();
                                return timeB - timeA;
                            });

                            return (
                                <article key={loan.id} className="bg-surface border border-border rounded-2xl p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-black text-text-primary">{loan.loanName}</h3>
                                            <p className="text-xs font-semibold text-text-secondary mt-1">
                                                {formatCurrency(loan.monthlyEmi)} EMI • {loan.paidInstallments}/{loan.totalInstallments} paid
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onDeleteLoan?.(loan.id)}
                                            className="p-2 rounded-lg text-text-secondary hover:text-rose-500 hover:bg-rose-500/10"
                                            title="Delete loan"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="mt-4 h-2 bg-primary-bg rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent"
                                            style={{ width: `${Math.min(100, Math.max(0, loan.progressPercent))}%` }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
                                        <div className="bg-primary-bg border border-border rounded-xl px-3 py-2">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">Remaining Balance</p>
                                            <p className="font-black text-text-primary">{formatCurrency(loan.remainingBalance)}</p>
                                        </div>
                                        <div className="bg-primary-bg border border-border rounded-xl px-3 py-2">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">Next Due</p>
                                            <p className="font-black text-text-primary">
                                                {nextDueDate ? nextDueDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Completed"}
                                            </p>
                                        </div>
                                        <div className="bg-primary-bg border border-border rounded-xl px-3 py-2">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">This Month</p>
                                            <p className={`font-black ${loan.selectedMonthPaid ? "text-emerald-500" : "text-rose-500"}`}>
                                                {loan.dueInSelectedMonth ? (loan.selectedMonthPaid ? "Paid" : "Due") : "No EMI"}
                                            </p>
                                        </div>
                                    </div>

                                    {loan.dueInSelectedMonth && !loan.selectedMonthPaid && (
                                        <button
                                            type="button"
                                            onClick={() => onMarkLoanPaid(loan.id, selectedMonthKey, loan.monthlyEmi)}
                                            className="mt-4 btn-secondary text-xs font-black uppercase tracking-wider px-4 py-2"
                                        >
                                            Mark Paid for {getMonthLabelFromKey(selectedMonthKey)}
                                        </button>
                                    )}

                                    <div className="mt-4">
                                        <p className="text-[10px] uppercase tracking-widest font-black text-text-secondary mb-2">Payment History</p>
                                        {history.length === 0 ? (
                                            <p className="text-sm text-text-secondary">No payments recorded yet.</p>
                                        ) : (
                                            <div className="space-y-2 max-h-28 overflow-auto pr-1">
                                                {history.slice(0, 5).map((entry) => (
                                                    <div key={`${entry.monthKey}-${entry.paidOn}`} className="flex items-center justify-between text-xs bg-primary-bg border border-border rounded-lg px-3 py-2">
                                                        <span className="font-semibold text-text-primary">{getMonthLabelFromKey(entry.monthKey)}</span>
                                                        <span className="font-semibold text-text-secondary">{formatCurrency(entry.amount || loan.monthlyEmi)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>

                <div className="bg-surface border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarDays size={16} className="text-accent" />
                        <h3 className="text-sm font-black uppercase tracking-wider">EMI Calendar View</h3>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center">
                        {calendarDays.map((day) => {
                            const dayData = dueByDay[day];
                            const hasDue = Boolean(dayData?.total);
                            const isPaid = hasDue && dayData.paid === dayData.total;

                            return (
                                <div
                                    key={day}
                                    className={`rounded-lg border p-2 ${hasDue ? "border-accent/30 bg-accent/5" : "border-border bg-primary-bg"}`}
                                >
                                    <p className="text-[10px] font-bold text-text-secondary">{day}</p>
                                    {hasDue ? (
                                        <div className="mt-1 flex justify-center">
                                            {isPaid ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Circle size={12} className="text-rose-500" />}
                                        </div>
                                    ) : (
                                        <div className="mt-1 h-3" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[10px] font-semibold text-text-secondary mt-3">
                        Filled circles indicate EMI due dates. Green means paid, red means pending.
                    </p>
                </div>
            </div>
        </section>
    );
}
