export const toRupees = (paise) => {
    if (paise == null) return 0;
    return paise / 100;
}

export const toPaise = (rupees) => {
    if (rupees == null) return 0;
    return Math.round(rupees * 100);
}

export const formatINR = (paise) => {
    if (paise == null) return '₹0';
    const rupees = paise / 100;
    return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}