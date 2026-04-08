import React, { useMemo, useState } from "react";
import { CalendarClock, PiggyBank, Plus, Target, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { getDaysRemaining, getMonthsBetween } from "../../utils/finance";
import { formatTransactionDate, toInputDateValue } from "../../utils/transactionDate";

const initialGoalForm = {
    goalName: "",
    targetAmount: "",
    deadline: toInputDateValue(new Date(new Date().setMonth(new Date().getMonth() + 6))),
};

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getGoalMetrics = (goal) => {
    const targetAmount = Math.max(0, toNumber(goal.targetAmount));
    const currentSaved = Math.max(0, toNumber(goal.currentSaved));
    const progressPercent = targetAmount > 0 ? Math.min(100, (currentSaved / targetAmount) * 100) : 0;
    const daysRemaining = getDaysRemaining(goal.deadline);
    const monthsRemaining = Math.max(1, getMonthsBetween(new Date(), goal.deadline));
    const remainingAmount = Math.max(0, targetAmount - currentSaved);
    const requiredMonthlySaving = remainingAmount > 0 ? remainingAmount / monthsRemaining : 0;

    return {
        ...goal,
        targetAmount,
        currentSaved,
        progressPercent,
        daysRemaining,
        monthsRemaining,
        remainingAmount,
        requiredMonthlySaving,
    };
};

export default function SavingsGoalsSection({ goals = [], onAddGoal, onAddContribution, onDeleteGoal }) {
    const [goalForm, setGoalForm] = useState(initialGoalForm);
    const [contributionAmountByGoal, setContributionAmountByGoal] = useState({});
    const [saving, setSaving] = useState(false);
    const [updatingGoalId, setUpdatingGoalId] = useState("");

    const goalCards = useMemo(() => goals.map(getGoalMetrics), [goals]);

    const handleGoalChange = (event) => {
        const { name, value } = event.target;
        setGoalForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateGoal = async (event) => {
        event.preventDefault();
        const payload = {
            goalName: goalForm.goalName.trim(),
            targetAmount: toNumber(goalForm.targetAmount),
            deadline: goalForm.deadline,
        };

        if (!payload.goalName || payload.targetAmount <= 0 || !payload.deadline) {
            alert("Enter goal name, target amount, and deadline.");
            return;
        }

        setSaving(true);
        try {
            const result = await onAddGoal(payload);
            if (result !== false) {
                setGoalForm(initialGoalForm);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleContribution = async (goalId) => {
        const amount = toNumber(contributionAmountByGoal[goalId]);
        if (amount <= 0) {
            alert("Contribution amount must be greater than 0.");
            return;
        }

        setUpdatingGoalId(goalId);
        try {
            const result = await onAddContribution(goalId, amount);
            if (result !== false) {
                setContributionAmountByGoal((prev) => ({ ...prev, [goalId]: "" }));
            }
        } finally {
            setUpdatingGoalId("");
        }
    };

    return (
        <section className="glass rounded-3xl p-6 md:p-8 space-y-8">
            <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-text-primary">Savings Goals</h2>
                <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mt-1">
                    Set goals, track progress, and stay on schedule
                </p>
            </div>

            <form onSubmit={handleCreateGoal} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                    name="goalName"
                    value={goalForm.goalName}
                    onChange={handleGoalChange}
                    placeholder="Goal name (Bike, Laptop)"
                    className="bg-primary-bg border border-border rounded-xl px-3 py-2 text-sm font-semibold md:col-span-2"
                    required
                />
                <input
                    name="targetAmount"
                    value={goalForm.targetAmount}
                    onChange={handleGoalChange}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Target amount"
                    className="bg-primary-bg border border-border rounded-xl px-3 py-2 text-sm font-semibold"
                    required
                />
                <input
                    name="deadline"
                    value={goalForm.deadline}
                    onChange={handleGoalChange}
                    type="date"
                    className="bg-primary-bg border border-border rounded-xl px-3 py-2 text-sm font-semibold"
                    required
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-xs font-black uppercase tracking-widest px-4 py-3 flex items-center justify-center gap-2 md:col-span-4"
                >
                    <Plus size={14} />
                    {saving ? "Saving..." : "Create Goal"}
                </button>
            </form>

            {goalCards.length === 0 ? (
                <div className="border border-dashed border-border rounded-2xl p-8 text-center text-sm font-semibold text-text-secondary">
                    Add your first savings goal to track progress visually.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {goalCards.map((goal) => (
                        <article key={goal.id} className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                                        <Target size={16} className="text-accent" />
                                        {goal.goalName}
                                    </h3>
                                    <p className="text-sm text-text-secondary mt-1">
                                        {formatCurrency(goal.currentSaved)} saved of {formatCurrency(goal.targetAmount)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onDeleteGoal?.(goal.id)}
                                    className="p-2 rounded-lg text-text-secondary hover:text-rose-500 hover:bg-rose-500/10"
                                    title="Delete goal"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-bold text-text-secondary mb-1">
                                    <span>{goal.progressPercent.toFixed(1)}% complete</span>
                                    <span>{formatCurrency(goal.remainingAmount)} to go</span>
                                </div>
                                <div className="h-2 bg-primary-bg border border-border rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500"
                                        style={{ width: `${Math.min(100, Math.max(0, goal.progressPercent))}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                <div className="bg-primary-bg border border-border rounded-xl px-3 py-2">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">Days Left</p>
                                    <p className="font-black text-text-primary flex items-center gap-1">
                                        <CalendarClock size={14} className="text-accent" />
                                        {goal.daysRemaining ?? "N/A"}
                                    </p>
                                </div>
                                <div className="bg-primary-bg border border-border rounded-xl px-3 py-2">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">Need / Month</p>
                                    <p className="font-black text-text-primary">{formatCurrency(goal.requiredMonthlySaving)}</p>
                                </div>
                                <div className="bg-primary-bg border border-border rounded-xl px-3 py-2">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">Deadline</p>
                                    <p className="font-black text-text-primary">{formatTransactionDate(goal.deadline)}</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1">
                                    <PiggyBank size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={contributionAmountByGoal[goal.id] || ""}
                                        onChange={(event) =>
                                            setContributionAmountByGoal((prev) => ({
                                                ...prev,
                                                [goal.id]: event.target.value,
                                            }))
                                        }
                                        placeholder="Add amount"
                                        className="w-full bg-primary-bg border border-border rounded-xl pl-9 pr-3 py-2 text-sm font-semibold"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleContribution(goal.id)}
                                    disabled={updatingGoalId === goal.id}
                                    className="btn-secondary text-xs font-black uppercase tracking-widest px-4 py-2"
                                >
                                    {updatingGoalId === goal.id ? "Saving..." : "Add Money"}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
