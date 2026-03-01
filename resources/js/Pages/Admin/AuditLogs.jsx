import React from 'react';
import Layout from '@/Layouts/Layout';
import { usePage } from '@inertiajs/react';

const actionColors = {
    login:              'bg-blue-100 text-blue-700',
    logout:             'bg-gray-100 text-gray-600',
    login_failed:       'bg-red-100 text-red-600',
    '2fa_triggered':    'bg-yellow-100 text-yellow-700',
    created:            'bg-green-100 text-green-700',
    updated:            'bg-yellow-100 text-yellow-700',
    deleted:            'bg-red-100 text-red-700',
    restored:           'bg-teal-100 text-teal-700',
    backup_created:     'bg-purple-100 text-purple-700',
    backup_downloaded:  'bg-purple-100 text-purple-700',
    backup_deleted:     'bg-red-100 text-red-700',
    backup_manual_trigger: 'bg-purple-100 text-purple-700',
    admin_created:      'bg-orange-100 text-orange-700',
    admin_deactivated:  'bg-red-100 text-red-700',
    admin_activated:    'bg-green-100 text-green-700',
    admin_deleted:      'bg-red-100 text-red-700',
    admin_password_reset: 'bg-pink-100 text-pink-700',
    password_changed:   'bg-pink-100 text-pink-700',
    login_blocked_inactive: 'bg-red-100 text-red-700',
};

const AuditLogs = ({ title, logs }) => {
    const entries = logs?.data ?? [];
    const currentPage = logs?.current_page ?? 1;
    const lastPage = logs?.last_page ?? 1;

    const goTo = (url) => {
        if (url) window.location.href = url;
    };

    return (
        <Layout page_title={title || 'Audit Logs'}>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                    <span className="text-sm text-gray-500">{logs?.total ?? 0} total entries</span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="bg-gray-100 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">Time</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Action</th>
                                <th className="px-4 py-3">Model</th>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">IP Address</th>
                                <th className="px-4 py-3">Changes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                        No audit log entries found.
                                    </td>
                                </tr>
                            )}
                            {entries.map((log) => (
                                <tr key={log.id} className="border-t border-gray-200 hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                        {log.created_at}
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        {log.user_email ?? <span className="text-gray-400">system</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${actionColors[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs">{log.model ?? '—'}</td>
                                    <td className="px-4 py-3 text-xs">{log.model_id ?? '—'}</td>
                                    <td className="px-4 py-3 text-xs">{log.ip_address ?? '—'}</td>
                                    <td className="px-4 py-3 text-xs max-w-xs">
                                        {log.changes ? (
                                            <pre className="text-xs bg-gray-50 rounded p-1 overflow-x-auto max-w-[200px]">
                                                {typeof log.changes === 'string'
                                                    ? log.changes
                                                    : JSON.stringify(log.changes, null, 2)}
                                            </pre>
                                        ) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                        <span>Page {currentPage} of {lastPage}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => goTo(logs?.prev_page_url)}
                                disabled={!logs?.prev_page_url}
                                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ← Previous
                            </button>
                            <button
                                onClick={() => goTo(logs?.next_page_url)}
                                disabled={!logs?.next_page_url}
                                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AuditLogs;