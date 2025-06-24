// pages/MyPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Trash2, User as UserIcon, Play, Edit, User, Settings, Sparkles } from 'lucide-react';
import { ProfileEditModal, DeleteAccountModal, MessageModal, ReauthModal } from '../components/MyPageModals';
import AuthModal from '../components/AuthModal';
import axios from 'axios';


const MyPage = ({ isLoggedIn, onUpdateGlobalUserDisplay, onShowMessage, onShowReauthModal, onSetReauthCallback, onUserLoggedOut }) => {
    // MyPage 내부에서 관리할 상태들
    const [userId, setUserId] = useState(''); // 사용자 ID (백엔드 userName)
    const [userEmail, setUserEmail] = useState(''); // 사용자 이메일
    const [userActivityLogs, setUserActivityLogs] = useState([]); // 사용자 활동 로그

    const [showProfileEditModal, setShowProfileEditModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [loading, setLoading] = useState(true); // 데이터 로딩 상태

    // --- MyPage 데이터 조회 (GET /api/mypage) ---
    useEffect(() => {
        const fetchMyPageData = async () => {
            console.log("MyPage: fetchMyPageData 시작");
            
            // 더 엄격한 로그인 상태 체크
            const token = localStorage.getItem('accessToken');
            const userId = localStorage.getItem('userId');
            const userName = localStorage.getItem('username');
            
            if (!isLoggedIn || !token || !userId || !userName) {
                console.log("MyPage: 사용자 로그인되지 않음 또는 불완전한 인증 정보");
                setUserId('로그인 필요');
                setUserEmail('로그인 필요');
                setUserActivityLogs([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                console.log("MyPage: /api/mypage 호출 시도 중...");
                const response = await axios.get('http://52.78.6.200/api/mypage', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 300000 // 5분 타임아웃
                });

                console.log("MyPage: /api/mypage 응답 받음. 상태:", response.status, response.statusText);

                if (response.status === 401 || response.status === 403) {
                    onShowMessage("로그인 세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.");
                    onUserLoggedOut(); // App.jsx에 로그아웃을 알림
                    return; // 함수 종료
                }

                if (response.status !== 200) {
                    console.error("MyPage: API 응답 오류 데이터:", response.data);
                    throw new Error(response.data.message || `마이페이지 데이터를 불러오는데 실패했습니다. 상태: ${response.status}`);
                }

                const result = response.data;
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
    }, [isLoggedIn, onShowMessage, onUpdateGlobalUserDisplay, onUserLoggedOut]);


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

            console.log("MyPage: 프로필 업데이트 요청 본문:", requestBody);

            const response = await axios.put('http:/52.78.6.200/api/auth/update', requestBody);

            console.log("MyPage: 프로필 업데이트 응답 받음. 상태:", response.status, response.statusText);

            if (response.status === 401 || response.status === 403) {
                onShowMessage("로그인 세션이 만료되었거나 권한이 없어 프로필 업데이트에 실패했습니다. 다시 로그인해주세요.");
                onUserLoggedOut();
                return;
            }

            if (response.status !== 200) {
                console.error("MyPage: 프로필 업데이트 응답 오류 데이터:", response.data);
                throw new Error(response.data.message || `프로필 업데이트에 실패했습니다. 상태: ${response.status}`);
            }

            const result = response.data;
            console.log("MyPage: 프로필 업데이트 성공 응답:", result);

            // 성공 응답 구조: {"userId": 2,"userName": "yeeun3641","email": "test2@example.com","message": "회원정보가 성공적으로 변경되었습니다."}
            // 백엔드가 성공 시 code 필드 없이 직접 데이터를 반환하는 경우에 대비
            if (result.userName && result.email) {
                // 새로운 토큰이 있다면 업데이트
                if (result.accessToken) {
                    localStorage.setItem('accessToken', result.accessToken);
                }
                
                // 사용자 정보 업데이트
                localStorage.setItem('username', result.userName);
                if (result.userId) {
                    localStorage.setItem('userId', result.userId);
                }
                
                onShowMessage(result.message || '프로필이 성공적으로 업데이트되었습니다.');
                setUserId(result.userName);    // 로컬 상태 업데이트
                setUserEmail(result.email); // 로컬 상태 업데이트
                onUpdateGlobalUserDisplay(result.userName, result.email); // App.jsx의 전역 상태 업데이트
                closeCallback(); // 모달 닫기
            } else {
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
            const response = await axios.delete('http://52.78.6.200/api/auth/delete', {
                data: { password: password }, // 비밀번호를 본문에 담아 전송
            });

            console.log("MyPage: 회원 탈퇴 응답 받음. 상태:", response.status, response.statusText);

            if (response.status === 401 || response.status === 403) {
                onShowMessage("로그인 세션이 만료되었거나 권한이 없어 회원 탈퇴에 실패했습니다. 다시 로그인해주세요.");
                onUserLoggedOut();
                reauthModalCloseCallback();
                return;
            }

            if (response.status !== 200) {
                console.error("MyPage: 회원 탈퇴 응답 오류 데이터:", response.data);
                throw new Error(response.data.message || `회원 탈퇴에 실패했습니다. 상태: ${response.status}`);
            }

            const result = response.data;
            console.log("MyPage: 회원 탈퇴 성공 응답:", result);

            onShowMessage('회원 탈퇴가 완료되었습니다.');
            onUserLoggedOut('회원 탈퇴가 완료되었습니다.'); // 회원탈퇴 메시지 전달
            reauthModalCloseCallback(); // ReauthModal 닫기

        } catch (error) {
            console.error("MyPage: 회원 탈퇴 중 예외 발생:", error);
            onShowMessage(`회원 탈퇴 오류: ${error.message}`);
        }
    };


    // 로그인되지 않은 상태 체크
    const token = localStorage.getItem('accessToken');
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('username');
    
    if (!isLoggedIn || !token || !storedUserId || !storedUserName) {
        return (
            <div className="flex justify-center items-center h-full w-full">
                <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">로그인이 필요합니다</h3>
                    <p className="text-gray-600 mb-6">마이페이지를 이용하려면 먼저 로그인해주세요.</p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                        홈으로 이동
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full w-full text-gray-500 text-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3"></div>
                마이페이지 데이터를 불러오는 중...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* 프로필 섹션 */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                        <UserIcon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 text-left">내 프로필</h3>
                        <p className="text-gray-600 text-left text-base">계정 정보를 확인하고 관리하세요</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 text-gray-700 mb-2">
                            <UserIcon className="h-5 w-5 text-red-500" />
                            <span className="font-semibold text-sm text-gray-600 text-left">사용자 ID</span>
                        </div>
                        <span className="text-lg font-medium text-gray-800 text-left">{userId}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 text-gray-700 mb-2">
                            <Mail className="h-5 w-5 text-red-500" />
                            <span className="font-semibold text-sm text-gray-600 text-left">이메일</span>
                        </div>
                        <span className="text-lg font-medium text-gray-800 text-left">{userEmail}</span>
                    </div>
                </div>

                {/* 프로필 수정과 회원 탈퇴 버튼을 한 행에 배치 */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setShowProfileEditModal(true)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-lg font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 group text-base"
                    >
                        <Edit className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                        <span>프로필 수정</span>
                    </button>
                    <button
                        onClick={() => setShowDeleteAccountModal(true)}
                        className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-6 rounded-lg font-bold hover:from-gray-200 hover:to-gray-300 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 group border border-gray-300 text-base"
                    >
                        <Trash2 className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />
                        <span>회원 탈퇴</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-left">사용자 활동 로그</h3>
                {userActivityLogs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="h-10 w-10 text-gray-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">첫 번째 활동을 기록해보세요!</h3>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed text-base">
                            YouTube 영상을 요약하면<br />
                            <span className="font-semibold text-gray-600">활동 로그</span>에 기록됩니다.
                        </p>

                        <div className="flex flex-col gap-4 justify-center items-center">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="bg-gray-500 text-white py-3 px-8 rounded-lg font-bold hover:bg-gray-600 transition-colors transform hover:scale-105 shadow-md flex items-center space-x-2 text-base"
                            >
                                <Play className="h-5 w-5" />
                                <span>영상 요약하기</span>
                            </button>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <User className="h-4 w-4" />
                                <span>활동 기록</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {userActivityLogs.slice(0, 5).map((item) => ( // Display up to 5 recent logs
                            <li key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Play className="h-5 w-5 text-red-500" />
                                <span className="text-gray-700 font-medium truncate text-base">{item.title}</span>
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
