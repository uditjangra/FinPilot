import React from "react";
import { Wallet, ArrowUpCircle, ArrowDownCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "../utils/currency";

const MotionDiv = motion.div;

export default function SummaryCard({ title, amount, color }) {
    const iconMap = {
        blue: <Wallet className="w-6 h-6 text-accent" />,
        green: <ArrowUpCircle className="w-6 h-6 text-emerald-500" />,
        red: <ArrowDownCircle className="w-6 h-6 text-rose-500" />,
    };

    const accentGlow = {
        blue: "shadow-[0_0_20px_rgba(var(--theme-accent-rgb),0.18)]",
        green: "shadow-[0_0_20px_rgba(16,185,129,0.1)]",
        red: "shadow-[0_0_20px_rgba(244,63,94,0.1)]",
    }[color] || "";

    return (
        <MotionDiv
            whileHover={{ y: -5, scale: 1.02 }}
            className={`p-6 rounded-2xl bg-surface border border-border card-glow relative group overflow-hidden ${accentGlow}`}
        >
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-[0.1em] mb-2">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-text-primary tracking-tight font-display">{formatCurrency(amount)}</h3>
                        {color === 'green' && <TrendingUp size={16} className="text-emerald-500 animate-pulse" />}
                    </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-brighter border border-border group-hover:border-accent/40 transition-colors">
                    {iconMap[color] || <Wallet className="w-6 h-6 text-accent" />}
                </div>
            </div>

            {/* Subtle light effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors" />
        </MotionDiv>
    );
}
