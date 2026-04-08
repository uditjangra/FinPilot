import { useMemo, useState } from "react";
import { Plus, Search, Trash2, PencilLine } from "lucide-react";
import { useFinanceData } from "../context/FinanceDataContext";
import { useToast } from "../components/ui/ToastContext";
import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";
import { ListSkeleton } from "../components/Skeleton";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../constants/onboarding";
import { formatCurrency, formatDate, getMonthKey, toInputDate } from "../utils/format";

const initialForm = {
  amount: "",
  categoryOrSource: "",
  date: toInputDate(new Date()),
  note: "",
};

export default function Tracking() {
  const {
    expenses,
    income,
    collectionsLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
  } = useFinanceData();
  const { showToast } = useToast();

  const [tab, setTab] = useState("expenses");
  const [monthFilter, setMonthFilter] = useState(getMonthKey(new Date()));
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [deleteState, setDeleteState] = useState({ open: false, id: "", type: "expenses" });
  const [submitting, setSubmitting] = useState(false);

  const list = tab === "expenses" ? expenses : income;
  const options = tab === "expenses" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const matchesMonth = !monthFilter || (item.date || "").slice(0, 7) === monthFilter;
      const categoryField = tab === "expenses" ? item.category : item.source;
      const matchesCategory = categoryFilter === "all" || categoryField === categoryFilter;
      const normalizedSearch = search.trim().toLowerCase();
      const note = (item.note || "").toLowerCase();
      const matchesSearch = !normalizedSearch || categoryField?.toLowerCase().includes(normalizedSearch) || note.includes(normalizedSearch);
      return matchesMonth && matchesCategory && matchesSearch;
    });
  }, [list, tab, monthFilter, categoryFilter, search]);

  const totals = useMemo(
    () => ({
      amount: filteredList.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      count: filteredList.length,
    }),
    [filteredList]
  );

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      ...initialForm,
      categoryOrSource: options[0],
      date: toInputDate(new Date()),
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      amount: String(item.amount || ""),
      categoryOrSource: tab === "expenses" ? item.category : item.source,
      date: item.date || toInputDate(new Date()),
      note: item.note || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setForm(initialForm);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.amount || !form.categoryOrSource || !form.date) {
      showToast({
        type: "error",
        title: "Missing fields",
        description: "Amount, category/source, and date are required.",
      });
      return;
    }

    setSubmitting(true);
    const payload = {
      amount: Number(form.amount),
      note: form.note,
      date: form.date,
    };

    try {
      if (tab === "expenses") {
        const expensePayload = { ...payload, category: form.categoryOrSource };
        if (editingItem?.id) {
          await updateExpense(editingItem.id, expensePayload);
        } else {
          await addExpense(expensePayload);
        }
      } else {
        const incomePayload = { ...payload, source: form.categoryOrSource };
        if (editingItem?.id) {
          await updateIncome(editingItem.id, incomePayload);
        } else {
          await addIncome(incomePayload);
        }
      }

      closeModal();
      showToast({
        type: "success",
        title: editingItem ? "Entry updated" : "Entry added",
        description: "Tracking data was saved successfully.",
      });
    } catch {
      showToast({
        type: "error",
        title: "Save failed",
        description: "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteState.type === "expenses") {
        await deleteExpense(deleteState.id);
      } else {
        await deleteIncome(deleteState.id);
      }
      showToast({
        type: "success",
        title: "Entry deleted",
        description: "The record was removed.",
      });
    } catch {
      showToast({
        type: "error",
        title: "Delete failed",
        description: "Please try again.",
      });
    } finally {
      setDeleteState({ open: false, id: "", type: tab });
    }
  };

  return (
    <section>
      <PageHeader
        title="Tracking"
        description="Manage expenses and income with clean filters and inline actions."
        actions={
          <button type="button" onClick={openCreateModal} className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="h-4 w-4" />
            Add {tab === "expenses" ? "Expense" : "Income"}
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <TabButton active={tab === "expenses"} label="Expenses" onClick={() => setTab("expenses")} />
        <TabButton active={tab === "income"} label="Income" onClick={() => setTab("income")} />
      </div>

      <div className="card mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="month-filter">
            Month filter
          </label>
          <input
            id="month-filter"
            type="month"
            className="input-field"
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
          />
          <select className="input-field" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All {tab === "expenses" ? "categories" : "sources"}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-9"
            placeholder={`Search ${tab === "expenses" ? "category" : "source"} or note`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Entries in view</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totals.count}</p>
        </div>
        <div className="card">
          <p className="text-xs uppercase tracking-wide text-slate-500">{tab === "expenses" ? "Total Expense" : "Total Income"}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totals.amount)}</p>
        </div>
      </div>

      {collectionsLoading ? (
        <ListSkeleton rows={6} />
      ) : filteredList.length ? (
        <div className="space-y-2">
          {filteredList.map((item) => {
            const heading = tab === "expenses" ? item.category : item.source;
            return (
              <div key={item.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{heading}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatDate(item.date)}
                    {item.note ? ` · ${item.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="mr-2 text-sm font-semibold text-slate-900">{formatCurrency(item.amount)}</p>
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                  >
                    <PencilLine className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteState({ open: true, id: item.id, type: tab })}
                    className="rounded-lg border border-rose-100 p-2 text-rose-500 transition hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={`No ${tab} records`}
          description={`Start adding ${tab === "expenses" ? "expenses" : "income"} to build your monthly performance data.`}
          action={
            <button type="button" onClick={openCreateModal} className="btn-primary px-4 py-2 text-sm">
              Add first entry
            </button>
          }
        />
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingItem ? `Edit ${tab === "expenses" ? "Expense" : "Income"}` : `Add ${tab === "expenses" ? "Expense" : "Income"}`}
        subtitle="Keep records clean with category/source and date metadata."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Amount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                value={form.amount}
                onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">{tab === "expenses" ? "Category" : "Source"}</span>
              <select
                className="input-field"
                value={form.categoryOrSource}
                onChange={(event) => setForm((current) => ({ ...current, categoryOrSource: event.target.value }))}
                required
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Date</span>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Note (optional)</span>
            <textarea
              className="input-field min-h-[88px]"
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              placeholder="Add context for this transaction"
            />
          </label>

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

      <ConfirmModal
        open={deleteState.open}
        title="Delete entry?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteState({ open: false, id: "", type: tab })}
        onConfirm={handleDeleteConfirm}
      />
    </section>
  );
}

function TabButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
        active ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}
