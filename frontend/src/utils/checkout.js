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

const normalizeSavedAddress = (addr) => ({
    firstName: addr.firstName,
    lastName: addr.lastName,
    street: addr.street,
    city: addr.city,
    state: addr.state,
    pincode: addr.zipcode || addr.pincode,
    country: addr.country,
    phone: addr.phone,
});

const normalizeFormAddress = (form) => ({
    firstName: form.firstName,
    lastName: form.lastName,
    street: form.street,
    city: form.city,
    state: form.state,
    pincode: form.pincode,
    country: form.country,
    phone: form.phone,
});

export const buildShippingAddress = ({ useNewAddress, savedAddresses, selectedAddressId, formData }) => {
    if (!useNewAddress && selectedAddressId) {
        const addr = savedAddresses.find(a => a.id === selectedAddressId);
        if (addr) return normalizeSavedAddress(addr);
    }
    return normalizeFormAddress(formData);
};
