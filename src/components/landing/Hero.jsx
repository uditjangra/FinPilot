import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import DashboardMockup from "./DashboardMockup";

const MotionDiv = motion.div;

const heroStats = [
    { label: "Active Planners", value: 16, suffix: "k+" },
    { label: "EMIs Tracked", value: 2.1, suffix: "M+", decimals: 1 },
    { label: "Avg. Savings Boost", value: 22, suffix: "%" },
];

export default function Hero() {
    return (
        <section className="relative pt-16 pb-14 md:pt-24 md:pb-20">
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[-16%] left-[-5%] w-[35rem] h-[35rem] rounded-full bg-accent/18 blur-3xl" />
                <div className="absolute bottom-[-12%] right-[-5%] w-[30rem] h-[30rem] rounded-full bg-emerald-500/15 blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center">
                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-text-secondary text-xs font-bold uppercase tracking-widest">
                            <Sparkles size={12} className="text-accent" />
                            Smart Finance Operating System
                        </div>

                        <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[3.3rem] font-display leading-tight font-black tracking-tight">
                            Take Control of Your Money. Track Every EMI. Reach Every Goal.
                        </h1>

                        <p className="mt-5 text-base sm:text-lg text-text-secondary max-w-xl">
                            A smart dashboard to manage EMIs, expenses, and savings goals in one powerful place.
                        </p>

                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            <Link to="/signup" className="btn-primary text-sm sm:text-base">
                                Get Started Free
                            </Link>
                            <Link to="/login" className="btn-secondary text-sm sm:text-base">
                                Login
                            </Link>
                        </div>

                        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface border border-border">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <p className="text-sm text-text-secondary">
                                <span className="font-bold text-text-primary">Bank-grade security</span> trusted by everyday investors.
                            </p>
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
                            {heroStats.map((item) => (
                                <div key={item.label} className="bg-surface border border-border rounded-2xl p-3">
                                    <p className="text-lg md:text-xl font-black text-text-primary">
                                        <CountUp end={item.value} suffix={item.suffix} decimals={item.decimals || 0} />
                                    </p>
                                    <p className="text-[11px] text-text-secondary font-semibold">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </MotionDiv>

                    <MotionDiv
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="relative"
                    >
                        <DashboardMockup />
                        <div className="hidden sm:flex absolute -bottom-5 -left-4 bg-surface border border-border rounded-2xl px-4 py-3 items-center gap-2 shadow-lg">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <p className="text-xs font-bold text-text-secondary">43 upcoming EMIs cleared on time this week</p>
                        </div>
                    </MotionDiv>
                </div>
            </div>
        </section>
    );
}

function CountUp({ end, suffix = "", decimals = 0, duration = 1200 }) {
    const [value, setValue] = React.useState(0);

    React.useEffect(() => {
        let frame = null;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            setValue(end * progress);
            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);
        return () => {
            if (frame) {
                cancelAnimationFrame(frame);
            }
        };
    }, [duration, end]);

    return `${value.toFixed(decimals)}${suffix}`;
}
