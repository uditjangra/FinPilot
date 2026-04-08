const toNumber = (value) => {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const formatterWithDecimals = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatterWithoutDecimals = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export function formatCurrency(value) {
    return formatterWithDecimals.format(toNumber(value));
}

export function formatCurrencyRounded(value) {
    return formatterWithoutDecimals.format(toNumber(value));
}
