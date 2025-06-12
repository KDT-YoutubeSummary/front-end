// pages/MyPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Trash2, User as UserIcon, Play, Edit } from 'lucide-react'; // 필요한 아이콘 임포트
// MyPageModals.js 파일의 경로에 따라 아래 import 경로를 조정해야 합니다.
import { ProfileEditModal, DeleteAccountModal, MessageModal, ReauthModal } from '../components/MyPageModals';

/**
 * My Page Component
 * Displays user profile, allows email/password/ID changes, account deletion, and shows recent activity.
 * @param {object} props - Component props.
 * @param {boolean} props.isLoggedIn - App.jsx에서 관리하는 로그인 상태 (API 호출 조건에 사용).
 * @param {function} props.onUpdateGlobalUserDisplay - 프로필 정보 변경 시 App.jsx의 전역 사용자 표시를 업데이트하는 콜백.
 * @param {function} props.onShowMessage - App.jsx의 MessageModal을 띄우는 콜백 (message, isConfirm, onConfirm).
 * @param {function} props.onShowReauthModal - App.jsx의 ReauthModal을 띄우는 콜백.
 * @param {function} props.onSetReauthCallback - App.jsx의 ReauthModal의 콜백을 설정하는 콜백.
 * @param {function} props.onUserLoggedOut - 회원 탈퇴 성공 시 App.jsx에 로그아웃을 알리는 콜백.
 */
