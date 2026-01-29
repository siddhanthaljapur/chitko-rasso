'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Address {
    id: string;
    label: string; // Home, Office, Other
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    pincode: string;
    isDefault: boolean;
}

interface AddressContextType {
    addresses: Address[];
    addAddress: (address: Omit<Address, 'id'>) => void;
    updateAddress: (id: string, address: Partial<Address>) => void;
    deleteAddress: (id: string) => void;
    setDefaultAddress: (id: string) => void;
    getDefaultAddress: () => Address | undefined;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
    const [addresses, setAddresses] = useState<Address[]>([]);

    // Load addresses from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('chitko_addresses');
        if (stored) {
            setAddresses(JSON.parse(stored));
        }
    }, []);

    // Save to localStorage whenever addresses change
    useEffect(() => {
        localStorage.setItem('chitko_addresses', JSON.stringify(addresses));
    }, [addresses]);

    const addAddress = (address: Omit<Address, 'id'>) => {
        const newAddress: Address = {
            ...address,
            id: `addr-${Date.now()}`,
        };

        // If this is the first address or marked as default, make it default
        if (addresses.length === 0 || address.isDefault) {
            setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(newAddress));
        } else {
            setAddresses(prev => [...prev, newAddress]);
        }
    };

    const updateAddress = (id: string, updates: Partial<Address>) => {
        setAddresses(prev => prev.map(addr =>
            addr.id === id ? { ...addr, ...updates } : addr
        ));
    };

    const deleteAddress = (id: string) => {
        setAddresses(prev => {
            const filtered = prev.filter(addr => addr.id !== id);
            // If deleted address was default and there are other addresses, make first one default
            const deletedWasDefault = prev.find(a => a.id === id)?.isDefault;
            if (deletedWasDefault && filtered.length > 0) {
                filtered[0].isDefault = true;
            }
            return filtered;
        });
    };

    const setDefaultAddress = (id: string) => {
        setAddresses(prev => prev.map(addr => ({
            ...addr,
            isDefault: addr.id === id
        })));
    };

    const getDefaultAddress = () => {
        return addresses.find(addr => addr.isDefault);
    };

    return (
        <AddressContext.Provider value={{
            addresses,
            addAddress,
            updateAddress,
            deleteAddress,
            setDefaultAddress,
            getDefaultAddress
        }}>
            {children}
        </AddressContext.Provider>
    );
}

export function useAddresses() {
    const context = useContext(AddressContext);
    if (!context) {
        throw new Error('useAddresses must be used within AddressProvider');
    }
    return context;
}
