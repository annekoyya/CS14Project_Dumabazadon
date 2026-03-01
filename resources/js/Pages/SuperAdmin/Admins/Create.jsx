import React from 'react';
import Layout from '@/Layouts/Layout';
import { Link, useForm } from '@inertiajs/react';

const Create = ({ title }) => {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/superadmin/admins', {
            preserveScroll: true,
        });
    };

    return (
        <Layout page_title={title || 'Create Admin User'}>
            <div className="p-6 max-w-lg mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Admin User</h1>
                <p className="text-sm text-gray-500 mb-6">
                    A temporary password will be auto-generated and emailed to the admin.
                </p>

                <div className="bg-white rounded-lg shadow p-6">
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                            {Object.entries(errors).map(([k, v]) => (
                                <div key={k}>{v}</div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="Juan Dela Cruz"
                                className={`w-full bg-gray-50 border ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                } text-gray-900 text-sm rounded-lg p-2.5`}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="admin@barangay.gov.ph"
                                className={`w-full bg-gray-50 border ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                } text-gray-900 text-sm rounded-lg p-2.5`}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                            ℹ️ A secure temporary password will be auto-generated and sent to this email.
                            The admin will be required to change it on first login.
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`flex-1 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                                    processing
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {processing ? 'Creating...' : 'Create & Send Email'}
                            </button>
                            <Link
                                href="/superadmin/admins"
                                className="flex-1 text-center border border-gray-300 text-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Create;