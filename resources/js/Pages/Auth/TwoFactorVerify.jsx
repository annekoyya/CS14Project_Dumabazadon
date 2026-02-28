import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';

const TwoFactorVerify = ({ status }) => {
    const { data, setData, post, processing, errors } = useForm({ code: '' });
    const [resent, setResent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/2fa/verify');
    };

    const handleResend = () => {
        router.post('/2fa/resend', {}, {
            onSuccess: () => setResent(true),
        });
    };

    return (
        <section
            className="bg-gray-200 dark:bg-gray-900 min-h-screen flex items-center justify-center"
            style={{ backgroundImage: "url('/images/new_bg.jpg')" }}
        >
            <div className="w-full max-w-md bg-white rounded-lg shadow dark:bg-gray-800 p-8">
                <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    Email Verification
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                    A 6-digit code has been sent to your email address. Enter it below to continue.
                </p>

                {resent && (
                    <p className="text-green-500 text-sm text-center mb-4">A new code has been sent!</p>
                )}

                {status && (
                    <p className="text-green-500 text-sm text-center mb-4">{status}</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className={`bg-gray-50 border ${
                                errors.code ? 'border-red-500' : 'border-gray-300'
                            } text-gray-900 text-center text-xl tracking-widest rounded-lg block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                        />
                        {errors.code && (
                            <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing || data.code.length !== 6}
                        className={`w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                            processing || data.code.length !== 6
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {processing ? 'Verifying...' : 'Verify'}
                    </button>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Didn't receive a code?{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Resend
                        </button>
                    </p>
                </form>
            </div>
        </section>
    );
};

export default TwoFactorVerify;