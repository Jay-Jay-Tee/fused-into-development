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
                            <input required onChange={onChangeHandler} name='email' value={formData.email} type='email' placeholder='Email' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            <input required onChange={onChangeHandler} name='password' value={formData.password} type='password' placeholder='Password' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            <input required onChange={onChangeHandler} name='phone' value={formData.phone} type='tel' placeholder='Phone' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                        </>
                    )}

                    {/* Step 2 */}
                    {step===2 && (
                        <>
                            <input required onChange={onChangeHandler} name='shopName' value={formData.shopName} type='text' placeholder='Shop name' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            <textarea required onChange={onChangeHandler} name='description' value={formData.description} rows={3} placeholder='What do you sell? (1-2 sentences)' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            <input required onChange={onChangeHandler} name='city' value={formData.city} type='text' placeholder='City' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            <input onChange={onChangeHandler} name='gstin' value={formData.gstin} type='text' placeholder='GSTIN (optional)' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            <p className='text-xs text-ink-soft'>GSTIN is required only if you sell more than ₹20 lakhs per year. Skip if not applicable.</p>
                        </>
                    )}

                    {/* Step 3 */}
                    {step===3 && (
                        <>
                            <input required onChange={onChangeHandler} name='accountName' value={formData.accountName} type='text' placeholder='Account holder name' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            <input required onChange={onChangeHandler} name='accountNumber' value={formData.accountNumber} type='text' placeholder='Account number' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
                            <input required onChange={onChangeHandler} name='ifsc' value={formData.ifsc} type='text' placeholder='IFSC code' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'/>
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