import React from "react";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

const steps = [
    {
        number: "01",
        title: "Create Account",
        description: "Sign up in under a minute and set your monthly finance baseline.",
    },
    {
        number: "02",
        title: "Add Your Finances",
        description: "Add EMIs, expenses, and goals to build your complete money picture.",
    },
    {
        number: "03",
        title: "Watch Progress Grow",
        description: "Track trends, hit milestones, and improve your financial health each month.",
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-14 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">How It Works</p>
                    <h2 className="mt-3 text-3xl md:text-4xl font-display font-black tracking-tight">
                        Three Steps To Better Money Decisions
                    </h2>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {steps.map((step, index) => (
                        <MotionDiv
                            key={step.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.4, delay: index * 0.07 }}
                            className="bg-surface border border-border rounded-3xl p-6"
                        >
                            <p className="text-sm font-black text-accent tracking-widest">{step.number}</p>
                            <h3 className="mt-3 text-xl font-black tracking-tight">{step.title}</h3>
                            <p className="mt-2 text-sm text-text-secondary">{step.description}</p>
                        </MotionDiv>
                    ))}
                </div>
            </div>
        </section>
    );
}
