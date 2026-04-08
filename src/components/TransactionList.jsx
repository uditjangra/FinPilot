import React from "react";
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "../utils/currency";
import { formatTransactionDate } from "../utils/transactionDate";

const MotionDiv = motion.div;

export default function TransactionList({ transactions, onDelete, onEdit }) {
    return (
        <div className="space-y-3">
            <AnimatePresence mode="popLayout">
                {transactions.map((t, index) => (
                    <MotionDiv
                        key={t.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-surface hover:bg-surface-brighter border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-300 hover:border-accent/30 hover:shadow-[0_0_20px_rgba(var(--theme-accent-rgb),0.12)]"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${t.type === "income"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                    : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                                }`}>
                                {t.type === "income" ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">
                                    {t.title || t.description || "Untitled"}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-text-secondary bg-primary-bg px-2 py-0.5 rounded-md border border-border">
                                        {t.category || "Other"}
                                    </span>
                                    <span className="text-[10px] font-bold text-dark-gray-elements flex items-center gap-1">
                                        <Calendar size={10} />
                                        {formatTransactionDate(t.date)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-16 sm:pl-0">
                            <div className="text-right">
                                <p className={`text-lg font-black font-display tracking-tight ${t.type === "income" ? "text-emerald-500" : "text-rose-500"
                                    }`}>
                                    {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEdit(t)}
                                    className="p-2 text-text-secondary hover:text-blue-400 rounded-lg hover:bg-blue-400/10 transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => onDelete(t.id)}
                                    className="p-2 text-text-secondary hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </MotionDiv>
                ))}
            </AnimatePresence>
            {transactions.length === 0 && (
                <div className="text-center py-20 bg-surface/50 rounded-3xl border border-dashed border-border">
                    <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">No activity found</p>
                </div>
            )}
        </div>
    );
}
