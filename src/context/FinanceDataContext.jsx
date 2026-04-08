/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "./AuthContext";
import { toInputDate } from "../utils/format";

const FinanceDataContext = createContext(null);

const numberOrZero = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const byDateDescending = (a, b) => {
  const dateA = new Date(a.date || 0).getTime();
  const dateB = new Date(b.date || 0).getTime();
  return dateB - dateA;
};

const defaultProfileForUser = (user) => ({
  name: user.displayName || "",
  email: user.email || "",
  age: "",
  gender: "",
  genderCustom: "",
  country: "",
  occupation: "",
  incomeRange: "",
  maritalStatus: "",
  financialPreferences: [],
  onboardingCompleted: false,
  ageUpdatedAt: null,
  genderUpdatedAt: null,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

export function FinanceDataProvider({ children }) {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [expenses, setExpenses] = useState(null);
  const [income, setIncome] = useState(null);
  const [emis, setEmis] = useState(null);
  const [goals, setGoals] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(null);
      setProfileLoading(false);
      setExpenses(null);
      setIncome(null);
      setEmis(null);
      setGoals(null);
      return undefined;
    }

    let isMounted = true;
    let unsubscribers = [];

    const uid = currentUser.uid;
    const userRef = doc(db, "users", uid);

    const ensureUserDocument = async () => {
      const existingSnapshot = await getDoc(userRef);
      if (!existingSnapshot.exists()) {
        await setDoc(userRef, defaultProfileForUser(currentUser), { merge: true });
      } else if (!existingSnapshot.data().email && currentUser.email) {
        await setDoc(userRef, { email: currentUser.email, updatedAt: serverTimestamp() }, { merge: true });
      }
    };

    const subscribe = async () => {
      setProfileLoading(true);
      setExpenses(null);
      setIncome(null);
      setEmis(null);
      setGoals(null);

      await ensureUserDocument();

      if (!isMounted) {
        return;
      }

      const unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
        setProfile({ id: snapshot.id, ...(snapshot.data() || {}) });
        setProfileLoading(false);
      });

      const unsubscribeExpenses = onSnapshot(collection(db, "users", uid, "expenses"), (snapshot) => {
        const items = snapshot.docs
          .map((entry) => ({ id: entry.id, ...entry.data() }))
          .map((entry) => ({
            ...entry,
            amount: numberOrZero(entry.amount),
            date: toInputDate(entry.date, ""),
          }))
          .sort(byDateDescending);
        setExpenses(items);
      });

      const unsubscribeIncome = onSnapshot(collection(db, "users", uid, "income"), (snapshot) => {
        const items = snapshot.docs
          .map((entry) => ({ id: entry.id, ...entry.data() }))
          .map((entry) => ({
            ...entry,
            amount: numberOrZero(entry.amount),
            date: toInputDate(entry.date, ""),
          }))
          .sort(byDateDescending);
        setIncome(items);
      });

      const unsubscribeEmis = onSnapshot(collection(db, "users", uid, "emis"), (snapshot) => {
        const items = snapshot.docs
          .map((entry) => ({ id: entry.id, ...entry.data() }))
          .map((entry) => {
            const paymentHistory = Array.isArray(entry.paymentHistory) ? entry.paymentHistory : [];
            const normalizedHistory = paymentHistory.map((item) => ({
              amount: numberOrZero(item.amount),
              date: toInputDate(item.date, toInputDate(item.paidAt, "")),
            }));
            const paidTotal = normalizedHistory.reduce((sum, item) => sum + numberOrZero(item.amount), 0);
            const principal = numberOrZero(entry.principal);
            const remainingBalance = Math.max(principal - paidTotal, 0);

            return {
              ...entry,
              principal,
              EMI: numberOrZero(entry.EMI),
              paymentHistory: normalizedHistory,
              dueDate: toInputDate(entry.dueDate, ""),
              remainingBalance,
            };
          });
        setEmis(items);
      });

      const unsubscribeGoals = onSnapshot(collection(db, "users", uid, "goals"), (snapshot) => {
        const items = snapshot.docs
          .map((entry) => ({ id: entry.id, ...entry.data() }))
          .map((entry) => ({
            ...entry,
            targetAmount: numberOrZero(entry.targetAmount),
            currentAmount: numberOrZero(entry.currentAmount),
            deadline: toInputDate(entry.deadline, ""),
            contributions: Array.isArray(entry.contributions) ? entry.contributions : [],
          }))
          .sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""));
        setGoals(items);
      });

      unsubscribers = [unsubscribeProfile, unsubscribeExpenses, unsubscribeIncome, unsubscribeEmis, unsubscribeGoals];
    };

    subscribe().catch(() => {
      if (isMounted) {
        setProfileLoading(false);
        setExpenses([]);
        setIncome([]);
        setEmis([]);
        setGoals([]);
      }
    });

    return () => {
      isMounted = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      unsubscribers = [];
    };
  }, [currentUser]);

  const upsertProfile = useCallback(
    async (updates) => {
      if (!currentUser?.uid) {
        return;
      }
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          ...updates,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [currentUser]
  );

  const completeOnboarding = useCallback(
    async ({ personalDetails, financialPreferences, initialSetup }) => {
      if (!currentUser?.uid) {
        return;
      }

      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          ...personalDetails,
          financialPreferences,
          onboardingCompleted: true,
          onboardingCompletedAt: serverTimestamp(),
          ageUpdatedAt: serverTimestamp(),
          genderUpdatedAt: serverTimestamp(),
          initialSetup: initialSetup || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [currentUser]
  );

  const addExpense = useCallback(
    async (payload) => {
      if (!currentUser?.uid) {
        return;
      }

      await addDoc(collection(db, "users", currentUser.uid, "expenses"), {
        userId: currentUser.uid,
        amount: numberOrZero(payload.amount),
        category: payload.category || "Other",
        note: (payload.note || "").trim(),
        date: payload.date,
        createdAt: serverTimestamp(),
      });
    },
    [currentUser]
  );

  const updateExpense = useCallback(
    async (id, payload) => {
      if (!currentUser?.uid || !id) {
        return;
      }

      await updateDoc(doc(db, "users", currentUser.uid, "expenses", id), {
        amount: numberOrZero(payload.amount),
        category: payload.category || "Other",
        note: (payload.note || "").trim(),
        date: payload.date,
        updatedAt: serverTimestamp(),
      });
    },
    [currentUser]
  );

  const deleteExpense = useCallback(
    async (id) => {
      if (!currentUser?.uid || !id) {
        return;
      }
      await deleteDoc(doc(db, "users", currentUser.uid, "expenses", id));
    },
    [currentUser]
  );

  const addIncome = useCallback(
    async (payload) => {
      if (!currentUser?.uid) {
        return;
      }

      await addDoc(collection(db, "users", currentUser.uid, "income"), {
        userId: currentUser.uid,
        source: payload.source || "Other",
        amount: numberOrZero(payload.amount),
        note: (payload.note || "").trim(),
        date: payload.date,
        createdAt: serverTimestamp(),
      });
    },
    [currentUser]
  );

  const updateIncome = useCallback(
    async (id, payload) => {
      if (!currentUser?.uid || !id) {
        return;
      }

      await updateDoc(doc(db, "users", currentUser.uid, "income", id), {
        source: payload.source || "Other",
        amount: numberOrZero(payload.amount),
        note: (payload.note || "").trim(),
        date: payload.date,
        updatedAt: serverTimestamp(),
      });
    },
    [currentUser]
  );

  const deleteIncome = useCallback(
    async (id) => {
      if (!currentUser?.uid || !id) {
        return;
      }
      await deleteDoc(doc(db, "users", currentUser.uid, "income", id));
    },
    [currentUser]
  );

  const addEmi = useCallback(
    async (payload) => {
      if (!currentUser?.uid) {
        return;
      }

      await addDoc(collection(db, "users", currentUser.uid, "emis"), {
        userId: currentUser.uid,
        loanName: payload.loanName || "Loan",
        principal: numberOrZero(payload.principal),
        EMI: numberOrZero(payload.EMI),
        dueDate: payload.dueDate,
        status: "active",
        paymentHistory: [],
        createdAt: serverTimestamp(),
      });
    },
    [currentUser]
  );

  const updateEmi = useCallback(
    async (id, payload) => {
      if (!currentUser?.uid || !id) {
        return;
      }

      await updateDoc(doc(db, "users", currentUser.uid, "emis", id), {
        loanName: payload.loanName || "Loan",
        principal: numberOrZero(payload.principal),
        EMI: numberOrZero(payload.EMI),
        dueDate: payload.dueDate,
        status: payload.status || "active",
        updatedAt: serverTimestamp(),
      });
    },
    [currentUser]
  );

  const markEmiPaid = useCallback(
    async (id, amount) => {
      if (!currentUser?.uid || !id) {
        return;
      }

      const emiRef = doc(db, "users", currentUser.uid, "emis", id);
      const snapshot = await getDoc(emiRef);
      if (!snapshot.exists()) {
        return;
      }

      const data = snapshot.data();
      const currentHistory = Array.isArray(data.paymentHistory) ? data.paymentHistory : [];
      const nextEntry = {
        amount: numberOrZero(amount || data.EMI),
        date: toInputDate(new Date()),
      };
      const nextHistory = [...currentHistory, nextEntry];
      const paidTotal = nextHistory.reduce((sum, item) => sum + numberOrZero(item.amount), 0);
      const principal = numberOrZero(data.principal);

      await updateDoc(emiRef, {
        paymentHistory: nextHistory,
        status: paidTotal >= principal ? "closed" : "active",
        updatedAt: serverTimestamp(),
      });
    },
    [currentUser]
  );

  const deleteEmi = useCallback(
    async (id) => {
      if (!currentUser?.uid || !id) {
        return;
      }
      await deleteDoc(doc(db, "users", currentUser.uid, "emis", id));
    },
    [currentUser]
  );

  const addGoal = useCallback(
    async (payload) => {
      if (!currentUser?.uid) {
        return;
      }

      await addDoc(collection(db, "users", currentUser.uid, "goals"), {
        userId: currentUser.uid,
        goalName: payload.goalName || "Goal",
        targetAmount: numberOrZero(payload.targetAmount),
        currentAmount: numberOrZero(payload.currentAmount),
        deadline: payload.deadline,
        contributions: [],
        createdAt: serverTimestamp(),
      });
    },
    [currentUser]
  );

  const addGoalFunds = useCallback(
    async (id, amount) => {
      if (!currentUser?.uid || !id) {
        return;
      }

      const goalRef = doc(db, "users", currentUser.uid, "goals", id);
      const snapshot = await getDoc(goalRef);
      if (!snapshot.exists()) {
        return;
      }
      const data = snapshot.data();
      const contributions = Array.isArray(data.contributions) ? data.contributions : [];
      const amountValue = numberOrZero(amount);

      await updateDoc(goalRef, {
        currentAmount: numberOrZero(data.currentAmount) + amountValue,
        contributions: [...contributions, { amount: amountValue, date: toInputDate(new Date()) }],
        updatedAt: serverTimestamp(),
      });
    },
    [currentUser]
  );

  const updateGoal = useCallback(
    async (id, payload) => {
      if (!currentUser?.uid || !id) {
        return;
      }

      await updateDoc(doc(db, "users", currentUser.uid, "goals", id), {
        goalName: payload.goalName || "Goal",
        targetAmount: numberOrZero(payload.targetAmount),
        currentAmount: numberOrZero(payload.currentAmount),
        deadline: payload.deadline,
        updatedAt: serverTimestamp(),
      });
    },
    [currentUser]
  );

  const deleteGoal = useCallback(
    async (id) => {
      if (!currentUser?.uid || !id) {
        return;
      }
      await deleteDoc(doc(db, "users", currentUser.uid, "goals", id));
    },
    [currentUser]
  );

  const collectionsLoading = expenses === null || income === null || emis === null || goals === null;

  const value = useMemo(
    () => ({
      profile,
      profileLoading,
      expenses: expenses || [],
      income: income || [],
      emis: emis || [],
      goals: goals || [],
      collectionsLoading,
      upsertProfile,
      completeOnboarding,
      addExpense,
      updateExpense,
      deleteExpense,
      addIncome,
      updateIncome,
      deleteIncome,
      addEmi,
      updateEmi,
      markEmiPaid,
      deleteEmi,
      addGoal,
      addGoalFunds,
      updateGoal,
      deleteGoal,
    }),
    [
      profile,
      profileLoading,
      expenses,
      income,
      emis,
      goals,
      collectionsLoading,
      upsertProfile,
      completeOnboarding,
      addExpense,
      updateExpense,
      deleteExpense,
      addIncome,
      updateIncome,
      deleteIncome,
      addEmi,
      updateEmi,
      markEmiPaid,
      deleteEmi,
      addGoal,
      addGoalFunds,
      updateGoal,
      deleteGoal,
    ]
  );

  return <FinanceDataContext.Provider value={value}>{children}</FinanceDataContext.Provider>;
}

export function useFinanceData() {
  const context = useContext(FinanceDataContext);
  if (!context) {
    throw new Error("useFinanceData must be used inside FinanceDataProvider.");
  }
  return context;
}
