import React, { useRef } from 'react';
import { useForm } from '@inertiajs/react';

const ForgotPasswordVerify = ({ email }) => {
    const { data, setData, post, processing, errors } = useForm({ otp: '' });
    const inputs = useRef([]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const digits = data.otp.split('');
        digits[index] = value;
        const newOtp = digits.join('').slice(0, 6);
        setData('otp', newOtp);
        if (value && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !data.otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <section className="bg-gray-200" style={{ backgroundImage: "url('/images/new_bg.jpg')" }}>
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen">
                <div className="w-full bg-white rounded-lg shadow sm:max-w-md p-8">
                    <h1 className="text-xl font-bold text-center text-gray-900 mb-2">Enter OTP</h1>
                    <p className="text-sm text-gray-500 text-center mb-6">
                        We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
                    </p>

                    <form onSubmit={e => { e.preventDefault(); post('/forgot-password/verify'); }} className="space-y-6">
                        <div className="flex justify-center gap-2">
                            {[0,1,2,3,4,5].map(i => (
                                <input
                                    key={i}
                                    ref={el => inputs.current[i] = el}
                                    type="text"
                                    maxLength={1}
                                    value={data.otp[i] || ''}
                                    onChange={e => handleChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                />
                            ))}
                        </div>

                        {errors.otp && <p className="text-red-500 text-xs text-center">{errors.otp}</p>}

                        <button
                            type="submit"
                            disabled={processing || data.otp.length < 6}
                            className={`w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 ${processing || data.otp.length < 6 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {processing ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            Didn't get it?{' '}
                            <a href="/forgot-password" className="text-blue-600 hover:underline">Resend OTP</a>
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ForgotPasswordVerify;