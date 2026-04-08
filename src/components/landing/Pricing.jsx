import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
    {
        name: "Free Plan",
        price: "$0",
        subtitle: "For getting started",
        features: ["Basic expense tracking", "EMI and due-date reminders", "Savings goals overview"],
        cta: "Start Free",
        href: "/signup",
        featured: false,
    },
    {
        name: "Premium Plan",
        price: "$9/mo",
        subtitle: "For serious money optimization",
        features: ["Advanced analytics", "PDF reports", "AI insights and action tips"],
        cta: "Upgrade to Premium",
        href: "/signup",
        featured: true,
    },
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-14 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Pricing</p>
                    <h2 className="mt-3 text-3xl md:text-4xl font-display font-black tracking-tight">
                        Start Free, Upgrade When You Want More Depth
                    </h2>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`rounded-3xl border p-6 md:p-7 ${plan.featured
                                ? "border-accent/35 bg-[linear-gradient(160deg,rgba(11,99,246,0.15),rgba(255,255,255,0))] shadow-accent-sm"
                                : "border-border bg-surface"
                                }`}
                        >
                            <p className="text-sm font-black uppercase tracking-widest text-text-secondary">{plan.name}</p>
                            <p className="mt-3 text-4xl font-black tracking-tight">{plan.price}</p>
                            <p className="text-sm text-text-secondary mt-1">{plan.subtitle}</p>
                            <div className="mt-5 space-y-3">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-start gap-2 text-sm text-text-primary">
                                        <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                            <Link
                                to={plan.href}
                                className={`mt-6 inline-flex ${plan.featured ? "btn-primary" : "btn-secondary"} !py-2.5 !px-5 text-sm`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
