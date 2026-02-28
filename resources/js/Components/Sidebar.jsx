import React, { useState } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import '../../css/app.css';

const Sidebar = ({ className }) => {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const isSuperAdmin = user?.role === 'superadmin';
    const [showProfile, setShowProfile] = useState(false);

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <aside
            id="default-sidebar"
            className={`sticky top-0 left-0 z-30 w-80 rounded-xl h-[96.5%] px-6 py-4 bg-[--color-1] border-blue-gray-100 shadow-sm ${className}`}
        >
            <ul className="space-y-2 font-medium flex flex-col justify-between h-full">

                <div className='flex flex-col gap-3'>

                    {/* Role Label */}
                    <div className='text-center mb-2'>
                        <h1 className='text-xl font-bold text-[--color-darkest]'>
                            {isSuperAdmin ? 'SUPERADMIN' : 'ADMIN'}
                        </h1>
                        {isSuperAdmin && (
                            <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                                Super Administrator
                            </span>
                        )}
                    </div>

                    {/* Profile Button */}
                    <div className="relative mb-2">
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                        >
                            <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                            </div>
                            <svg className={`ml-auto w-4 h-4 text-gray-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Profile Dropdown */}
                        {showProfile && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-lg">
                                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                                            isSuperAdmin
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {isSuperAdmin ? 'Super Admin' : 'Admin'}
                                        </span>
                                    </div>
                                </div>
 <div className="border-t border-gray-100 pt-3 space-y-2">
    <p className="text-xs text-gray-400 mb-1">Account Status</p>
    <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
        Active
    </span>
    <div className="pt-1">
        
            href="/password/change"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 p-2 rounded hover:bg-blue-50"
        
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Change Password
        
  
</div>
                                <button
                                    onClick={handleLogout}
                                    className="mt-3 w-full text-left text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-2 p-2 rounded hover:bg-red-50"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                    {/* SuperAdmin Links */}
                    {isSuperAdmin && (
                        <li>
                            <Link
                                href="/superadmin/admins"
                                className={`flex items-center p-3 rounded-lg ${url.startsWith('/superadmin') ? 'bg-gray-900 text-white' : 'hover:bg-gray-300'}`}
                            >
                                <svg className="shrink-0 w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 18" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"/>
                                </svg>
                                <span className="flex-1 ms-3 whitespace-nowrap">Manage Admins</span>
                            </Link>
                        </li>
                    )}

                    {/* Admin Links — shown to both roles */}
                    <li>
                        <Link href={route('dashboard')} className={`flex items-center p-3 rounded-lg ${url === '/' || url === '/dashboard' ? 'bg-gray-900 text-white' : 'hover:bg-gray-300'}`}>
                            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 22 21">
                                <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"/>
                                <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"/>
                            </svg>
                            <span className="ms-3">Dashboard</span>
                        </Link>
                    </li>

                    <li>
                        <Link href={route('demographic-profile')} className={`flex items-center p-3 rounded-lg ${url === '/demographic-profile' ? 'bg-gray-900 text-white' : 'hover:bg-gray-300'}`}>
                            <svg className="shrink-0 w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 18">
                                <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"/>
                            </svg>
                            <span className="flex-1 ms-3 whitespace-nowrap">Demographic Profile</span>
                        </Link>
                    </li>

                    <li>
                        <Link href={route('social-services')} className={`flex items-center p-3 rounded-lg ${url === '/social-services' ? 'bg-gray-900 text-white' : 'hover:bg-gray-300'}`}>
                            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z"/>
                            </svg>
                            <span className="flex-1 ms-3 whitespace-nowrap">Social Services</span>
                        </Link>
                    </li>

                    <li>
                        <Link href={route('economic-activities')} className={`flex items-center p-3 rounded-lg ${url === '/economic-activities' ? 'bg-gray-900 text-white' : 'hover:bg-gray-300'}`}>
                            <svg className="shrink-0 w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 18 18">
                                <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"/>
                            </svg>
                            <span className="flex-1 ms-3 whitespace-nowrap">Economic Activities</span>
                        </Link>
                    </li>

                    <li>
                        <Link href={route('community-engagement')} className={`flex items-center p-3 rounded-lg ${url === '/community-engagement' ? 'bg-gray-900 text-white' : 'hover:bg-gray-300'}`}>
                            <svg className="shrink-0 w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 18 20">
                                <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z"/>
                            </svg>
                            <span className="flex-1 ms-3 whitespace-nowrap">Community Engagement</span>
                        </Link>
                    </li>

                    <li>
                        <Link
                            href={route('resident')}
                            className={`flex items-center p-3 rounded-lg ${
                                url.startsWith('/residents-and-households') ? 'bg-gray-900 text-white' : 'hover:bg-gray-300'
                            }`}
                        >
                            <svg className="shrink-0 w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 18 20">
                                <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z"/>
                            </svg>
                            <span className="flex-1 ms-3 whitespace-nowrap">Residents & Other Data</span>
                        </Link>
                    </li>

                    {/* Audit Logs & Backups — both roles */}
                    <li>
                        <Link href="/audit-logs" className={`flex items-center p-3 rounded-lg ${url === '/audit-logs' ? 'bg-gray-900 text-white' : 'hover:bg-gray-300'}`}>
                            <svg className="shrink-0 w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z"/>
                                <path d="M6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397Z"/>
                            </svg>
                            <span className="flex-1 ms-3 whitespace-nowrap">Audit Logs</span>
                        </Link>
                    </li>

                    <li>
                        <Link href="/backups" className={`flex items-center p-3 rounded-lg ${url === '/backups' ? 'bg-gray-900 text-white' : 'hover:bg-gray-300'}`}>
                            <svg className="shrink-0 w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                            </svg>
                            <span className="flex-1 ms-3 whitespace-nowrap">Backups</span>
                        </Link>
                    </li>

                </div>

                {/* Logout at bottom */}
                <div className='pb-5'>
                    <li className='mt-auto'>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center p-3 text-gray-900 rounded-lg hover:bg-gray-300 hover:text-black group"
                        >
                            <svg className="shrink-0 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 18 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"/>
                            </svg>
                            <span className="flex-1 ms-3 whitespace-nowrap">Logout</span>
                        </button>
                    </li>
                </div>

            </ul>
        </aside>
    );
};

export default Sidebar;