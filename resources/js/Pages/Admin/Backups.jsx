import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import Layout from '@/Layouts/Layout'; // Adjust path to your Layout component

const Backups = ({ backups = [] }) => {
    const { props } = usePage();
    const flash = props.flash || {};
    const [loading, setLoading] = useState(false);

    const primary = backups.filter(b => b.type === 'primary');
    const offline = backups.filter(b => b.type === 'offline');

    const handleRunNow = () => {
        if (!confirm('Run a manual backup now?')) return;
        setLoading(true);
        router.post('/backups/run', {}, {
            onFinish: () => setLoading(false),
        });
    };

    const handleDownload = (filename, type) => {
        window.location.href = `/backups/download?filename=${encodeURIComponent(filename)}&type=${type}`;
    };

    const handleDelete = (filename, type) => {
        if (!confirm(`Delete backup: ${filename}?`)) return;
        router.delete('/backups/delete', {
            data: { filename, type },
        });
    };

    const BackupTable = ({ title, data, color }) => (
        <div className="mb-8">
            <h2 className={`text-lg font-semibold mb-3 text-${color}-700 dark:text-${color}-400`}>
                {title}
            </h2>

            {data.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No backups found.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">Filename</th>
                                <th className="px-4 py-3">Size</th>
                                <th className="px-4 py-3">Encrypted</th>
                                <th className="px-4 py-3">Created At</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((backup, i) => (
                                <tr
                                    key={i}
                                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <td className="px-4 py-3 font-mono text-xs">{backup.filename}</td>
                                    <td className="px-4 py-3">{backup.size_kb} KB</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                                            AES-256
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{backup.created_at}</td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button
                                            onClick={() => handleDownload(backup.filename, backup.type)}
                                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                        >
                                            Download
                                        </button>
                                        <button
                                            onClick={() => handleDelete(backup.filename, backup.type)}
                                            className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <Layout>
            <div className="p-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Database Backups
                    </h1>
                    <button
                        onClick={handleRunNow}
                        disabled={loading}
                        className={`text-sm font-medium px-4 py-2 rounded-lg text-white ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {loading ? 'Running...' : '+ Run Backup Now'}
                    </button>
                </div>

                {flash.success && (
                    <div className="mb-4 px-4 py-3 bg-green-100 text-green-700 rounded-lg text-sm dark:bg-green-900 dark:text-green-300">
                        {flash.success}
                    </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6 text-sm text-blue-800 dark:text-blue-300">
                    <strong>How to restore a backup:</strong> Download the <code>.sqlite.enc</code> file,
                    place it on the server, then run:<br />
                    <code className="block mt-1 font-mono bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        php artisan backup:decrypt /path/to/backup.sqlite.enc
                    </code>
                </div>

                <BackupTable
                    title="Primary Backups (storage/app/backups)"
                    data={primary}
                    color="blue"
                />

                <BackupTable
                    title="Offline Copies (storage/app/backups_offline)"
                    data={offline}
                    color="purple"
                />
            </div>
        </Layout>
    );
};

export default Backups;