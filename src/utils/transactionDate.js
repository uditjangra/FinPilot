export const parseTransactionDate = (value) => {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === "object") {
        if (typeof value.toDate === "function") {
            const parsedFromMethod = value.toDate();
            return parsedFromMethod instanceof Date && !Number.isNaN(parsedFromMethod.getTime())
                ? parsedFromMethod
                : null;
        }

        if (typeof value.seconds === "number") {
            const milliseconds = value.seconds * 1000 + (typeof value.nanoseconds === "number" ? value.nanoseconds / 1e6 : 0);
            const parsedFromSeconds = new Date(milliseconds);
            return Number.isNaN(parsedFromSeconds.getTime()) ? null : parsedFromSeconds;
        }
    }

    if (typeof value === "string") {
        const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
        if (dateOnlyMatch) {
            const year = Number(dateOnlyMatch[1]);
            const monthIndex = Number(dateOnlyMatch[2]) - 1;
            const day = Number(dateOnlyMatch[3]);
            const parsedDateOnly = new Date(year, monthIndex, day);
            return Number.isNaN(parsedDateOnly.getTime()) ? null : parsedDateOnly;
        }
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const toInputDateValue = (value, fallback = "") => {
    const parsed = parseTransactionDate(value);
    if (!parsed) {
        return fallback;
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export const formatTransactionDate = (value, locale = "en-IN") => {
    const parsed = parseTransactionDate(value);
    if (!parsed) {
        return "N/A";
    }

    return parsed.toLocaleDateString(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};
