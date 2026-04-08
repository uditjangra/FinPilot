import { parseTransactionDate } from "./transactionDate";

const toNumber = (value) => {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
};

export const toPositiveNumber = (value) => Math.max(0, toNumber(value));

export const monthKeyFromDate = (value) => {
    const date = parseTransactionDate(value);
    if (!date) {
        return null;
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const getMonthLabelFromKey = (monthKey) => {
    if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
        return "Unknown";
    }

    const [yearText, monthText] = monthKey.split("-");
    const year = Number(yearText);
    const month = Number(monthText);
    const date = new Date(year, month - 1, 1);

    return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

export const getCurrentMonthKey = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

export const monthKeyToDate = (monthKey, day = 1) => {
    if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
        return null;
    }

    const [yearText, monthText] = monthKey.split("-");
    const year = Number(yearText);
    const monthIndex = Number(monthText) - 1;
    const maxDay = new Date(year, monthIndex + 1, 0).getDate();
    const normalizedDay = Math.min(Math.max(1, Math.floor(toPositiveNumber(day))), maxDay);

    const date = new Date(year, monthIndex, normalizedDay);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const addMonthsToMonthKey = (monthKey, monthOffset) => {
    const baseDate = monthKeyToDate(monthKey, 1);
    if (!baseDate) {
        return null;
    }
    baseDate.setMonth(baseDate.getMonth() + Math.round(toNumber(monthOffset)));
    return monthKeyFromDate(baseDate);
};

export const generateMonthKeysFromStart = (startDateValue, tenureMonths) => {
    const startDate = parseTransactionDate(startDateValue);
    const months = Math.max(0, Math.floor(toPositiveNumber(tenureMonths)));

    if (!startDate || months <= 0) {
        return [];
    }

    const startKey = monthKeyFromDate(startDate);
    if (!startKey) {
        return [];
    }

    return Array.from({ length: months }, (_, index) => addMonthsToMonthKey(startKey, index)).filter(Boolean);
};

export const getNextDueMonthKey = (paymentMonthKeys = [], scheduleMonthKeys = []) => {
    const paidSet = new Set(paymentMonthKeys);
    return scheduleMonthKeys.find((monthKey) => !paidSet.has(monthKey)) || null;
};

export const calculateEmi = ({ principal, annualInterestRate, tenureMonths }) => {
    const p = toPositiveNumber(principal);
    const annualRate = toPositiveNumber(annualInterestRate);
    const n = Math.round(toPositiveNumber(tenureMonths));

    if (p <= 0 || n <= 0) {
        return 0;
    }

    const monthlyRate = annualRate / 1200;

    if (monthlyRate === 0) {
        return p / n;
    }

    const compounded = Math.pow(1 + monthlyRate, n);
    const emi = (p * monthlyRate * compounded) / (compounded - 1);
    return Number.isFinite(emi) ? emi : 0;
};

export const calculateLoanRemainingBalance = ({
    principal,
    annualInterestRate,
    tenureMonths,
    monthlyEmi,
    paidInstallments,
}) => {
    const p = toPositiveNumber(principal);
    const n = Math.max(1, Math.round(toPositiveNumber(tenureMonths)));
    const emi = toPositiveNumber(monthlyEmi);
    const paid = Math.max(0, Math.min(n, Math.floor(toPositiveNumber(paidInstallments))));
    const monthlyRate = toPositiveNumber(annualInterestRate) / 1200;

    if (p <= 0) {
        return 0;
    }

    if (monthlyRate === 0) {
        const remaining = p - emi * paid;
        return remaining > 0 ? remaining : 0;
    }

    const compounded = Math.pow(1 + monthlyRate, paid);
    const remaining = p * compounded - emi * ((compounded - 1) / monthlyRate);

    if (!Number.isFinite(remaining)) {
        return 0;
    }

    return remaining > 0 ? remaining : 0;
};

export const getDaysRemaining = (deadlineValue) => {
    const deadline = parseTransactionDate(deadlineValue);
    if (!deadline) {
        return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const normalizedDeadline = new Date(deadline);
    normalizedDeadline.setHours(0, 0, 0, 0);

    const diff = normalizedDeadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getMonthsBetween = (fromValue, toValue) => {
    const fromDate = parseTransactionDate(fromValue);
    const toDate = parseTransactionDate(toValue);
    if (!fromDate || !toDate) {
        return 0;
    }

    const yearDiff = toDate.getFullYear() - fromDate.getFullYear();
    const monthDiff = toDate.getMonth() - fromDate.getMonth();
    const months = yearDiff * 12 + monthDiff;
    return months >= 0 ? months + 1 : 0;
};

export const groupTransactionsByMonth = (transactions = []) => {
    const result = {};

    transactions.forEach((transaction) => {
        const monthKey = monthKeyFromDate(transaction.date);
        if (!monthKey) {
            return;
        }

        if (!result[monthKey]) {
            result[monthKey] = {
                monthKey,
                label: getMonthLabelFromKey(monthKey),
                income: 0,
                expense: 0,
                savings: 0,
            };
        }

        const amount = toPositiveNumber(transaction.amount);
        if (transaction.type === "income") {
            result[monthKey].income += amount;
        } else {
            result[monthKey].expense += amount;
        }

        result[monthKey].savings = result[monthKey].income - result[monthKey].expense;
    });

    return Object.values(result).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
};

export const getMonthlyCategoryBreakdown = (transactions = [], monthKey) => {
    const totals = {};
    transactions.forEach((transaction) => {
        if (transaction.type !== "expense") {
            return;
        }

        const transactionMonth = monthKeyFromDate(transaction.date);
        if (monthKey && transactionMonth !== monthKey) {
            return;
        }

        const category = transaction.category || "Misc";
        totals[category] = (totals[category] || 0) + toPositiveNumber(transaction.amount);
    });

    return Object.entries(totals)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
};

export const buildSpendingInsight = (transactions = [], monthKey) => {
    const expenses = transactions.filter((transaction) => {
        if (transaction.type !== "expense") {
            return false;
        }
        if (!monthKey) {
            return true;
        }
        return monthKeyFromDate(transaction.date) === monthKey;
    });

    const totalExpense = expenses.reduce((sum, transaction) => sum + toPositiveNumber(transaction.amount), 0);
    if (totalExpense <= 0) {
        return "No expense activity yet for the selected month.";
    }

    const categoryBreakdown = getMonthlyCategoryBreakdown(expenses);
    const topCategory = categoryBreakdown[0];
    const percentage = totalExpense > 0 ? (topCategory.amount / totalExpense) * 100 : 0;

    return `You are spending ${percentage.toFixed(1)}% on ${topCategory.category} this month.`;
};

export const getTopCategoryShare = (transactions = [], monthKey) => {
    const breakdown = getMonthlyCategoryBreakdown(transactions, monthKey);
    const total = breakdown.reduce((sum, item) => sum + item.amount, 0);
    if (total <= 0 || breakdown.length === 0) {
        return 0;
    }

    return (breakdown[0].amount / total) * 100;
};

export const computeFinancialHealthScore = ({
    savingsRate = 0,
    emiBurdenRate = 0,
    topCategoryShare = 0,
}) => {
    const boundedSavings = Math.max(0, Math.min(100, savingsRate));
    const boundedEmiBurden = Math.max(0, Math.min(100, emiBurdenRate));
    const boundedTopCategory = Math.max(0, Math.min(100, topCategoryShare));

    const score =
        boundedSavings * 0.5 +
        (100 - boundedEmiBurden) * 0.3 +
        (100 - boundedTopCategory) * 0.2;

    return Math.max(0, Math.min(100, score));
};
