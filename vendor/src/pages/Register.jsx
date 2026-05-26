import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Register = () => {

    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        // Step 1 - personal info
        firstName: '',
        lastName: '',
        userName: '',
        email: '',
        password: '',
        phone: '',
        // Step 2 - shop details
        shopName: '',
        description: '',
        city: '',
        gstin: '',
        // Step 3 - bank details
        accountName: '',
        accountNumber: '',
        ifsc: '',
    });

    const onChangeHandler = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    }

    const nextStep = (e) => {
        e.preventDefault();
        if (step < 3) setStep(step + 1);
    }

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    }

    const submitApplication = async (e) => {
        e.preventDefault();
        // Backend wiring later
        toast.success('Application submitted');
        navigate('/pending');
    }

    return (
        <div className='min-h-screen flex items-center justify-center px-4 py-10'>
            <div className='w-full max-w-2xl border border-line bg-paper p-8 md:p-12'>

                {/* Header */}
                <div className='mb-8'>
                    <p className='text-xs text-ink-soft tracking-wider mb-2'>SELLER APPLICATION</p>
                    <h1 className='font-display text-3xl md:text-4xl'>Become a vendor</h1>
                    <p className='text-sm text-ink-soft mt-3'>List your products to thousands of buyers. Setup takes 5 minutes.</p>
                </div>

                {/* Step indicator */}
                <div className='flex items-center gap-2 mb-8'>
                    {[1,2,3].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`w-8 h-8 flex items-center justify-center text-sm font-medium ${s===step ? 'bg-ink text-paper' : s<step ? 'bg-mustard text-ink' : 'border border-line text-ink-soft'}`}>
                                {s<step ? '✓' : s}
                            </div>
                            {s !== 3 && <div className={`flex-1 h-[1px] ${s<step ? 'bg-mustard' : 'bg-line'}`}></div>}
                        </React.Fragment>
                    ))}
                </div>

                <p className='text-sm text-ink-soft mb-6'>
                    Step {step} of 3 — {step===1 ? 'Personal info' : step===2 ? 'Shop details' : 'Bank details'}
                </p>

                <form onSubmit={step===3 ? submitApplication : nextStep} className='flex flex-col gap-4'>

                    {/* Step 1 */}
                    {step===1 && (
                        <>
                            <div className='flex gap-3'>
                                <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} type='text' placeholder='First name' className='flex-1 px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                                <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} type='text' placeholder='Last name' className='flex-1 px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            </div>
                            <input required onChange={onChangeHandler} name='userName' value={formData.userName} type='text' placeholder='Username (no spaces)' pattern='[a-zA-Z0-9_]+' title='Letters, numbers, and underscores only' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            <input required onChange={onChangeHandler} name='email' value={formData.email} type='email' placeholder='Email' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            <input required onChange={onChangeHandler} name='password' value={formData.password} type='password' placeholder='Password (min 8 characters)' minLength={8} className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            <input required onChange={onChangeHandler} name='phone' value={formData.phone} type='tel' placeholder='10-digit phone number' pattern='[6-9][0-9]{9}' title='Indian mobile number starts with 6, 7, 8, or 9 and has 10 digits' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                        </>
                    )}

                    {/* Step 2 */}
                    {step===2 && (
                        <>
                            <input required onChange={onChangeHandler} name='shopName' value={formData.shopName} type='text' placeholder='Shop name' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            <textarea required onChange={onChangeHandler} name='description' value={formData.description} rows={3} placeholder='What do you sell? (1-2 sentences)' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            <input required onChange={onChangeHandler} name='city' value={formData.city} type='text' placeholder='City' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            <input onChange={onChangeHandler} name='gstin' value={formData.gstin} type='text' placeholder='GSTIN (optional)' pattern='[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}' title='15-character GSTIN format' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper font-mono uppercase'/>
                            <p className='text-xs text-ink-soft'>GSTIN is required only if you sell more than ₹20 lakhs per year. Skip if not applicable.</p>
                        </>
                    )}

                    {/* Step 3 */}
                    {step===3 && (
                        <>
                            <input required onChange={onChangeHandler} name='accountName' value={formData.accountName} type='text' placeholder='Account holder name' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            <input required onChange={onChangeHandler} name='accountNumber' value={formData.accountNumber} type='text' placeholder='Account number (9-18 digits)' pattern='[0-9]{9,18}' title='Bank account number, 9 to 18 digits' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper font-mono'/>
                            <input required onChange={onChangeHandler} name='ifsc' value={formData.ifsc} type='text' placeholder='IFSC code (e.g., HDFC0001234)' pattern='[A-Z]{4}0[A-Z0-9]{6}' title='IFSC format: 4 letters + 0 + 6 alphanumeric' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper font-mono uppercase'/>
                            <p className='text-xs text-ink-soft'>Payouts happen on the 1st and 15th of every month to this account.</p>
                        </>
                    )}

                    {/* Navigation */}
                    <div className='flex justify-between mt-6'>
                        {step > 1 ? (
                            <button type='button' onClick={prevStep} className='px-6 py-2 text-sm border border-line hover:bg-line transition-colors'>
                                Back
                            </button>
                        ) : <div/>}
                        <button type='submit' className='px-6 py-2 bg-ink text-paper text-sm hover:bg-navy transition-colors'>
                            {step===3 ? 'Submit application' : 'Next'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register