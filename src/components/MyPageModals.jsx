import React, { useState } from 'react';
import { X, Mail, Lock, Trash2, User as UserIcon } from 'lucide-react';

// ProfileEditModal 컴포넌트는 사용자가 ID, 이메일, 비밀번호를 한 번에 변경할 수 있는 모달입니다.
export const ProfileEditModal = ({ currentId, currentEmail, onClose, onSave }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newId, setNewId] = useState(currentId); // ID 수정을 위한 새로운 상태
    const [newEmail, setNewEmail] = useState(currentEmail);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (!currentPassword.trim()) {
            setMessage('현재 비밀번호를 입력해주세요.');
            return;
        }
        if (newPassword && newPassword !== confirmNewPassword) {
            setMessage('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        setMessage(''); // 이전 메시지 초기화
        // onSave 함수에 newId 값도 함께 전달
        onSave(currentPassword, newEmail, newPassword, newId, onClose);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">프로필 수정</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-7 w-7" />
                    </button>
                </div>
                <div className="space-y-4">
                    {message && <p className="text-red-500 text-sm text-center">{message}</p>}
                    <p className="text-gray-700 text-sm">변경사항 적용을 위해 현재 비밀번호를 입력해주세요.</p>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">현재 비밀번호 <span className="text-red-500">*</span></label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                            placeholder="현재 비밀번호를 입력하세요"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">새 ID</label> {/* ID 입력 필드 추가 */}
                        <input
                            type="text"
                            value={newId}
                            onChange={(e) => setNewId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">새 이메일</label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">새 비밀번호 (선택 사항)</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="변경하지 않으려면 비워두세요."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                        />
                    </div>
                    {newPassword && ( // 새 비밀번호 입력 시에만 확인 필드 표시
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">새 비밀번호 확인</label>
                            <input
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                            />
                        </div>
                    )}
                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-600 transition-colors transform hover:scale-105 shadow-md"
                        >
                            저장
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold hover:bg-gray-300 transition-colors transform hover:scale-105"
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// // DeleteAccountModal 컴포넌트는 사용자가 계정을 삭제하기 전에 비밀번호를 입력하도록 요청하는 모달입니다.
export const DeleteAccountModal = ({ onClose, onDelete }) => {
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        setMessage(''); // 이전 메시지 초기화
        onDelete(password);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">회원 탈퇴</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-7 w-7" />
                    </button>
                </div>
                <div className="space-y-4">
                    <p className="text-gray-700">회원 탈퇴를 계속하려면 비밀번호를 입력하세요.</p>
                    {message && <p className="text-red-500 text-sm text-center">{message}</p>}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                        />
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-600 transition-colors transform hover:scale-105 shadow-md"
                        >
                            탈퇴하기
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold hover:bg-gray-300 transition-colors transform hover:scale-105"
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// MessageModal 컴포넌트는 사용자에게 메시지를 표시하는 모달입니다.
export const MessageModal = ({ message, onClose, onConfirm, isConfirm = false }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-auto text-center animate-fade-in-up">
                <h3 className="text-xl font-bold text-gray-800 mb-4">알림</h3>
                <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>
                <div className="flex space-x-3">
                    {isConfirm && (
                        <button
                            onClick={onConfirm}
                            className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-600 transition-colors transform hover:scale-105 shadow-md"
                        >
                            확인
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className={`flex-1 ${isConfirm ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-red-500 text-white hover:bg-red-600'} py-3 px-6 rounded-lg font-bold transition-colors transform hover:scale-105 shadow-md`}
                    >
                        {isConfirm ? '취소' : '확인'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ReauthModal 컴포넌트는 민감한 작업을 수행하기 전에 사용자가 비밀번호를 입력하도록 요청하는 모달입니다.
export const ReauthModal = ({ onClose, onReauthenticate }) => {
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (!password.trim()) {
            setMessage('비밀번호를 입력해주세요.');
            return;
        }
        setMessage(''); // 이전 메시지 초기화
        console.log('ReauthModal: 인증 버튼 클릭됨, 비밀번호:', password);
        if (onReauthenticate) {
            onReauthenticate(password, onClose); // 재인증 후 콜백 실행
        } else {
            console.error('ReauthModal: onReauthenticate 콜백이 없습니다.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">재인증 필요</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-7 w-7" />
                    </button>
                </div>
                <div className="space-y-4">
                    <p className="text-gray-700">이 작업은 보안상 재인증이 필요합니다. 비밀번호를 다시 입력해주세요.</p>
                    {message && <p className="text-red-500 text-sm text-center">{message}</p>}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                            placeholder="비밀번호를 입력하세요"
                        />
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-600 transition-colors transform hover:scale-105 shadow-md"
                        >
                            인증
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold hover:bg-gray-300 transition-colors transform hover:scale-105"
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
