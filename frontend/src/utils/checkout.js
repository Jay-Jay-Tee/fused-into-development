export const buildOrderItems = (cartItems) => {
    const items = [];
    for (const productId in cartItems) {
        for (const size in cartItems[productId]) {
            const qty = cartItems[productId][size];
            if (qty > 0) items.push({ product: productId, quantity: qty });
        }
    }
    return items;
};

const pickAddressFields = (src) => ({
    firstName: src.firstName,
    lastName: src.lastName,
    street: src.street,
    city: src.city,
    state: src.state,
    pincode: src.pincode,
    country: src.country,
    phone: src.phone,
});

export const buildShippingAddress = ({ useNewAddress, savedAddresses, selectedAddressIndex, formData }) => {
    if (!useNewAddress && selectedAddressIndex !== null) {
        const addr = savedAddresses[selectedAddressIndex];
        if (addr) return pickAddressFields(addr);
    }
    return pickAddressFields(formData);
};
