import { useMemo, useState } from "react";
import { CheckCircle2, Plus, Trash2, WalletCards } from "lucide-react";
import { useFinanceData } from "../context/FinanceDataContext";
import { useToast } from "../components/ui/ToastContext";
import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";
import { formatCurrency, formatDate, toInputDate } from "../utils/format";
import { ListSkeleton } from "../components/Skeleton";

const initialForm = {
  loanName: "",
  principal: "",
  EMI: "",
  dueDate: toInputDate(new Date()),
  status: "active",
};

export default function Emi() {
  const { emis, collectionsLoading, addEmi, updateEmi, markEmiPaid, deleteEmi } = useFinanceData();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [loanForm, setLoanForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [paymentModal, setPaymentModal] = useState({ open: false, loanId: "", amount: "" });

  const activeLoans = useMemo(() => emis.filter((item) => item.status !== "closed"), [emis]);

  const openCreateModal = () => {
    setEditingLoan(null);
    setLoanForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (loan) => {
    setEditingLoan(loan);
    setLoanForm({
      loanName: loan.loanName || "",
      principal: String(loan.principal || ""),
      EMI: String(loan.EMI || ""),
      dueDate: loan.dueDate || toInputDate(new Date()),
      status: loan.status || "active",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingLoan(null);
    setLoanForm(initialForm);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!loanForm.loanName || !loanForm.principal || !loanForm.EMI || !loanForm.dueDate) {
      showToast({
        type: "error",
        title: "Missing fields",
        description: "All EMI fields are required.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        loanName: loanForm.loanName.trim(),
        principal: Number(loanForm.principal),
        EMI: Number(loanForm.EMI),
        dueDate: loanForm.dueDate,
        status: loanForm.status,
      };

      if (editingLoan?.id) {
        await updateEmi(editingLoan.id, payload);
      } else {
        await addEmi(payload);
      }

      closeModal();
      showToast({
        type: "success",
        title: editingLoan ? "EMI updated" : "EMI added",
        description: "Loan details saved.",
      });
    } catch {
      showToast({
        type: "error",
        title: "Unable to save EMI",
        description: "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async () => {
    try {
      await markEmiPaid(paymentModal.loanId, Number(paymentModal.amount));
      showToast({
        type: "success",
        title: "Payment logged",
        description: "EMI payment history updated.",
      });
    } catch {
      showToast({
        type: "error",
        title: "Payment failed",
        description: "Please try again.",
      });
    } finally {
      setPaymentModal({ open: false, loanId: "", amount: "" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEmi(deleteId);
      showToast({
        type: "success",
        title: "EMI removed",
        description: "Loan entry deleted successfully.",
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
        title="EMI Management"
        description="Track active loans, mark installments paid, and review payment history."
        actions={
          <button type="button" onClick={openCreateModal} className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="h-4 w-4" />
            Add EMI
          </button>
        }
      />

      {collectionsLoading ? (
        <ListSkeleton rows={5} />
      ) : activeLoans.length ? (
        <div className="space-y-3">
          {activeLoans.map((loan) => {
            const paidInstallments = Array.isArray(loan.paymentHistory) ? loan.paymentHistory.length : 0;
            return (
              <div key={loan.id} className="card p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-slate-900">{loan.loanName}</p>
                      <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">{loan.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Due date: {formatDate(loan.dueDate)}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <MiniInfo label="Principal" value={formatCurrency(loan.principal)} />
                      <MiniInfo label="EMI" value={formatCurrency(loan.EMI)} />
                      <MiniInfo label="Remaining" value={formatCurrency(loan.remainingBalance)} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentModal({
                          open: true,
                          loanId: loan.id,
                          amount: String(loan.EMI || 0),
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(loan)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(loan.id)}
                      className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Payment history</p>
                  {paidInstallments ? (
                    <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {loan.paymentHistory.slice().reverse().map((entry, index) => (
                        <div key={`${loan.id}-payment-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-sm font-semibold text-slate-900">{formatCurrency(entry.amount)}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatDate(entry.date)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">No payments logged yet.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No active EMI"
          description="Add your first EMI loan to monitor due dates, balances, and payment history."
          action={
            <button type="button" onClick={openCreateModal} className="btn-primary px-4 py-2 text-sm">
              Add EMI
            </button>
          }
        />
      )}

      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        Keep EMI records separate from daily tracking for cleaner debt visibility.
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingLoan ? "Edit EMI Loan" : "Add EMI Loan"}
        subtitle="Store core loan fields for payment tracking and remaining balance computation."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Loan name</span>
            <input
              className="input-field"
              value={loanForm.loanName}
              onChange={(event) => setLoanForm((current) => ({ ...current, loanName: event.target.value }))}
              placeholder="Car Loan"
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Principal</span>
              <input
                className="input-field"
                type="number"
                min="0"
                step="0.01"
                value={loanForm.principal}
                onChange={(event) => setLoanForm((current) => ({ ...current, principal: event.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Monthly EMI</span>
              <input
                className="input-field"
                type="number"
                min="0"
                step="0.01"
                value={loanForm.EMI}
                onChange={(event) => setLoanForm((current) => ({ ...current, EMI: event.target.value }))}
                required
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Due date</span>
              <input
                className="input-field"
                type="date"
                value={loanForm.dueDate}
                onChange={(event) => setLoanForm((current) => ({ ...current, dueDate: event.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Status</span>
              <select
                className="input-field"
                value={loanForm.status}
                onChange={(event) => setLoanForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeModal} className="btn-secondary px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary px-4 py-2 text-sm">
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={paymentModal.open}
        onClose={() => setPaymentModal({ open: false, loanId: "", amount: "" })}
        title="Mark EMI Paid"
        subtitle="Log this installment in payment history."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Paid amount</span>
            <input
              className="input-field"
              type="number"
              min="0"
              step="0.01"
              value={paymentModal.amount}
              onChange={(event) => setPaymentModal((current) => ({ ...current, amount: event.target.value }))}
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPaymentModal({ open: false, loanId: "", amount: "" })}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button type="button" onClick={handleMarkPaid} className="btn-primary px-4 py-2 text-sm">
              Save Payment
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete EMI loan?"
        description="This removes payment history for the selected loan."
        confirmLabel="Delete"
        onCancel={() => setDeleteId("")}
        onConfirm={handleDelete}
      />
    </section>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