const MyPage = ({ isLoggedIn, onUpdateGlobalUserDisplay, onShowMessage, onShowReauthModal, onSetReauthCallback, onUserLoggedOut }) => {
    // MyPage 내부에서 관리할 상태들
    const [userId, setUserId] = useState(''); // 사용자 ID (백엔드 userName)
    const [userEmail, setUserEmail] = useState(''); // 사용자 이메일
    const [userActivityLogs, setUserActivityLogs] = useState([]); // 사용자 활동 로그

    const [showProfileEditModal, setShowProfileEditModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [loading, setLoading] = useState(true); // 데이터 로딩 상태

    // 인증 토큰을 가져오는 헬퍼 함수
    const getAuthHeader = useCallback(() => {
        const token = localStorage.getItem('accessToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }, []); // 의존성 없음

    // --- MyPage 데이터 조회 (GET /api/mypage) ---
    useEffect(() => {
        const fetchMyPageData = async () => {
            console.log("MyPage: fetchMyPageData 시작");
            if (!isLoggedIn) {
                console.log("MyPage: 사용자 로그인되지 않음. 더미 데이터로 설정.");
                setUserId('로그인 필요');
                setUserEmail('로그인 필요');
                setUserActivityLogs([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                console.log("MyPage: /api/mypage 호출 시도 중...");
                const response = await fetch('http://localhost:8080/api/mypage', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeader(), // 인증 헤더 추가
                    },
                });

                console.log("MyPage: /api/mypage 응답 받음. 상태:", response.status, response.statusText);

                if (response.status === 401 || response.status === 403) {
                    onShowMessage("로그인 세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.");
                    onUserLoggedOut(); // App.jsx에 로그아웃을 알림
                    return; // 함수 종료
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("MyPage: API 응답 오류 데이터:", errorData);
                    throw new Error(errorData.message || `마이페이지 데이터를 불러오는데 실패했습니다. 상태: ${response.status}`);
                }

                const result = await response.json();
                console.log("MyPage: /api/mypage 성공 응답:", result);

                if (result.code === 200 && result.data) {
                    const { recentLogs, userInfo } = result.data;

                    setUserId(userInfo.userName);
                    setUserEmail(userInfo.email);
                    onUpdateGlobalUserDisplay(userInfo.userName, userInfo.email); // App.jsx의 전역 상태 업데이트

                    const formattedLogs = recentLogs.map(log => ({
                        id: `${log.activityType}-${log.targetEntityId}-${log.createdAt}`, // 고유한 key 생성
                        title: log.activityDetail.includes("요약 생성 완료") ? `${log.details.videoTitle} 요약` : log.activityDetail, // 활동 상세 내용
                        date: new Date(log.createdAt).toLocaleDateString('ko-KR'),
                        hashtags: log.details?.summaryType ? [`#${log.details.summaryType}`] : [], // 태그가 있다면 추가
                        thumbnail: `https://i.ytimg.com/vi/${log.details?.videoId || 'dQw4w9WgXcQ'}/mqdefault.jpg`, // videoId가 없다면 더미 썸네일
                    }));
                    setUserActivityLogs(formattedLogs);
                    console.log("MyPage: 데이터 상태 업데이트 완료.");
                } else {
                    console.error("MyPage: API 응답 형식 오류 또는 code가 200이 아님:", result);
                    throw new Error(result.message || "알 수 없는 응답 형식");
                }

            } catch (error) {
                console.error("MyPage: 데이터 로딩 중 예외 발생:", error);
                onShowMessage(`마이페이지 데이터 로딩 오류: ${error.message}`);
                setUserId('로딩 오류');
                setUserEmail('로딩 오류');
                setUserActivityLogs([]);
            } finally {
                setLoading(false);
                console.log("MyPage: fetchMyPageData 종료.");
            }
        };

        fetchMyPageData();
    }, [isLoggedIn, onShowMessage, onUpdateGlobalUserDisplay, onUserLoggedOut, getAuthHeader]); // 필요한 의존성 추가


    // --- 회원 내용 수정 (PUT /api/auth/update) ---
    const handleSaveProfile = async (currentPassword, newEmail, newPassword, newId, closeCallback) => {
        console.log("MyPage: handleSaveProfile 시작");
        try {
            const requestBody = {
                userName: newId,    // 백엔드가 userName 필드를 기대함
                email: newEmail,
            };
            if (newPassword) { // 새 비밀번호가 입력된 경우에만 추가
                requestBody.password = newPassword; // 백엔드가 'password' 필드를 새 비밀번호로 기대
            }
            // 현재 비밀번호(currentPassword)는 인증을 위해 사용되며,
            // 백엔드가 별도의 필드를 요구하지 않는다면 Authorization 헤더로 인증되는 것으로 가정
            // 만약 백엔드가 body에 'currentPassword' 필드를 요구한다면, requestBody에 추가해야 함.
            // 예시: requestBody.currentPassword = currentPassword;

            console.log("MyPage: 프로필 업데이트 요청 본문:", requestBody);

            const response = await fetch('http://localhost:8080/api/auth/update', {
                method: 'PUT', // PUT 메서드 사용
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader(), // 인증 헤더 추가
                },
                body: JSON.stringify(requestBody),
            });

            console.log("MyPage: 프로필 업데이트 응답 받음. 상태:", response.status, response.statusText);

            if (response.status === 401 || response.status === 403) {
                onShowMessage("로그인 세션이 만료되었거나 권한이 없어 프로필 업데이트에 실패했습니다. 다시 로그인해주세요.");
                onUserLoggedOut();
                return;
            }

            if (!response.ok) {
                const errorData = await response.json(); // 응답이 JSON이 아닐 경우 parse 에러 발생 가능
                console.error("MyPage: 프로필 업데이트 응답 오류 데이터:", errorData);
                throw new Error(errorData.message || `프로필 업데이트에 실패했습니다. 상태: ${response.status}`);
            }

            const result = await response.json();
            console.log("MyPage: 프로필 업데이트 성공 응답:", result);

            // 성공 응답 구조: {"userId": 2,"userName": "yeeun3641","email": "test2@example.com","message": "회원정보가 성공적으로 변경되었습니다."}
            if (result.userName && result.email) { // 응답에 사용자 정보가 포함된 경우
                onShowMessage(result.message || '프로필이 성공적으로 업데이트되었습니다.');
                setUserId(result.userName);    // 로컬 상태 업데이트
                setUserEmail(result.email); // 로컬 상태 업데이트
                onUpdateGlobalUserDisplay(result.userName, result.email); // App.jsx의 전역 상태 업데이트
                closeCallback(); // 모달 닫기
            } else {
                // 백엔드가 성공 응답 시 message만 주거나 다른 구조일 경우
                onShowMessage(result.message || '프로필 업데이트 완료 (응답 데이터 불확실).');
                // 필요하다면 다시 마이페이지 데이터를 불러와 상태 동기화
                // fetchMyPageData();
                closeCallback();
            }

        } catch (error) {
            console.error("MyPage: 프로필 업데이트 중 예외 발생:", error);
            onShowMessage(`프로필 업데이트 오류: ${error.message}`);
        }
    };

    // --- 회원 탈퇴 (DELETE /api/auth/delete) ---
    const handleDeleteAccount = async (password, reauthModalCloseCallback) => {
        console.log("MyPage: handleDeleteAccount 시작");
        try {
            console.log("MyPage: 회원 탈퇴 요청 시도 중...");
            const response = await fetch('http://localhost:8080/api/auth/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader(), // 인증 헤더 추가
                },
                body: JSON.stringify({ password: password }), // 비밀번호를 본문에 담아 전송
            });

            console.log("MyPage: 회원 탈퇴 응답 받음. 상태:", response.status, response.statusText);

            if (response.status === 401 || response.status === 403) {
                onShowMessage("로그인 세션이 만료되었거나 권한이 없어 회원 탈퇴에 실패했습니다. 다시 로그인해주세요.");
                onUserLoggedOut();
                reauthModalCloseCallback();
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.error("MyPage: 회원 탈퇴 응답 오류 데이터:", errorData);
                throw new Error(errorData.message || `회원 탈퇴에 실패했습니다. 상태: ${response.status}`);
            }

            const result = await response.json();
            console.log("MyPage: 회원 탈퇴 성공 응답:", result);

            onShowMessage('회원 탈퇴가 완료되었습니다.');
            onUserLoggedOut(); // App.jsx에 로그아웃을 알림
            reauthModalCloseCallback(); // ReauthModal 닫기

        } catch (error) {
            console.error("MyPage: 회원 탈퇴 중 예외 발생:", error);
            onShowMessage(`회원 탈퇴 오류: ${error.message}`);
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-full w-full text-gray-500 text-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3"></div>
                마이페이지 데이터를 불러오는 중...
            </div>
        );
    }

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
                        onClick={() => setShowProfileEditModal(true)}
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
                {userActivityLogs.length === 0 ? (
                    <p className="text-gray-600">아직 요약된 영상이 없습니다. 메인 페이지에서 영상을 요약해보세요!</p>
                ) : (
                    <ul className="space-y-4">
                        {userActivityLogs.slice(0, 5).map((item) => ( // Display up to 5 recent logs
                            <li key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Play className="h-5 w-5 text-red-500" />
                                <span className="text-gray-700 font-medium truncate">{item.title}</span>
                                <span className="text-gray-500 text-sm">{item.date}</span>
                            </li>
                        ))}
                        {userActivityLogs.length > 5 && (
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
                    currentId={userId}
                    currentEmail={userEmail}
                    onClose={() => setShowProfileEditModal(false)}
                    onSave={handleSaveProfile}
                />
            )}

            {/* 회원 탈퇴 모달 */}
            {showDeleteAccountModal && (
                <DeleteAccountModal
                    onClose={() => setShowDeleteAccountModal(false)}
                    // onDelete는 재인증을 위해 App.jsx의 ReauthModal을 거치도록 콜백 설정
                    onDelete={(password) => {
                        // ReauthModal을 띄우기 위한 콜백 설정
                        onSetReauthCallback(() => (reauthUserPassword, reauthModalCloseCallback) => {
                            // ReauthModal에서 받은 비밀번호를 실제 handleDeleteAccount에 전달
                            handleDeleteAccount(reauthUserPassword, reauthModalCloseCallback); // reauthModalCloseCallback도 전달
                        });
                        onShowReauthModal(true); // ReauthModal 띄우기
                        setShowDeleteAccountModal(false); // DeleteAccountModal 닫기
                    }}
                />
            )}
        </div>
    );
};

export default MyPage;
