import { useEffect, useState } from 'react';

const STORAGE_KEY = 'vendorhub_addresses';

const loadFromStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try { return JSON.parse(stored); }
    catch { return []; }
};

export const useSavedAddresses = () => {
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [useNewAddress, setUseNewAddress] = useState(false);

    useEffect(() => {
        const addrs = loadFromStorage();
        setSavedAddresses(addrs);
        if (addrs.length > 0) setSelectedAddressId(addrs[0].id);
        else setUseNewAddress(true);
    }, []);

    return {
        savedAddresses,
        selectedAddressId,
        setSelectedAddressId,
        useNewAddress,
        setUseNewAddress,
    };
};
