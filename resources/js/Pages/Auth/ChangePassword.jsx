import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

const ChangePassword = ({ forced = false }) => {
    const { data, setData, post, processing, errors } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [show, setShow] = useState(false);

    return (
        <section className="bg-gray-200" style={{ backgroundImage: "url('/images/new_bg.jpg')" }}>
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen">
                <div className="w-full bg-white rounded-lg shadow sm:max-w-md p-8">
                    <h1 className="text-xl font-bold text-center text-gray-900 mb-2">
                        {forced ? 'Set Your Password' : 'Change Password'}
                    </h1>
                    <p className="text-sm text-gray-500 text-center mb-4">
                        {forced
                            ? 'You must set a new password before accessing the system.'
                            : 'Update your account password.'}
                    </p>

                    {forced && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-xs text-yellow-800">
                            ⚠️ Your account was created with a temporary password. Please set a permanent one.
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 text-xs text-blue-700">
                        Must be at least 8 characters with an uppercase letter, a number, and a special character.
                    </div>

                    <form onSubmit={e => { e.preventDefault(); post('/password/change'); }} className="space-y-4">
                        {!forced && (
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-900">Current Password</label>
                                <input
                                    type={show ? 'text' : 'password'}
                                    value={data.current_password}
                                    onChange={e => setData('current_password', e.target.value)}
                                    placeholder="Your current password"
                                    className={`w-full bg-gray-50 border ${errors.current_password ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg p-2.5`}
                                />
                                {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password}</p>}
                            </div>
                        )}

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-900">New Password</label>
                            <div className="relative">
                                <input
                                    type={show ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="Min 8 characters"
                                    className={`w-full bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg p-2.5 pr-10`}
                                />
                                <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-2.5 text-gray-400">
                                    {show ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-900">Confirm New Password</label>
                            <input
                                type={show ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                placeholder="Repeat new password"
                                className={`w-full bg-gray-50 border ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg p-2.5`}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className={`w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 ${processing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {processing ? 'Saving...' : 'Save Password'}
                        </button>

                        {!forced && (
                            <p className="text-center text-sm text-gray-500">
                                <a href="/dashboard" className="text-blue-600 hover:underline">Cancel</a>
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ChangePassword;