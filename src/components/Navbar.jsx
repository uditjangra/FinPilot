import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Menu, X, LogOut, LayoutDashboard, BarChart3, User, Zap, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion.div;

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { logout, currentUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const navLinks = [
        { path: "/app", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
        { path: "/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
        { path: "/profile", label: "Profile", icon: <User size={18} /> },
    ];

    const isActive = (path) => location.pathname === path;
    const themeToggleLabel = theme === "dark" ? "Light mode" : "Dark mode";

    return (
        <nav className="sticky top-0 z-50 glass border-b border-border/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/app" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(var(--theme-accent-rgb),0.4)] transition-transform group-hover:scale-110">
                                <Zap className="text-white fill-current" size={24} />
                            </div>
                            <span className="text-xl font-black text-text-primary tracking-tighter uppercase font-display">
                                Finance<span className="text-accent">X</span>
                            </span>
                        </Link>

                        <div className="hidden md:ml-10 md:flex md:space-x-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive(link.path)
                                        ? "bg-accent/10 text-accent border border-accent/20"
                                        : "text-text-secondary hover:text-text-primary hover:bg-surface-brighter"
                                        }`}
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-surface-brighter text-text-secondary hover:text-text-primary hover:border-accent/30 transition-all"
                            title={themeToggleLabel}
                        >
                            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                            <span className="text-xs font-bold uppercase tracking-wide hidden lg:block">{themeToggleLabel}</span>
                        </button>
                        {currentUser && (
                            <div className="flex items-center gap-3 px-4 py-2 bg-surface-brighter rounded-xl border border-border">
                                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-white uppercase overflow-hidden">
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        currentUser.email.charAt(0)
                                    )}
                                </div>
                                <span className="text-text-secondary text-xs font-medium truncate max-w-[150px]">
                                    {currentUser.displayName || currentUser.email}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="p-2.5 rounded-xl text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-brighter transition-colors"
                            title={themeToggleLabel}
                        >
                            {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-brighter transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <MotionDiv
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-t border-border overflow-hidden"
                    >
                        <div className="px-4 pt-4 pb-6 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive(link.path)
                                        ? "bg-accent/10 text-accent border border-accent/20"
                                        : "text-text-secondary hover:text-text-primary hover:bg-surface-brighter"
                                        }`}
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            ))}
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-bold text-text-secondary hover:text-text-primary hover:bg-surface-brighter transition-colors"
                            >
                                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                                {themeToggleLabel}
                            </button>
                            <div className="pt-4 mt-4 border-t border-border">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20"
                                >
                                    <LogOut size={20} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </nav>
    );
}
