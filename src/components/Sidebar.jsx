import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, HelpCircle, Bell, Lightbulb, User, LogOut } from 'lucide-react';

const menuItems = [
    { name: '메인페이지', icon: Home, to: '/' },
    { name: '사용자 라이브러리', icon: BookOpen, to: '/library' },
    { name: '퀴즈 페이지', icon: HelpCircle, to: '/quiz' },
    { name: '리마인더 페이지', icon: Bell, to: '/reminder' },
    { name: '추천 페이지', icon: Lightbulb, to: '/recommend' },
    { name: '마이페이지', icon: User, to: '/mypage' },
];

export default function Sidebar() {
    return (
        <aside className="flex flex-col w-64 bg-white border-r">
            <div className="p-6 font-bold text-xl">LearnClip</div>
            <nav className="flex-1">
                {menuItems.map(({ name, icon: Icon, to }) => (
                    <NavLink
                        key={name}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center px-6 py-3 hover:bg-gray-100 transition-colors ${
                                isActive ? 'bg-red-100 text-red-600' : 'text-gray-700'
                            }`
                        }
                    >
                        <Icon className="mr-3" size={20} />
                        {name}
                    </NavLink>
                ))}
            </nav>
            <button className="flex items-center px-6 py-3 mb-6 hover:bg-gray-100 text-gray-700">
                <LogOut className="mr-3" size={20} />
                로그아웃
            </button>
        </aside>
    );
}