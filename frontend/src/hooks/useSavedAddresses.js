import { useContext, useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { ShopContext } from '../context/ShopContext';

export const useSavedAddresses = () => {
    const { token } = useContext(ShopContext);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setUseNewAddress(true);
            setLoading(false);
            return;
        }
        api.get('/users/me')
            .then(res => {
                const addrs = res.data.user?.addresses || [];
                setSavedAddresses(addrs);
                if (addrs.length > 0) setSelectedAddressIndex(0);
                else setUseNewAddress(true);
            })
            .catch(() => setUseNewAddress(true))
            .finally(() => setLoading(false));
    }, [token]);

    return {
        savedAddresses,
        selectedAddressIndex,
        setSelectedAddressIndex,
        useNewAddress,
        setUseNewAddress,
        loading,
    };
};
