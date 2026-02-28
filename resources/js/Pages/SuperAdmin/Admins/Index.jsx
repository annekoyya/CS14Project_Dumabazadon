import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

const Index = ({ admins = [] }) => {
    const { props } = usePage();
    const flash = props.flash || {};
    const errors = props.errors || {};
    const [resetId, setResetId] = useState(null);
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const handleDeactivate = (id) => {
        if (!confirm('Deactivate this admin? They will no longer be able to log in.')) return;
        router.patch(`/superadmin/admins/${id}/deactivate`);
    };

    const handleActivate = (id) => {
        router.patch(`/superadmin/admins/${id}/activate`);
    };

    const handleDelete = (id) => {
        if (!confirm('Permanently delete this admin? This cannot be undone.')) return;
        router.delete(`/superadmin/admins/${id}`);
    };

    const handleResetPassword = (id) => {
        if (!password || password !== passwordConfirm) {
            alert('Passwords do not match or are empty.');
            return;
        }
        router.patch(`/superadmin/admins/${id}/reset-password`, {
            password,
            password_confirmation: passwordConfirm,
        }, {
            onSuccess: () => {
                setResetId(null);
                setPassword('');
                setPasswordConfirm('');
            },
        });
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Users</h1>
                
                    href="/superadmin/admins/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
                
                    + Create Admin
             
            </div>

            {flash.success && (
                <div className="mb-4 px-4 py-3 bg-green-100 text-green-700 rounded-lg text-sm">
                    {flash.success}
                </div>
            )}

            {errors.error && (
                <div className="mb-4 px-4 py-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {errors.error}
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Created</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((admin) => (
                            <React.Fragment key={admin.id}>
                                <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-4 py-3 font-medium">{admin.name}</td>
                                    <td className="px-4 py-3">{admin.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                            admin.role === 'superadmin'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {admin.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                            admin.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {admin.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{admin.created_at}</td>
                                    <td className="px-4 py-3">
                                        {admin.role !== 'superadmin' && (
                                            <div className="flex flex-wrap gap-2">
                                                {admin.is_active ? (
                                                    <button
                                                        onClick={() => handleDeactivate(admin.id)}
                                                        className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                                                    >
                                                        Deactivate
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleActivate(admin.id)}
                                                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setResetId(resetId === admin.id ? null : admin.id)}
                                                    className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded"
                                                >
                                                    Reset Password
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(admin.id)}
                                                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>

                                {resetId === admin.id && (
                                    <tr className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                        <td colSpan={6} className="px-4 py-4">
                                            <div className="flex flex-wrap gap-3 items-end">
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">New Password</label>
                                                    <input
                                                        type="password"
                                                        value={password}
                                                        onChange={e => setPassword(e.target.value)}
                                                        className="border border-gray-300 rounded px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        placeholder="Min 8 characters"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">Confirm Password</label>
                                                    <input
                                                        type="password"
                                                        value={passwordConfirm}
                                                        onChange={e => setPasswordConfirm(e.target.value)}
                                                        className="border border-gray-300 rounded px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        placeholder="Repeat password"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleResetPassword(admin.id)}
                                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setResetId(null)}
                                                    className="text-sm text-gray-500 hover:underline"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Index;