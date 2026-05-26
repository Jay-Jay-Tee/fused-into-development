import React from 'react';

const inputClass = 'border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper';

const Field = ({ name, value, onChange, type = 'text', placeholder, pattern, title }) => (
    <input
        required
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        pattern={pattern}
        title={title}
        className={inputClass}
    />
);

const NewAddressForm = ({ formData, onChange, hasSavedAddresses, onBack }) => (
    <>
        {hasSavedAddresses && (
            <button
                type='button'
                onClick={onBack}
                className='text-sm text-ink-soft hover:text-ink underline text-left mb-2'
            >
                ← Use a saved address
            </button>
        )}
        <div className='flex gap-3'>
            <Field name='firstName' value={formData.firstName} onChange={onChange} placeholder='First name'/>
            <Field name='lastName'  value={formData.lastName}  onChange={onChange} placeholder='Last name'/>
        </div>
        <Field name='email'  value={formData.email}  onChange={onChange} type='email' placeholder='Email address'/>
        <Field name='street' value={formData.street} onChange={onChange} placeholder='Street'/>
        <div className='flex gap-3'>
            <Field name='city'  value={formData.city}  onChange={onChange} placeholder='City'/>
            <Field name='state' value={formData.state} onChange={onChange} placeholder='State'/>
        </div>
        <div className='flex gap-3'>
            <Field
                name='pincode'
                value={formData.pincode}
                onChange={onChange}
                placeholder='Pincode'
                pattern='[0-9]{6}'
                title='6-digit pincode'
            />
            <Field name='country' value={formData.country} onChange={onChange} placeholder='Country'/>
        </div>
        <Field
            name='phone'
            value={formData.phone}
            onChange={onChange}
            type='tel'
            placeholder='Phone number'
            pattern='[6-9][0-9]{9}'
            title='10-digit Indian mobile number'
        />
    </>
);

export default NewAddressForm;
