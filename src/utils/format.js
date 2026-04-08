const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

const monthKeyRegex = /^\d{4}-\d{2}$/;

export function formatCurrency(value) {
  const amount = Number(value) || 0;
  return currencyFormatter.format(amount);
}

export function formatDate(value) {
  const parsed = parseDateLike(value);
  if (!parsed) {
    return "N/A";
  }
  return shortDateFormatter.format(parsed);
}

export function parseDateLike(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "object" && typeof value.toDate === "function") {
    const converted = value.toDate();
    return converted instanceof Date && !Number.isNaN(converted.getTime()) ? converted : null;
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toInputDate(value, fallback = "") {
  const parsed = parseDateLike(value);
  if (!parsed) {
    return fallback;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonthKey(dateLike = new Date()) {
  const date = parseDateLike(dateLike);
  if (!date) {
    return "";
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function parseMonthKey(monthKey) {
  if (!monthKeyRegex.test(monthKey)) {
    return null;
  }
  const [year, month] = monthKey.split("-").map(Number);
  const parsed = new Date(year, month - 1, 1);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatMonthKey(monthKey) {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) {
    return "Unknown";
  }
  return monthFormatter.format(parsed);
}

export function monthsUntil(dateLike) {
  const target = parseDateLike(dateLike);
  if (!target) {
    return 0;
  }

  const now = new Date();
  const yearDiff = target.getFullYear() - now.getFullYear();
  const monthDiff = target.getMonth() - now.getMonth();
  const total = yearDiff * 12 + monthDiff;
  return total < 0 ? 0 : total + 1;
}

export function daysUntil(dateLike) {
  const target = parseDateLike(dateLike);
  if (!target) {
    return null;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTarget = new Date(target);
  startOfTarget.setHours(0, 0, 0, 0);

  const diffMs = startOfTarget.getTime() - startOfToday.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function canEditEverySixMonths(lastUpdatedAt) {
  const lastDate = parseDateLike(lastUpdatedAt);
  if (!lastDate) {
    return true;
  }

  const nextAllowed = new Date(lastDate);
  nextAllowed.setMonth(nextAllowed.getMonth() + 6);
  return new Date() >= nextAllowed;
}

export function getNextAllowedEditDate(lastUpdatedAt) {
  const lastDate = parseDateLike(lastUpdatedAt);
  if (!lastDate) {
    return null;
  }

  const nextAllowed = new Date(lastDate);
  nextAllowed.setMonth(nextAllowed.getMonth() + 6);
  return nextAllowed;
}
