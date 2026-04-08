import React, { useState } from "react";
import { X, Calendar, Tag, IndianRupee, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { toInputDateValue } from "../utils/transactionDate";
import {
    DEFAULT_EXPENSE_CATEGORY,
    DEFAULT_INCOME_CATEGORY,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    normalizeCategory,
} from "../constants/finance";

const MotionDiv = motion.div;

export default function AddTransactionModal({ onClose, onAdd, initialData, initialType = "expense" }) {
    const startingType = initialData?.type || initialType || "expense";
    const [title, setTitle] = useState(initialData?.title || "");
    const [amount, setAmount] = useState(initialData?.amount || "");
    const [type, setType] = useState(startingType);
    const [category, setCategory] = useState(
        normalizeCategory(
            initialData?.category,
            startingType
        ) || (startingType === "income" ? DEFAULT_INCOME_CATEGORY : DEFAULT_EXPENSE_CATEGORY)
    );
    const [date, setDate] = useState(toInputDateValue(initialData?.date, toInputDateValue(new Date())));
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            alert("Enter a valid amount greater than 0.");
            return;
        }

        const transactionData = {
            title: title.trim(),
            amount: parsedAmount,
            category: normalizeCategory(category, type),
            date,
            type,
        };

        if (initialData?.id) {
            transactionData.id = initialData.id;
        }

        setIsSaving(true);
        try {
            const saveResult = await onAdd(transactionData);
            if (saveResult !== false) {
                onClose();
            }
        } finally {
            setIsSaving(false);
        }
    };

    const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const handleTypeChange = (nextType) => {
        setType(nextType);
        setCategory(nextType === "income" ? DEFAULT_INCOME_CATEGORY : DEFAULT_EXPENSE_CATEGORY);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <MotionDiv
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-surface border border-border rounded-[32px] shadow-2xl overflow-hidden"
            >
                {/* Header Gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter">
                                {initialData ? "Edit" : "New"} <span className="text-accent">Transaction</span>
                            </h2>
                            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest mt-1">Movement of Assets</p>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="p-2 hover:bg-surface-brighter rounded-xl text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex p-1 bg-primary-bg rounded-2xl border border-border">
                            <button
                                type="button"
                                onClick={() => handleTypeChange("expense")}
                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === "expense" ? "bg-accent text-white shadow-lg" : "text-text-secondary hover:text-text-primary"
                                    }`}
                            >
                                Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTypeChange("income")}
                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === "income" ? "bg-emerald-500 text-white shadow-lg" : "text-text-secondary hover:text-text-primary"
                                    }`}
                            >
                                Income
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent" size={20} />
                                <input
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full bg-primary-bg border border-border rounded-2xl pl-12 pr-4 py-4 text-xl font-black text-text-primary focus:border-accent outline-none placeholder:text-dark-gray-elements transition-all"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>

                            <div className="relative group">
                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent" size={20} />
                                <input
                                    type="text"
                                    required
                                    placeholder="Title / Description"
                                    className="w-full bg-primary-bg border border-border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-text-primary focus:border-accent outline-none placeholder:text-dark-gray-elements transition-all"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative group">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent" size={18} />
                                    <select
                                        className="w-full bg-primary-bg border border-border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-text-primary focus:border-accent outline-none transition-all appearance-none cursor-pointer"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent" size={18} />
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-primary-bg border border-border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-text-primary focus:border-accent outline-none transition-all cursor-pointer"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full btn-primary py-5 text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSaving ? "Saving..." : initialData ? "Verify Changes" : "Authorize Transaction"}
                        </button>
                    </form>
                </div>
            </MotionDiv>
        </div>
    );
}
