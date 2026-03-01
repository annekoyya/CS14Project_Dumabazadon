import React from 'react';
import Layout from '@/Layouts/Layout';
import { Link } from '@inertiajs/react';

export default function AuditLogs({ title, logs }) {
    return (
        <Layout page_title={title}>
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">{title}</h1>
                {logs.data.length === 0 ? (
                    <p className="text-gray-500">No audit logs yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">Time</th>
                                    <th className="px-4 py-2">User</th>
                                    <th className="px-4 py-2">Action</th>
                                    <th className="px-4 py-2">Model</th>
                                    <th className="px-4 py-2">ID</th>
                                    <th className="px-4 py-2">IP Address</th>
                                    <th className="px-4 py-2">Changes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="text-sm">
                                        <td className="border px-4 py-2">{log.created_at}</td>
                                        <td className="border px-4 py-2">{log.user_email}</td>
                                        <td className="border px-4 py-2">
                                            <span className={
                                                "px-2 py-1 rounded text-white text-xs " +
                                                ({
                                                    login: 'bg-blue-500',
                                                    deleted: 'bg-red-500',
                                                    created: 'bg-green-500',
                                                    updated: 'bg-yellow-500',
                                                    backup: 'bg-purple-500',
                                                    admin: 'bg-orange-500',
                                                    password: 'bg-pink-500'
                                                }[log.action] || 'bg-gray-500')
                                            }>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="border px-4 py-2">{log.model}</td>
                                        <td className="border px-4 py-2">{log.model_id}</td>
                                        <td className="border px-4 py-2">{log.ip_address}</td>
                                        <td className="border px-4 py-2 whitespace-pre-wrap">{log.changes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4 flex justify-between">
                            {logs.prev_page_url && (
                                <Link href={logs.prev_page_url} className="text-blue-600">Previous</Link>
                            )}
                            {logs.next_page_url && (
                                <Link href={logs.next_page_url} className="text-blue-600">Next</Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}