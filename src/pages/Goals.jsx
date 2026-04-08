import { useState } from "react";
import { Plus, Target, Trash2 } from "lucide-react";
import { useFinanceData } from "../context/FinanceDataContext";
import { useToast } from "../components/ui/ToastContext";
import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";
import { ListSkeleton } from "../components/Skeleton";
import { daysUntil, formatCurrency, formatDate, monthsUntil, toInputDate } from "../utils/format";

const initialGoalForm = {
  goalName: "",
  targetAmount: "",
  currentAmount: "0",
  deadline: toInputDate(new Date(new Date().setMonth(new Date().getMonth() + 6))),
};

export default function Goals() {
  const { goals, collectionsLoading, addGoal, addGoalFunds, deleteGoal } = useFinanceData();
  const { showToast } = useToast();

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState(initialGoalForm);
  const [submitting, setSubmitting] = useState(false);
  const [fundModal, setFundModal] = useState({ open: false, goalId: "", amount: "" });
  const [deleteId, setDeleteId] = useState("");

  const openGoalModal = () => {
    setGoalForm(initialGoalForm);
    setGoalModalOpen(true);
  };

  const handleSaveGoal = async (event) => {
    event.preventDefault();
    if (!goalForm.goalName || !goalForm.targetAmount || !goalForm.deadline) {
      showToast({
        type: "error",
        title: "Missing fields",
        description: "Goal name, target amount and deadline are required.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await addGoal({
        goalName: goalForm.goalName,
        targetAmount: Number(goalForm.targetAmount),
        currentAmount: Number(goalForm.currentAmount || 0),
        deadline: goalForm.deadline,
      });
      setGoalModalOpen(false);
      showToast({
        type: "success",
        title: "Goal added",
        description: "Savings goal created successfully.",
      });
    } catch {
      showToast({
        type: "error",
        title: "Unable to add goal",
        description: "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFunds = async () => {
    try {
      await addGoalFunds(fundModal.goalId, Number(fundModal.amount));
      showToast({
        type: "success",
        title: "Funds added",
        description: "Goal progress updated.",
      });
    } catch {
      showToast({
        type: "error",
        title: "Failed to add funds",
        description: "Please try again.",
      });
    } finally {
      setFundModal({ open: false, goalId: "", amount: "" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGoal(deleteId);
      showToast({
        type: "success",
        title: "Goal deleted",
        description: "Savings goal removed.",
      });
    } catch {
      showToast({
        type: "error",
        title: "Delete failed",
        description: "Please try again.",
      });
    } finally {
      setDeleteId("");
    }
  };

  return (
    <section>
      <PageHeader
        title="Savings Goals"
        description="Track goal progress, contribution history, and required monthly pace."
        actions={
          <button type="button" onClick={openGoalModal} className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="h-4 w-4" />
            Add Goal
          </button>
        }
      />

      {collectionsLoading ? (
        <ListSkeleton rows={4} />
      ) : goals.length ? (
        <div className="space-y-3">
          {goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
            const monthCount = monthsUntil(goal.deadline);
            const requiredMonthly = monthCount > 0 ? remaining / monthCount : remaining;
            const daysLeft = daysUntil(goal.deadline);

            return (
              <div key={goal.id} className="card p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-600" />
                      <p className="text-lg font-semibold text-slate-900">{goal.goalName}</p>
                      <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Deadline: {formatDate(goal.deadline)}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFundModal({ open: true, goalId: goal.id, amount: "" })}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700"
                    >
                      Add Funds
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(goal.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">
                      {formatCurrency(goal.currentAmount)} saved of {formatCurrency(goal.targetAmount)}
                    </span>
                    <span className="text-slate-500">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <MiniCard label="Remaining" value={formatCurrency(remaining)} />
                  <MiniCard
                    label="Required / month"
                    value={formatCurrency(requiredMonthly)}
                    helper={monthCount ? `${monthCount} month(s) left` : "Deadline reached"}
                  />
                  <MiniCard
                    label="Deadline tracking"
                    value={typeof daysLeft === "number" ? `${daysLeft} days` : "N/A"}
                    helper={daysLeft !== null && daysLeft < 0 ? "Past due" : undefined}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No savings goals"
          description="Create your first goal and fund it over time with monthly milestones."
          action={
            <button type="button" onClick={openGoalModal} className="btn-primary px-4 py-2 text-sm">
              Add goal
            </button>
          }
        />
      )}

      <Modal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title="Add Savings Goal"
        subtitle="Define target amount, current saved amount, and deadline."
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Goal name</span>
            <input
              className="input-field"
              value={goalForm.goalName}
              onChange={(event) => setGoalForm((current) => ({ ...current, goalName: event.target.value }))}
              placeholder="Emergency Fund"
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Target amount</span>
              <input
                className="input-field"
                type="number"
                min="0"
                step="0.01"
                value={goalForm.targetAmount}
                onChange={(event) => setGoalForm((current) => ({ ...current, targetAmount: event.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Current amount</span>
              <input
                className="input-field"
                type="number"
                min="0"
                step="0.01"
                value={goalForm.currentAmount}
                onChange={(event) => setGoalForm((current) => ({ ...current, currentAmount: event.target.value }))}
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Deadline</span>
            <input
              className="input-field"
              type="date"
              value={goalForm.deadline}
              onChange={(event) => setGoalForm((current) => ({ ...current, deadline: event.target.value }))}
              required
            />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setGoalModalOpen(false)} className="btn-secondary px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary px-4 py-2 text-sm">
              {submitting ? "Saving..." : "Save Goal"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={fundModal.open}
        onClose={() => setFundModal({ open: false, goalId: "", amount: "" })}
        title="Add Goal Funds"
        subtitle="Update current savings amount with a new contribution."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Contribution amount</span>
            <input
              className="input-field"
              type="number"
              min="0"
              step="0.01"
              value={fundModal.amount}
              onChange={(event) => setFundModal((current) => ({ ...current, amount: event.target.value }))}
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFundModal({ open: false, goalId: "", amount: "" })}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button type="button" onClick={handleAddFunds} className="btn-primary px-4 py-2 text-sm">
              Add
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete savings goal?"
        description="This will remove the goal and contribution history."
        confirmLabel="Delete"
        onCancel={() => setDeleteId("")}
        onConfirm={handleDelete}
      />
    </section>
  );
}

function MiniCard({ label, value, helper }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
      {helper ? <p className="mt-0.5 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}
