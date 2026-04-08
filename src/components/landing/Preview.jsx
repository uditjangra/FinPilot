import React from "react";
import { BarChart3, Check, CreditCard, Gauge, PieChart } from "lucide-react";
import { motion } from "framer-motion";
import DashboardMockup from "./DashboardMockup";

const MotionDiv = motion.div;

const previewHighlights = [
    { icon: BarChart3, title: "Graphs", text: "Cashflow and monthly trend graphs at a glance." },
    { icon: CreditCard, title: "EMI Cards", text: "Loan cards with due status, paid markers, and balances." },
    { icon: Gauge, title: "Progress Bars", text: "Goal completion and EMI payoff progress in real time." },
    { icon: PieChart, title: "Expense Pie", text: "Visual expense distribution for quick decision making." },
];

export default function Preview() {
    return (
        <section id="preview" className="py-14 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center">
                    <MotionDiv
                        initial={{ opacity: 0, x: -25 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45 }}
                    >
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Dashboard Preview</p>
                        <h2 className="mt-3 text-3xl md:text-4xl font-display font-black tracking-tight">
                            One Screen For Every Financial Signal
                        </h2>
                        <p className="mt-4 text-text-secondary">
                            From daily expenses to long-term goals, your entire financial workflow stays visible and actionable.
                        </p>
                        <div className="mt-6 space-y-3">
                            {previewHighlights.map((item) => (
                                <div key={item.title} className="flex items-start gap-3 bg-surface border border-border rounded-2xl p-3">
                                    <div className="w-8 h-8 rounded-xl bg-accent/12 text-accent flex items-center justify-center">
                                        <item.icon size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black">{item.title}</p>
                                        <p className="text-sm text-text-secondary">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                                <Check size={14} />
                                Built to help you take action, not just look at charts
                            </div>
                        </div>
                    </MotionDiv>

                    <MotionDiv
                        initial={{ opacity: 0, x: 25 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45 }}
                    >
                        <DashboardMockup compact />
                    </MotionDiv>
                </div>
            </div>
        </section>
    );
}
