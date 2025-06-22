import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Library, HelpCircle, Bell, Lightbulb, User, Play } from 'lucide-react';

const menuItems = [
    { path: '/main', icon: Home, label: '메인페이지' },
    { path: '/library', icon: Library, label: '사용자 라이브러리' },
    { path: '/quiz', icon: HelpCircle, label: '퀴즈 페이지' },
    { path: '/reminder', icon: Bell, label: '리마인더 페이지' },
    { path: '/recommendation', icon: Lightbulb, label: '추천 페이지' },
    { path: '/mypage', icon: User, label: '마이페이지' },
];

export default function Layout({ children }) {
    const { pathname } = useLocation();
    return (
        <div className="flex h-screen bg-gray-50 font-inter">
            <aside className="w-64 bg-white shadow-lg border-r border-gray-200 rounded-tr-xl rounded-br-xl">
                <div className="p-6 border-b border-gray-200 flex items-center space-x-2">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                        <Play className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-800">LearnClip</h1>
                </div>
                <nav className="mt-6">
                    {menuItems.map(item => {
                        const active = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-6 py-4 space-x-3 hover:bg-red-50 transition-all ${
                                    active ? 'bg-red-100 text-red-700 border-r-4 border-red-500 font-semibold' : 'text-gray-700'
                                }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {menuItems.find(i => i.path === pathname)?.label}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600 text-sm">로그인 필요</span>
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
                            MO
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8 bg-gray-100">{children}</main>
            </div>
        </div>
    );
}