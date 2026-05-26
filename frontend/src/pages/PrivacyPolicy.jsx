import React from 'react'
import Title from '../components/Title'

const Section = ({ title, children }) => (
    <div className='mb-8'>
        <h2 className='text-base font-medium text-ink mb-2'>{title}</h2>
        <div className='text-ink-soft text-sm leading-relaxed space-y-2'>{children}</div>
    </div>
)

const PrivacyPolicy = () => {
    return (
        <div className='border-t border-line pt-8 pb-20'>
            <div className='text-2xl text-center mb-10'>
                <Title text1={'PRIVACY'} text2={'POLICY'} />
            </div>

            <div className='max-w-2xl mx-auto'>
                <p className='text-ink-soft text-sm mb-10'>Last updated: May 2026</p>

                <Section title='1. Information We Collect'>
                    <p>When you create an account we collect your name, email address, phone number, and a hashed password. We never store your password in plain text.</p>
                    <p>When you place an order we collect your delivery address and payment reference. We do not store full card numbers — payments are processed by Razorpay.</p>
                    <p>We collect basic usage data (pages visited, search queries) to improve the platform.</p>
                </Section>

                <Section title='2. How We Use Your Information'>
                    <p>To process and deliver your orders.</p>
                    <p>To send order confirmations and status updates.</p>
                    <p>To detect and prevent fraud.</p>
                    <p>We do not sell your personal data to third parties.</p>
                </Section>

                <Section title='3. Sharing With Vendors'>
                    <p>When you place an order, the vendor fulfilling it receives your name, delivery address, and phone number so they can ship and contact you about the order. They are not permitted to use this information for marketing.</p>
                </Section>

                <Section title='4. Cookies'>
                    <p>We use localStorage to keep you logged in between sessions. We do not use third-party tracking cookies.</p>
                </Section>

                <Section title='5. Data Retention'>
                    <p>Your account data is kept for as long as your account is active. You can request deletion by contacting us — we will remove your personal information within 30 days.</p>
                </Section>

                <Section title='6. Your Rights'>
                    <p>You can access, correct, or delete your personal data at any time from your profile page or by contacting us directly.</p>
                </Section>

                <Section title='7. Contact'>
                    <p>Questions about this policy? Reach us through the <a href='/contact' className='underline hover:text-ink'>Contact page</a>.</p>
                </Section>
            </div>
        </div>
    )
}

export default PrivacyPolicy
