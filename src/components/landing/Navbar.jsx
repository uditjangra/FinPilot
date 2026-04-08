import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Moon, Sun, Wallet2, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Preview", href: "#preview" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
];

export default function LandingNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-50 border-b border-border/60 backdrop-blur-xl bg-primary-bg/75">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center shadow-accent-sm">
                        <Wallet2 size={18} />
                    </div>
                    <span className="font-display font-black tracking-tight text-lg">
                        Finance<span className="text-accent">Flow</span>
                    </span>
                </Link>

                <nav className="hidden lg:flex items-center gap-7">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden lg:flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl border border-border bg-surface text-text-secondary hover:text-text-primary transition-colors"
                        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <Link to="/login" className="btn-secondary !py-2.5 !px-5 text-sm">
                        Login
                    </Link>
                    <Link to="/signup" className="btn-primary !py-2.5 !px-5 text-sm">
                        Get Started Free
                    </Link>
                </div>

                <div className="lg:hidden flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl border border-border bg-surface text-text-secondary hover:text-text-primary transition-colors"
                        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <button
                        onClick={() => setIsOpen((currentValue) => !currentValue)}
                        className="p-2 rounded-xl border border-border bg-surface text-text-secondary hover:text-text-primary transition-colors"
                        aria-label="Open navigation"
                    >
                        {isOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="lg:hidden border-t border-border/60 bg-primary-bg/95 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="block py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="pt-2 flex items-center gap-2">
                            <Link to="/login" className="btn-secondary !py-2.5 !px-4 text-sm flex-1 text-center">
                                Login
                            </Link>
                            <Link to="/signup" className="btn-primary !py-2.5 !px-4 text-sm flex-1 text-center">
                                Get Started Free
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
