import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { useFinanceData } from "../context/FinanceDataContext";
import { useToast } from "../components/ui/ToastContext";
import StepProgress from "../components/ui/StepProgress";
import { FINANCIAL_PRIORITIES, GENDER_OPTIONS, INCOME_RANGES } from "../constants/onboarding";

const TOTAL_STEPS = 3;
const MotionDiv = motion.div;
const MotionButton = motion.button;

const defaultSetup = {
  hasActiveEmi: null,
  wantsSavingsGoal: null,
  wantsExpenseCategory: null,
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, completeOnboarding } = useFinanceData();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [personalDetails, setPersonalDetails] = useState({
    name: "",
    age: "",
    gender: "",
    genderCustom: "",
    country: "",
    occupation: "",
    incomeRange: "",
    maritalStatus: "",
  });
  const [preferences, setPreferences] = useState([]);
  const [setup, setSetup] = useState(defaultSetup);

  useEffect(() => {
    if (!profile) {
      return;
    }
    setPersonalDetails((current) => ({
      ...current,
      name: profile.name || current.name,
      age: profile.age || current.age,
      gender: profile.gender || current.gender,
      genderCustom: profile.genderCustom || current.genderCustom,
      country: profile.country || current.country,
      occupation: profile.occupation || current.occupation,
      incomeRange: profile.incomeRange || current.incomeRange,
      maritalStatus: profile.maritalStatus || current.maritalStatus,
    }));

    if (Array.isArray(profile.financialPreferences) && profile.financialPreferences.length) {
      setPreferences(profile.financialPreferences.slice(0, 4));
    }
  }, [profile]);

  const selectedCountText = `${preferences.length}/4 selected`;
  const isStepOneValid = useMemo(() => {
    const hasBase = Boolean(
      personalDetails.name.trim() &&
        personalDetails.age &&
        personalDetails.gender &&
        personalDetails.country.trim() &&
        personalDetails.occupation.trim() &&
        personalDetails.incomeRange
    );
    if (!hasBase) {
      return false;
    }
    if (personalDetails.gender !== "custom") {
      return true;
    }
    return Boolean(personalDetails.genderCustom.trim());
  }, [personalDetails]);

  const handlePersonalChange = (field, value) => {
    setPersonalDetails((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const togglePriority = (value) => {
    setPreferences((current) => {
      if (current.includes(value)) {
        return current.filter((entry) => entry !== value);
      }
      if (current.length >= 4) {
        showToast({
          type: "error",
          title: "Selection limit reached",
          description: "You can select up to 4 financial priorities.",
        });
        return current;
      }
      return [...current, value];
    });
  };

  const persistOnboarding = async (skipSetup = false) => {
    if (saving) {
      return;
    }
    setSaving(true);

    const submittedSetup = skipSetup ? { skipped: true } : setup;

    try {
      await completeOnboarding({
        personalDetails: {
          ...personalDetails,
          age: Number(personalDetails.age),
        },
        financialPreferences: preferences,
        initialSetup: submittedSetup,
      });

      setSuccessState(true);
      showToast({
        type: "success",
        title: "Onboarding completed",
        description: "Your workspace is ready.",
      });
      window.setTimeout(() => navigate("/app/dashboard"), 900);
    } catch (error) {
      console.error("Onboarding failed", error);
      const isOffline = typeof navigator !== "undefined" && navigator.onLine === false;
      const code = error?.code || "";
      let description = "Please try again.";
      if (isOffline) {
        description = "Network appears offline. Please check your connection and try again.";
      } else if (code === "permission-denied") {
        description = "Permission denied. Please check Firestore rules for this user.";
      } else if (code === "unavailable") {
        description = "Firestore is temporarily unavailable. Please try again.";
      } else if (code) {
        description = `Failed to save onboarding (${code}). Please try again.`;
      }

      showToast({
        type: "error",
        title: "Unable to complete onboarding",
        description,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!isStepOneValid) {
        showToast({
          type: "error",
          title: "Missing details",
          description: "Please complete all required fields in Step 1.",
        });
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (preferences.length < 3 || preferences.length > 4) {
        showToast({
          type: "error",
          title: "Select 3 to 4 priorities",
          description: "This helps tailor your dashboard and recommendations.",
        });
        return;
      }
      setStep(3);
      return;
    }

    persistOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-app px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <div className="card mb-6 rounded-3xl p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">Welcome to FinPilot</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Set up your finance workspace</h1>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              First-time onboarding
            </div>
          </div>

          <StepProgress step={step} total={TOTAL_STEPS} />

          <div className="mt-8">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <MotionDiv
                  key="step-1"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <h2 className="text-lg font-semibold text-slate-900">Step 1: Basic personal details</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Full Name" required>
                      <input
                        className="input-field"
                        value={personalDetails.name}
                        onChange={(event) => handlePersonalChange("name", event.target.value)}
                        placeholder="Jane Doe"
                      />
                    </Field>
                    <Field label="Age" required>
                      <input
                        className="input-field"
                        type="number"
                        min="18"
                        max="100"
                        value={personalDetails.age}
                        onChange={(event) => handlePersonalChange("age", event.target.value)}
                        placeholder="29"
                      />
                    </Field>

                    <Field label="Gender" required>
                      <select
                        className="input-field"
                        value={personalDetails.gender}
                        onChange={(event) => handlePersonalChange("gender", event.target.value)}
                      >
                        <option value="">Select gender</option>
                        {GENDER_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {personalDetails.gender === "custom" ? (
                      <Field label="Custom Gender" required>
                        <input
                          className="input-field"
                          value={personalDetails.genderCustom}
                          onChange={(event) => handlePersonalChange("genderCustom", event.target.value)}
                          placeholder="Please specify"
                        />
                      </Field>
                    ) : null}

                    <Field label="Country" required>
                      <input
                        className="input-field"
                        value={personalDetails.country}
                        onChange={(event) => handlePersonalChange("country", event.target.value)}
                        placeholder="United States"
                      />
                    </Field>

                    <Field label="Occupation" required>
                      <input
                        className="input-field"
                        value={personalDetails.occupation}
                        onChange={(event) => handlePersonalChange("occupation", event.target.value)}
                        placeholder="Product Manager"
                      />
                    </Field>

                    <Field label="Monthly Income Range" required>
                      <select
                        className="input-field"
                        value={personalDetails.incomeRange}
                        onChange={(event) => handlePersonalChange("incomeRange", event.target.value)}
                      >
                        <option value="">Select range</option>
                        {INCOME_RANGES.map((range) => (
                          <option key={range} value={range}>
                            {range}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Marital Status (Optional)">
                      <input
                        className="input-field"
                        value={personalDetails.maritalStatus}
                        onChange={(event) => handlePersonalChange("maritalStatus", event.target.value)}
                        placeholder="Single / Married / Prefer not to say"
                      />
                    </Field>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                    <div className="flex items-start gap-2">
                      <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <p className="font-medium">Your data is encrypted and private.</p>
                        <p className="mt-1 text-xs">
                          Age and gender can be edited once every 6 months after onboarding.
                        </p>
                      </div>
                    </div>
                  </div>
                </MotionDiv>
              ) : null}

              {step === 2 ? (
                <MotionDiv
                  key="step-2"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Step 2: Financial preferences</h2>
                      <p className="text-sm text-slate-500">What matters most to you right now?</p>
                    </div>
                    <div className="rounded-xl bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{selectedCountText}</div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {FINANCIAL_PRIORITIES.map((priority) => {
                      const selected = preferences.includes(priority);
                      return (
                        <MotionButton
                          key={priority}
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => togglePriority(priority)}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            selected
                              ? "border-blue-500 bg-blue-50 text-blue-700 shadow-[0_8px_24px_rgba(37,99,235,0.14)]"
                              : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50"
                          }`}
                        >
                          <span className="font-medium">{priority}</span>
                        </MotionButton>
                      );
                    })}
                  </div>
                </MotionDiv>
              ) : null}

              {step === 3 ? (
                <MotionDiv
                  key="step-3"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <h2 className="text-lg font-semibold text-slate-900">Step 3: Initial setup (optional)</h2>
                  <p className="text-sm text-slate-500">Recommended to personalize your experience faster.</p>

                  <QuestionToggle
                    label="Do you have active EMIs?"
                    value={setup.hasActiveEmi}
                    onChange={(value) => setSetup((current) => ({ ...current, hasActiveEmi: value }))}
                  />

                  <QuestionToggle
                    label="Do you want to set a savings goal now?"
                    value={setup.wantsSavingsGoal}
                    onChange={(value) => setSetup((current) => ({ ...current, wantsSavingsGoal: value }))}
                  />

                  <QuestionToggle
                    label="Do you want to add your first expense category?"
                    value={setup.wantsExpenseCategory}
                    onChange={(value) => setSetup((current) => ({ ...current, wantsExpenseCategory: value }))}
                  />

                  {successState ? (
                    <MotionDiv
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Setup saved. Redirecting to dashboard...
                    </MotionDiv>
                  ) : null}
                </MotionDiv>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5">
            <div>
              {step === 3 ? (
                <button type="button" onClick={() => persistOnboarding(true)} className="btn-secondary px-4 py-2 text-sm">
                  Skip for now
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {step > 1 ? (
                <button type="button" onClick={() => setStep((current) => current - 1)} className="btn-secondary px-4 py-2 text-sm">
                  Back
                </button>
              ) : null}
              <button type="button" onClick={handleNext} disabled={saving} className="btn-primary px-4 py-2 text-sm">
                {step < 3 ? "Continue" : saving ? "Saving..." : "Finish Setup"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function QuestionToggle({ label, value, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      <div className="mt-3 inline-flex rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-lg px-3 py-1 text-sm transition ${value === true ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-lg px-3 py-1 text-sm transition ${value === false ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          No
        </button>
      </div>
    </div>
  );
}
