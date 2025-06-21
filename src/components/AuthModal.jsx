// src/components/AuthModal.jsx

import React from 'react';
import AuthPage from '../pages/AuthPage.jsx'; // 기존 AuthPage 컴포넌트를 임포트합니다.
import { X } from 'lucide-react'; // 모달 닫기 버튼에 사용할 아이콘 임포트

// 이 컴포넌트는 AuthPage를 모달로 감싸고, 배경 오버레이와 닫기 버튼을 추가합니다.
const AuthModal = ({ onLogin, onSignup, onClose, onMessage }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 pt-20">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-lg w-full mx-auto relative animate-fade-in-up mt-20">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="닫기" // 접근성을 위해 aria-label 추가
                >
                    <X className="h-6 w-6" /> {/* X 아이콘 */}
                </button>

                <AuthPage
                    onLogin={onLogin}
                    onSignup={onSignup}
                    onMessage={onMessage}
                />
            </div>
        </div>
    );
};

export default AuthModal;