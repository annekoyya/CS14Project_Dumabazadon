import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

const ForgotPassword = () => {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    return (
        <section className="bg-gray-200" style={{ backgroundImage: "url('/images/new_bg.jpg')" }}>
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen">
                <div className="w-full bg-white rounded-lg shadow sm:max-w-md p-8">
                    <h1 className="text-xl font-bold text-center text-gray-900 mb-2">Forgot Password</h1>
                    <p className="text-sm text-gray-500 text-center mb-6">
                        Enter your email and we'll send you a 6-digit OTP to reset your password.
                    </p>

                    <form onSubmit={e => { e.preventDefault(); post('/forgot-password'); }} className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-900">Email Address</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="your@email.com"
                                className={`w-full bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg p-2.5`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className={`w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 ${processing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {processing ? 'Sending OTP...' : 'Send OTP'}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            <a href="/login" className="text-blue-600 hover:underline">Back to Login</a>
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ForgotPassword;