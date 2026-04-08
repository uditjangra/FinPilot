import React from "react";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

const reasons = [
    "Simple UI built for daily use",
    "Fast performance on every device",
    "Fully mobile-friendly experience",
    "No spreadsheets needed",
    "All-in-one personal finance tracker",
];

export default function WhyChooseUs() {
    return (
        <section className="py-14 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45 }}
                    >
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Why Choose Us</p>
                        <h2 className="mt-3 text-3xl md:text-4xl font-display font-black tracking-tight">
                            Built For Clarity, Speed, And Consistency
                        </h2>
                        <p className="mt-4 text-text-secondary">
                            FinanceFlow gives you a clean command center for loans, goals, and spending so you can focus on outcomes.
                        </p>
                        <div className="mt-6 space-y-3">
                            {reasons.map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                    <p className="text-sm text-text-primary font-semibold">{item}</p>
                                </div>
                            ))}
                        </div>
                    </MotionDiv>

                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, delay: 0.05 }}
                        className="bg-surface border border-border rounded-3xl p-6"
                    >
                        <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Outcome Snapshot</p>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <StatCard value="18hrs" label="Saved monthly from manual finance tracking" />
                            <StatCard value="31%" label="Average drop in late EMI payments" />
                            <StatCard value="2.4x" label="Faster monthly review cycles" />
                            <StatCard value="92%" label="Users feeling in control of cashflow" />
                        </div>
                    </MotionDiv>
                </div>
            </div>
        </section>
    );
}

function StatCard({ value, label }) {
    return (
        <div className="rounded-2xl border border-border bg-primary-bg p-4">
            <p className="text-2xl font-black tracking-tight text-text-primary">{value}</p>
            <p className="text-xs text-text-secondary mt-1">{label}</p>
        </div>
    );
}
