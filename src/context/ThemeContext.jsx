/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "finance-theme";

const resolveTheme = () => {
    if (typeof window === "undefined") {
        return "dark";
    }

    const persisted = window.localStorage.getItem(STORAGE_KEY);
    if (persisted === "light" || persisted === "dark") {
        return persisted;
    }

    if (typeof window.matchMedia === "function") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    return "dark";
};

const applyThemeToDocument = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(resolveTheme);

    useEffect(() => {
        applyThemeToDocument(theme);
        window.localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    useEffect(() => {
        if (typeof window.matchMedia !== "function") {
            return undefined;
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemThemeChange = (event) => {
            if (!window.localStorage.getItem(STORAGE_KEY)) {
                setTheme(event.matches ? "dark" : "light");
            }
        };

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", handleSystemThemeChange);
            return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
        }

        mediaQuery.addListener(handleSystemThemeChange);
        return () => mediaQuery.removeListener(handleSystemThemeChange);
    }, []);

    const toggleTheme = () => {
        setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
    };

    const value = useMemo(
        () => ({
            theme,
            setTheme,
            toggleTheme,
        }),
        [theme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }

    return context;
}
