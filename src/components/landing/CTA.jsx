import React from "react";
import { Link } from "react-router-dom";

export default function CTA() {
    return (
        <section className="py-16 md:py-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-[2rem] border border-border bg-[linear-gradient(140deg,rgba(11,99,246,0.18),rgba(16,185,129,0.12),rgba(255,255,255,0))] p-8 md:p-12 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Final Call To Action</p>
                    <h2 className="mt-3 text-3xl md:text-5xl font-display font-black tracking-tight">
                        Start Managing Your Money Today
                    </h2>
                    <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
                        Set your goals, track every EMI, and get complete financial clarity from one dashboard.
                    </p>
                    <div className="mt-7">
                        <Link to="/signup" className="btn-primary text-base">
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
