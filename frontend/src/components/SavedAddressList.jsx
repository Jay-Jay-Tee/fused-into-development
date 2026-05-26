import React from 'react';

const AddressCard = ({ addr, selected, onClick }) => (
    <div
        onClick={onClick}
        className={`border p-4 cursor-pointer transition-colors ${selected ? 'border-navy bg-mustard/10' : 'border-line hover:border-ink-soft'}`}
    >
        <div className='flex items-start gap-3'>
            <div className={`min-w-4 h-4 rounded-full border-2 mt-0.5 ${selected ? 'border-navy bg-navy' : 'border-line'}`}/>
            <div className='flex-1'>
                <p className='text-xs font-medium tracking-wider text-ink-soft mb-1'>{addr.label || 'ADDRESS'}</p>
                <p className='font-medium text-sm'>{addr.firstName} {addr.lastName}</p>
                <p className='text-sm text-ink-soft'>{addr.street}, {addr.city}, {addr.state} {addr.zipcode || addr.pincode}</p>
                <p className='text-sm text-ink-soft mt-1'>📞 {addr.phone}</p>
            </div>
        </div>
    </div>
);

const SavedAddressList = ({ addresses, selectedId, onSelect, onUseNewAddress }) => (
    <div className='flex flex-col gap-3'>
        {addresses.map((addr) => (
            <AddressCard
                key={addr.id}
                addr={addr}
                selected={selectedId === addr.id}
                onClick={() => onSelect(addr.id)}
            />
        ))}
        <button
            type='button'
            onClick={onUseNewAddress}
            className='text-sm text-ink-soft hover:text-ink underline text-left'
        >
            + Use a different address
        </button>
    </div>
);

export default SavedAddressList;
