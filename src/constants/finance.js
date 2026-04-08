export const EXPENSE_CATEGORIES = ["Rent", "Food", "Travel", "Subscriptions", "Misc"];

export const INCOME_CATEGORIES = ["Salary", "Freelance", "Business", "Investment", "Other"];

export const TRANSACTION_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

export const normalizeCategory = (categoryValue = "", type = "expense") => {
    const value = String(categoryValue || "").trim();

    if (type === "income") {
        return INCOME_CATEGORIES.includes(value) ? value : "Other";
    }

    const legacyMap = {
        Transport: "Travel",
        Utilities: "Misc",
        Shopping: "Misc",
        Medical: "Misc",
        Entertainment: "Misc",
        Other: "Misc",
    };

    const mapped = legacyMap[value] || value;
    return EXPENSE_CATEGORIES.includes(mapped) ? mapped : "Misc";
};

export const DEFAULT_EXPENSE_CATEGORY = EXPENSE_CATEGORIES[0];
export const DEFAULT_INCOME_CATEGORY = INCOME_CATEGORIES[0];
