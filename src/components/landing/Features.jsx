import React from "react";
import { CreditCard, Lock, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

const featureCards = [
    {
        title: "EMI Tracker",
        icon: CreditCard,
        items: ["Track all loans in one timeline", "See remaining balance instantly", "Get due reminders before deadline"],
    },
    {
        title: "Savings Goals",
        icon: Target,
        items: ["Set savings targets with milestones", "Monitor visual progress bars", "Track deadlines and urgency"],
    },
    {
        title: "Smart Analytics",
        icon: TrendingUp,
        items: ["Get spending breakdown by category", "Monthly insights on cashflow habits", "See your financial health score"],
    },
    {
        title: "Secure & Private",
        icon: Lock,
        items: ["End-to-end encrypted records", "Private dashboard access only", "Cloud sync across your devices"],
    },
];

export default function Features() {
    return (
        <section id="features" className="py-14 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Features</p>
                    <h2 className="mt-3 text-3xl md:text-4xl font-display font-black tracking-tight">
                        Everything You Need To Stay In Control
                    </h2>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {featureCards.map((feature, index) => (
                        <MotionDiv
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="card-glow bg-surface border border-border rounded-3xl p-5 md:p-6"
                        >
                            <div className="w-11 h-11 rounded-2xl bg-accent/12 flex items-center justify-center text-accent">
                                <feature.icon size={18} />
                            </div>
                            <h3 className="mt-4 text-xl font-black tracking-tight">{feature.title}</h3>
                            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                                {feature.items.map((item) => (
                                    <li key={item} className="flex gap-2">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </MotionDiv>
                    ))}
                </div>
            </div>
        </section>
    );
}
