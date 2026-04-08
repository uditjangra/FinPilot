import { useEffect, useMemo, useState } from "react";
import { Download, LockKeyhole, ShieldCheck, Trash2, UserRound } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useFinanceData } from "../context/FinanceDataContext";
import { useToast } from "../components/ui/ToastContext";
import { FINANCIAL_PRIORITIES, GENDER_OPTIONS, INCOME_RANGES } from "../constants/onboarding";
import {
  canEditEverySixMonths,
  formatDate,
  getNextAllowedEditDate,
} from "../utils/format";

export default function Profile() {
  const { profile, expenses, income, emis, goals, upsertProfile } = useFinanceData();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    genderCustom: "",
    country: "",
    occupation: "",
    incomeRange: "",
    maritalStatus: "",
  });
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [preferencesDraft, setPreferencesDraft] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }
    setForm({
      name: profile.name || "",
      email: profile.email || "",
      age: profile.age || "",
      gender: profile.gender || "",
      genderCustom: profile.genderCustom || "",
      country: profile.country || "",
      occupation: profile.occupation || "",
      incomeRange: profile.incomeRange || "",
      maritalStatus: profile.maritalStatus || "",
    });
    setPreferencesDraft(Array.isArray(profile.financialPreferences) ? profile.financialPreferences : []);
  }, [profile]);

  const ageEditable = canEditEverySixMonths(profile?.ageUpdatedAt);
  const genderEditable = canEditEverySixMonths(profile?.genderUpdatedAt);
  const nextAgeEditDate = getNextAllowedEditDate(profile?.ageUpdatedAt);
  const nextGenderEditDate = getNextAllowedEditDate(profile?.genderUpdatedAt);

  const lastUpdated = useMemo(() => profile?.updatedAt || profile?.onboardingCompletedAt || null, [profile]);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const payload = {
        name: form.name,
        country: form.country,
        occupation: form.occupation,
        incomeRange: form.incomeRange,
        maritalStatus: form.maritalStatus,
      };

      if (ageEditable && String(form.age) !== String(profile?.age ?? "")) {
        payload.age = Number(form.age || 0);
        payload.ageUpdatedAt = new Date();
      }
      if (
        genderEditable &&
        (form.gender !== (profile?.gender || "") || form.genderCustom !== (profile?.genderCustom || ""))
      ) {
        payload.gender = form.gender;
        payload.genderCustom = form.gender === "custom" ? form.genderCustom : "";
        payload.genderUpdatedAt = new Date();
      }

      await upsertProfile(payload);
      showToast({
        type: "success",
        title: "Profile updated",
        description: "Personal information saved successfully.",
      });
    } catch {
      showToast({
        type: "error",
        title: "Profile update failed",
        description: "Please try again.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const togglePreference = (value) => {
    setPreferencesDraft((current) => {
      if (current.includes(value)) {
        return current.filter((entry) => entry !== value);
      }
      if (current.length >= 4) {
        showToast({
          type: "error",
          title: "Maximum reached",
          description: "You can keep up to 4 financial priorities.",
        });
        return current;
      }
      return [...current, value];
    });
  };

  const savePreferences = async () => {
    try {
      await upsertProfile({ financialPreferences: preferencesDraft });
      setPreferencesModalOpen(false);
      showToast({
        type: "success",
        title: "Preferences updated",
        description: "Financial priorities saved.",
      });
    } catch {
      showToast({
        type: "error",
        title: "Unable to save preferences",
        description: "Please try again.",
      });
    }
  };

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile,
      expenses,
      income,
      emis,
      goals,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `finpilot-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast({
      type: "success",
      title: "Data export ready",
      description: "JSON export has been generated.",
    });
  };

  return (
    <section className="space-y-4">
      <PageHeader
        title="Profile"
        description="Manage personal information, priorities, and account settings."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="h-4 w-4 text-blue-700" />
            <h2 className="text-base font-semibold text-slate-900">Personal Information</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name">
              <input className="input-field" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </Field>
            <Field label="Email">
              <input className="input-field bg-slate-50" value={form.email} readOnly />
            </Field>
            <Field label="Age">
              <input
                className="input-field disabled:bg-slate-100 disabled:text-slate-400"
                type="number"
                min="18"
                max="100"
                value={form.age}
                onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
                disabled={!ageEditable}
              />
              {!ageEditable && nextAgeEditDate ? (
                <p className="mt-1 text-xs text-slate-500">Age editable again on {formatDate(nextAgeEditDate)}</p>
              ) : null}
            </Field>
            <Field label="Gender">
              <select
                className="input-field disabled:bg-slate-100 disabled:text-slate-400"
                value={form.gender}
                onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))}
                disabled={!genderEditable}
              >
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {!genderEditable && nextGenderEditDate ? (
                <p className="mt-1 text-xs text-slate-500">Gender editable again on {formatDate(nextGenderEditDate)}</p>
              ) : null}
            </Field>
            {form.gender === "custom" ? (
              <Field label="Custom Gender">
                <input
                  className="input-field"
                  value={form.genderCustom}
                  onChange={(event) => setForm((current) => ({ ...current, genderCustom: event.target.value }))}
                />
              </Field>
            ) : null}
            <Field label="Country">
              <input className="input-field" value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} />
            </Field>
            <Field label="Occupation">
              <input
                className="input-field"
                value={form.occupation}
                onChange={(event) => setForm((current) => ({ ...current, occupation: event.target.value }))}
              />
            </Field>
            <Field label="Monthly Income Range">
              <select
                className="input-field"
                value={form.incomeRange}
                onChange={(event) => setForm((current) => ({ ...current, incomeRange: event.target.value }))}
              >
                <option value="">Select range</option>
                {INCOME_RANGES.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500">Last updated on: {formatDate(lastUpdated)}</p>
            <button type="button" onClick={saveProfile} disabled={savingProfile} className="btn-primary px-4 py-2 text-sm">
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="text-base font-semibold text-slate-900">Financial Preferences</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(profile?.financialPreferences || []).length ? (
                profile.financialPreferences.map((preference) => (
                  <span key={preference} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    {preference}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No priorities selected.</p>
              )}
            </div>
            <button type="button" onClick={() => setPreferencesModalOpen(true)} className="btn-secondary mt-4 px-4 py-2 text-sm">
              Edit Preferences
            </button>
          </div>

          <div className="card">
            <div className="mb-3 flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-blue-700" />
              <h2 className="text-base font-semibold text-slate-900">Security Settings</h2>
            </div>
            <div className="space-y-3 text-sm">
              <button
                type="button"
                onClick={() =>
                  showToast({
                    type: "info",
                    title: "Coming soon",
                    description: "Password update flow will be connected in backend phase.",
                  })
                }
                className="btn-secondary w-full px-4 py-2 text-sm"
              >
                Change password
              </button>
              <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                <span className="text-slate-700">Two-factor authentication</span>
                <button
                  type="button"
                  onClick={() => setTwoFactorEnabled((value) => !value)}
                  className={`h-6 w-11 rounded-full p-0.5 transition ${twoFactorEnabled ? "bg-emerald-500" : "bg-slate-300"}`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white transition ${twoFactorEnabled ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </label>
              <div className="rounded-xl border border-slate-200 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Login history (UI placeholder)</p>
                <p className="mt-2 text-xs text-slate-500">Last login: Today · Web · Trusted device</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-700" />
              <h2 className="text-base font-semibold text-slate-900">Account Settings</h2>
            </div>
            <div className="space-y-2">
              <button type="button" onClick={exportData} className="btn-secondary inline-flex w-full items-center justify-center gap-2 px-4 py-2 text-sm">
                <Download className="h-4 w-4" />
                Export data
              </button>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </button>
              <p className="pt-1 text-xs text-slate-500">Data privacy policy: encrypted storage, private by default.</p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={preferencesModalOpen}
        onClose={() => setPreferencesModalOpen(false)}
        title="Edit Financial Priorities"
        subtitle={`${preferencesDraft.length}/4 selected`}
      >
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {FINANCIAL_PRIORITIES.map((priority) => {
              const active = preferencesDraft.includes(priority);
              return (
                <button
                  key={priority}
                  type="button"
                  onClick={() => togglePreference(priority)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    active ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {priority}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setPreferencesModalOpen(false)} className="btn-secondary px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="button" onClick={savePreferences} className="btn-primary px-4 py-2 text-sm">
              Save
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete account?"
        description="This is currently a UI placeholder. Backend delete workflow can be added when required."
        confirmLabel="Acknowledge"
        tone="neutral"
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          setDeleteModalOpen(false);
          showToast({
            type: "info",
            title: "Delete flow placeholder",
            description: "Account deletion endpoint is not wired yet.",
          });
        }}
      />
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
