import React from 'react';
import { useForm } from '@inertiajs/react';

const Create = () => {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/superadmin/admins');
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Admin User</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                A temporary password will be auto-generated and emailed to the admin.
            </p>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Juan Dela Cruz"
                            className={`w-full bg-gray-50 border ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            } text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="admin@barangay.gov.ph"
                            className={`w-full bg-gray-50 border ${
                                errors.email ? 'border-red-500' : 'border-gray-300'
                            } text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-300">
                        A secure temporary password will be generated and sent to this email automatically.
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className={`flex-1 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                                processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {processing ? 'Creating...' : 'Create & Send Email'}
                        </button>
                        
                            href="/superadmin/admins"
                            className="flex-1 text-center border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700"
                        
                            Cancel

                    </div>
                </form>
            </div>
        </div>
    );
};

export default Create;