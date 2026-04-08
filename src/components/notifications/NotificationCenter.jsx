import React, { useEffect, useMemo, useState } from "react";
import { Bell, BellRing, CalendarClock, CircleAlert, Mail, ShieldCheck } from "lucide-react";
import {
    generateMonthKeysFromStart,
    getCurrentMonthKey,
    getMonthLabelFromKey,
    getNextDueMonthKey,
    getTopCategoryShare,
    monthKeyToDate,
} from "../../utils/finance";
import { formatCurrency } from "../../utils/currency";
import { parseTransactionDate } from "../../utils/transactionDate";

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getReminders = ({ loans, goals, currentMonthKey, monthlyIncome, monthlyExpense, monthTransactions }) => {
    const reminders = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    loans.forEach((loan) => {
        const paymentHistory = Array.isArray(loan.paymentHistory) ? loan.paymentHistory : [];
        const paidMonthKeys = [...new Set(paymentHistory.map((item) => item.monthKey).filter(Boolean))];
        const schedule = generateMonthKeysFromStart(loan.startDate, loan.tenureMonths);
        const nextDueMonthKey = getNextDueMonthKey(paidMonthKeys, schedule);

        if (!nextDueMonthKey || nextDueMonthKey !== currentMonthKey) {
            return;
        }

        const dueDate = monthKeyToDate(currentMonthKey, loan.dueDay || 1);
        if (!dueDate) {
            return;
        }

        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
            reminders.push({
                id: `loan-overdue-${loan.id}`,
                level: "critical",
                title: `EMI overdue: ${loan.loanName}`,
                message: `EMI of ${formatCurrency(loan.monthlyEmi)} is overdue by ${Math.abs(diffDays)} day(s).`,
            });
            return;
        }

        if (diffDays <= 5) {
            reminders.push({
                id: `loan-due-${loan.id}`,
                level: "warning",
                title: `EMI due soon: ${loan.loanName}`,
                message: `EMI of ${formatCurrency(loan.monthlyEmi)} is due in ${diffDays} day(s).`,
            });
        }
    });

    goals.forEach((goal) => {
        const target = toNumber(goal.targetAmount);
        const saved = toNumber(goal.currentSaved);
        if (target <= 0 || saved >= target) {
            return;
        }

        const deadline = parseTransactionDate(goal.deadline);
        if (!deadline || Number.isNaN(deadline.getTime())) {
            return;
        }

        deadline.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 30) {
            return;
        }

        reminders.push({
            id: `goal-${goal.id}`,
            level: diffDays < 0 ? "critical" : "info",
            title: `Goal reminder: ${goal.goalName}`,
            message:
                diffDays < 0
                    ? `Deadline passed. ${formatCurrency(target - saved)} still remaining.`
                    : `${diffDays} day(s) left. ${formatCurrency(target - saved)} still needed.`,
        });
    });

    const summaryMonthLabel = getMonthLabelFromKey(currentMonthKey);
    const savings = monthlyIncome - monthlyExpense;
    const topCategoryShare = getTopCategoryShare(monthTransactions, currentMonthKey);
    reminders.push({
        id: `summary-${currentMonthKey}`,
        level: "summary",
        title: `${summaryMonthLabel} financial summary`,
        message: `Income ${formatCurrency(monthlyIncome)}, expense ${formatCurrency(monthlyExpense)}, savings ${formatCurrency(savings)}, top category share ${topCategoryShare.toFixed(1)}%.`,
    });

    return reminders;
};

const levelClassName = {
    critical: "bg-rose-500/10 border-rose-500/30 text-rose-500",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-500",
    info: "bg-accent/10 border-accent/30 text-accent",
    summary: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
};

export default function NotificationCenter({
    loans = [],
    goals = [],
    monthTransactions = [],
    monthlyIncome = 0,
    monthlyExpense = 0,
    selectedMonthKey = getCurrentMonthKey(),
}) {
    const [browserEnabled, setBrowserEnabled] = useState(false);
    const currentMonthKey = getCurrentMonthKey();

    const reminders = useMemo(
        () =>
            getReminders({
                loans,
                goals,
                currentMonthKey,
                monthlyIncome,
                monthlyExpense,
                monthTransactions,
            }),
        [loans, goals, currentMonthKey, monthlyIncome, monthlyExpense, monthTransactions]
    );

    useEffect(() => {
        if (!browserEnabled || typeof window === "undefined" || !("Notification" in window)) {
            return;
        }

        if (Notification.permission !== "granted") {
            return;
        }

        const today = new Date().toISOString().slice(0, 10);
        const key = `finance-notify-${today}`;
        if (window.localStorage.getItem(key)) {
            return;
        }

        const alertItems = reminders.filter((item) => item.level !== "summary").slice(0, 3);
        if (alertItems.length === 0) {
            return;
        }

        alertItems.forEach((item) => {
            new Notification(item.title, { body: item.message });
        });
        window.localStorage.setItem(key, "1");
    }, [browserEnabled, reminders]);

    const requestPermission = async () => {
        if (typeof window === "undefined" || !("Notification" in window)) {
            alert("Browser notifications are not supported on this device.");
            return;
        }

        const result = await Notification.requestPermission();
        setBrowserEnabled(result === "granted");
    };

    const monthlySavings = monthlyIncome - monthlyExpense;
    const emailBody = encodeURIComponent(
        `Monthly Summary (${getMonthLabelFromKey(selectedMonthKey)})\n\nIncome: ${formatCurrency(monthlyIncome)}\nExpense: ${formatCurrency(monthlyExpense)}\nSavings: ${formatCurrency(monthlySavings)}\n\nGenerated by FinanceX.`
    );
    const emailSubject = encodeURIComponent(`FinanceX Monthly Summary - ${getMonthLabelFromKey(selectedMonthKey)}`);

    return (
        <section className="glass rounded-3xl p-6 md:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-text-primary">Notifications</h2>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mt-1">
                        EMI reminders, goal nudges, and monthly summary
                    </p>
                </div>
                <button
                    type="button"
                    onClick={requestPermission}
                    className="btn-secondary text-xs font-black uppercase tracking-wider px-4 py-2 flex items-center gap-2"
                >
                    <BellRing size={14} />
                    Browser Alerts
                </button>
            </div>

            <div className="space-y-2">
                {reminders.length === 0 ? (
                    <div className="border border-dashed border-border rounded-xl p-5 text-sm font-semibold text-text-secondary">
                        You are all caught up. No reminders right now.
                    </div>
                ) : (
                    reminders.map((item) => (
                        <div
                            key={item.id}
                            className={`border rounded-xl px-4 py-3 ${levelClassName[item.level] || "border-border text-text-primary"}`}
                        >
                            <p className="font-black text-sm flex items-center gap-2">
                                {item.level === "critical" && <CircleAlert size={14} />}
                                {item.level === "warning" && <CalendarClock size={14} />}
                                {item.level === "info" && <Bell size={14} />}
                                {item.level === "summary" && <ShieldCheck size={14} />}
                                {item.title}
                            </p>
                            <p className="text-xs mt-1 font-semibold opacity-90">{item.message}</p>
                        </div>
                    ))
                )}
            </div>

            <a
                href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
                className="btn-primary inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider px-4 py-2"
            >
                <Mail size={14} />
                Send Monthly Summary Email
            </a>
        </section>
    );
}
