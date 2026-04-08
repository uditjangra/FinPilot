import React from "react";
import { Activity, BarChart3, CreditCard, PieChart, Wallet } from "lucide-react";

const summaryCards = [
    { label: "Monthly Income", value: "$8,750", icon: Wallet, tone: "text-emerald-500" },
    { label: "EMI Due", value: "$1,140", icon: CreditCard, tone: "text-blue-500" },
    { label: "Goal Progress", value: "72%", icon: Activity, tone: "text-cyan-500" },
];

const emiItems = [
    { name: "Home Loan", amount: "$620", progress: 64 },
    { name: "Car EMI", amount: "$290", progress: 42 },
    { name: "Laptop EMI", amount: "$230", progress: 88 },
];

export default function DashboardMockup({ compact = false }) {
    return (
        <div className={`glass border border-border/70 rounded-3xl p-4 md:p-6 ${compact ? "max-w-xl" : ""}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {summaryCards.map((item) => (
                    <div key={item.label} className="bg-primary-bg border border-border rounded-2xl p-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">{item.label}</p>
                            <item.icon className={item.tone} size={14} />
                        </div>
                        <p className="text-xl font-black text-text-primary mt-2">{item.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3 bg-primary-bg border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-black uppercase tracking-wide">Cashflow Trend</p>
                        <BarChart3 size={16} className="text-accent" />
                    </div>
                    <div className="h-32 flex items-end gap-2">
                        {[38, 62, 48, 76, 58, 82, 70, 90].map((height, index) => (
                            <div key={height + index} className="flex-1 rounded-t-xl bg-accent/80" style={{ height: `${height}%` }} />
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-primary-bg border border-border rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-black uppercase tracking-wide">Expense Split</p>
                            <PieChart size={16} className="text-accent" />
                        </div>
                        <div className="mt-3 flex items-center gap-4">
                            <div
                                className="w-16 h-16 rounded-full border border-border"
                                style={{
                                    background:
                                        "conic-gradient(#0b63f6 0deg 165deg, #10b981 165deg 255deg, #f97316 255deg 320deg, #8b5cf6 320deg 360deg)",
                                }}
                            />
                            <div className="space-y-1 text-[11px] font-semibold text-text-secondary">
                                <p>Needs 46%</p>
                                <p>Savings 25%</p>
                                <p>EMIs 18%</p>
                                <p>Leisure 11%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary-bg border border-border rounded-2xl p-4 space-y-3">
                        <p className="text-xs font-black uppercase tracking-wide">Upcoming EMI Cards</p>
                        {emiItems.map((item) => (
                            <div key={item.name}>
                                <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                                    <span>{item.name}</span>
                                    <span>{item.amount}</span>
                                </div>
                                <div className="mt-1 h-1.5 bg-surface-brighter rounded-full overflow-hidden">
                                    <div className="h-full bg-accent rounded-full" style={{ width: `${item.progress}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
