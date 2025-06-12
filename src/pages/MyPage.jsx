// pages/MyPage.js
import React, { useState } from 'react';
import { Mail, Lock, Trash2, User as UserIcon, Play, Edit } from 'lucide-react'; // Edit 아이콘 임포트
// MyPageModals.js 파일의 경로에 따라 아래 import 경로를 조정해야 합니다.
import { ProfileEditModal, DeleteAccountModal } from '../components/MyPageModals';

/**
 * My Page Component
 * Displays user profile, allows email/password/ID changes, account deletion, and shows recent activity.
 * @param {object} props - Component props.
 * @param {string} props.userEmail - User's current email.
 * @param {string} props.userId - User's ID.
 * @param {function} props.handleSaveProfile - Function to handle saving profile changes (ID/email/password).
 * @param {function} props.handleDeleteAccount - Function to delete user account.
 * @param {Array<object>} props.libraryItems - List of library items for user logs.
 */
const MyPage = ({ userEmail, userId, handleSaveProfile, handleDeleteAccount, libraryItems }) => {
    const [showProfileEditModal, setShowProfileEditModal] = useState(false); // 통합 프로필 수정 모달 상태
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">내 프로필</h3>
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-gray-700">
                        <UserIcon className="h-5 w-5 text-red-500" />
                        <span className="font-semibold">ID:</span>
                        <span>{userId}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-700">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold">이메일:</span>
                        <span>{userEmail}</span>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => setShowProfileEditModal(true)} // 통합 프로필 수정 모달 호출
                        className="w-full bg-indigo-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-indigo-600 transition-colors transform hover:scale-105 shadow-md flex items-center justify-center space-x-2"
                    >
                        <Edit className="h-5 w-5" />
                        <span>프로필 (ID/이메일/비밀번호) 수정</span>
                    </button>
                    <button
                        onClick={() => setShowDeleteAccountModal(true)}
                        className="w-full bg-gray-200 text-red-700 py-3 px-6 rounded-lg font-bold hover:bg-gray-300 transition-colors transform hover:scale-105 shadow-md flex items-center justify-center space-x-2"
                    >
                        <Trash2 className="h-5 w-5" />
                        <span>회원 탈퇴</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">사용자 활동 로그</h3>
                {libraryItems.length === 0 ? (
                    <p className="text-gray-600">아직 요약된 영상이 없습니다. 메인 페이지에서 영상을 요약해보세요!</p>
                ) : (
                    <ul className="space-y-4">
                        {libraryItems.slice(0, 5).map((item) => ( // Display up to 5 recent logs
                            <li key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Play className="h-5 w-5 text-red-500" />
                                <span className="text-gray-700 font-medium truncate">{item.title}</span>
                                <span className="text-gray-500 text-sm">{item.date}</span>
                            </li>
                        ))}
                        {libraryItems.length > 5 && (
                            <li className="text-center text-gray-600 text-sm">
                                ... 더 많은 활동이 있습니다.
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {/* 통합 프로필 수정 모달 */}
            {showProfileEditModal && (
                <ProfileEditModal
                    currentId={userId} // currentId prop 전달
                    currentEmail={userEmail}
                    onClose={() => setShowProfileEditModal(false)}
                    onSave={handleSaveProfile}
                />
            )}

            {/* 회원 탈퇴 모달 */}
            {showDeleteAccountModal && (
                <DeleteAccountModal
                    onClose={() => setShowDeleteAccountModal(false)}
                    onDelete={handleDeleteAccount}
                />
            )}
        </div>
    );
};

export default MyPage;
