import React, { useState } from 'react';
import axios from 'axios';
import { FileText, Play, Sparkles } from 'lucide-react';
import SummaryTypingGame from '../components/game/SummaryTypingGame';

export default function SummaryPage({ onShowAuthModal, isLoggedIn }) {
    const [summaryType, setSummaryType] = useState('기본 요약');
    const [userPurpose, setUserPurpose] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [summaryData, setSummaryData] = useState(null); // 백엔드 SummaryResponseDTO에 매핑
    const [error, setError] = useState('');
    const [summaryComplete, setSummaryComplete] = useState(false);

    const summaryTypesOptions = ['기본 요약', '3줄 요약', '키워드 요약', '타임라인 요약'];
    const summaryTypeMap = {
        '기본 요약': 'BASIC',
        '3줄 요약': 'THREE_LINE',
        '키워드 요약': 'KEYWORD',
        '타임라인 요약': 'TIMELINE'
    };



    const handleSubmit = async () => {
        // 로그인 체크 먼저 수행
        if (!isLoggedIn) {
            onShowAuthModal();
            return;
        }
        
        if (!youtubeUrl.trim()) {
            setError('YouTube URL을 입력해주세요.');
            return;
        }

        // YouTube URL 유효성 검사
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/;
        if (!youtubeRegex.test(youtubeUrl.trim())) {
            setError('올바른 YouTube URL을 입력해주세요.\n\n예시:\n• https://www.youtube.com/watch?v=VIDEO_ID\n• https://youtu.be/VIDEO_ID');
            return;
        }

        const token = localStorage.getItem('accessToken');
        const rawUserId = localStorage.getItem('userId');
        const userId = rawUserId && !isNaN(Number(rawUserId)) ? parseInt(rawUserId, 10) : null;

        // 토큰 유효성 검사 강화
        if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
            setError('🔐 로그인 토큰이 없습니다.\n\n페이지를 새로고침하여 다시 로그인해주세요.');
            return;
        }

        if (!userId || userId <= 0) {
            setError('👤 사용자 정보를 찾을 수 없습니다.\n\n페이지를 새로고침하여 다시 로그인해주세요.');
            return;
        }

        // JWT 토큰 기본 형식 검증 (선택적)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            console.warn('⚠️ 잘못된 JWT 토큰 형식');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userId');
            setError('🔐 잘못된 토큰 형식입니다.\n\n페이지를 새로고침하여 다시 로그인해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSummaryData(null); // 새로운 요약 요청 시 기존 요약 데이터 초기화

        try {
            console.log('--- 요약 요청 시작 ---');
            console.log('🔐 accessToken:', token ? `존재함 (길이: ${token.length})` : '없음');
            console.log('👤 userId:', userId);
            console.log('🔗 YouTube URL (originalUrl):', youtubeUrl);
            console.log('📝 Summary Type:', summaryTypeMap[summaryType]);
            console.log('🎯 User Prompt:', userPurpose?.trim() || '없음');
            console.log('📋 요청 헤더:', `Authorization: Bearer ${token.substring(0, 20)}...`);

            const requestData = {
                originalUrl: youtubeUrl,
                userPrompt: userPurpose?.trim() || null,
                summaryType: summaryTypeMap[summaryType]
            };
            console.log('📦 요청 데이터:', requestData);

            // api-endpoints.json에 정의된 엔드포인트에 맞게 요청 수정
            const response = await axios.post('http://52.78.6.200/api/youtube/upload', requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30초 타임아웃
            });

            console.log('✅ 요약 성공:', response.data);
            setSummaryComplete(true); // 요약 완료 상태 먼저 설정
            
            // 3초 후 요약 데이터 설정 (게임 완료 화면을 위한 딜레이)
            setTimeout(() => {
                setSummaryData(response.data); // 백엔드 SummaryResponseDTO 데이터 저장
                setIsLoading(false);
                setSummaryComplete(false);
            }, 3000);

        } catch (err) {
            console.error('❌ 요약 생성 실패:', err);
            console.error('에러 상세 정보:', {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                config: err.config,
                message: err.message
            });
            
            // 서버에서 반환된 에러 메시지 처리
            let errorMessage = '';
            
            if (err.response?.data) {
                // 서버에서 문자열로 에러 메시지를 반환하는 경우
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                }
            }
            
            // 특정 에러 케이스별 사용자 친화적 메시지 제공
            if (err.message && err.message.includes('Network Error')) {
                setError('🌐 네트워크 연결 오류\n\n서버에 연결할 수 없습니다. 다음을 확인해주세요:\n\n• 인터넷 연결 상태 확인\n• 백엔드 서버가 실행 중인지 확인 (52.78.6.200)\n• 방화벽이나 보안 프로그램 확인\n• 잠시 후 다시 시도해보세요');
            } else if (err.code === 'ERR_NETWORK') {
                setError('🔌 서버 연결 실패\n\n백엔드 서버(localhost:8080)에 연결할 수 없습니다.\n서버가 실행 중인지 확인해주세요.');
            } else if (err.response?.status === 401 || errorMessage.includes('oauth_failed') || errorMessage.includes('OAuth2')) {
                // 인증 실패 시 로그인 토큰 제거
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userId');
                setError('🔐 인증 만료\n\n로그인 세션이 만료되었습니다.\n페이지를 새로고침하여 다시 로그인해주세요.\n\n새로고침 후에도 문제가 지속되면:\n• 브라우저 캐시 삭제\n• 다른 브라우저로 시도\n• 개발자에게 문의');
            } else if (err.response?.status === 403) {
                setError('⛔ 접근 권한 없음\n\n이 기능을 사용할 권한이 없습니다.\n관리자에게 문의하거나 다시 로그인해보세요.');
            } else if (err.response?.status === 500) {
                setError(`🚨 서버 내부 오류\n\n서버에서 처리 중 오류가 발생했습니다:\n${errorMessage || '알 수 없는 서버 오류'}\n\n• 잠시 후 다시 시도해보세요\n• 문제가 지속되면 개발자에게 문의하세요`);
            } else if (errorMessage.includes('YouTube video transcript not found') || errorMessage.includes('not processed')) {
                setError('📺 YouTube 자막 오류\n\n이 동영상의 자막을 찾을 수 없습니다:\n\n• 동영상에 자막이 있는지 확인\n• 동영상이 공개 상태인지 확인\n• 올바른 YouTube URL인지 확인\n• 다른 동영상으로 시도해보세요');
            } else if (err.message && err.message.includes('CORS')) {
                setError('🔗 CORS 정책 오류\n\n브라우저 보안 정책으로 인한 오류입니다:\n\n• 백엔드 서버의 CORS 설정 확인 필요\n• 개발자에게 문의하세요\n• 임시로 브라우저의 CORS 확장프로그램 사용 가능');
            } else if (errorMessage) {
                setError(`❌ 요약 처리 오류\n\n${errorMessage}\n\n문제가 지속되면 개발자에게 문의하세요.`);
            } else {
                setError('❓ 알 수 없는 오류\n\n요약 생성 중 예상치 못한 오류가 발생했습니다.\n\n• 페이지 새로고침 후 다시 시도\n• 다른 YouTube URL로 테스트\n• 브라우저 개발자 도구에서 자세한 오류 확인\n• 문제가 지속되면 개발자에게 문의');
            }
            
            setIsLoading(false);
            setSummaryComplete(false);
        } finally {
            console.log('--- 요약 요청 종료 ---');
        }
    };

    const reset = () => {
        setYoutubeUrl('');
        setUserPurpose('');
        setSummaryType('기본 요약');
        setSummaryData(null);
        setError('');
        setSummaryComplete(false);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {summaryData ? (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                        <div className="p-6 border-b space-y-2">
                            {/* 썸네일 + 제목 + 업로더 + 조회수 */}
                            <div className="flex items-start gap-4">
                                {summaryData.thumbnailUrl && (
                                    <img src={summaryData.thumbnailUrl} alt="썸네일" className="w-32 h-20 object-cover rounded-lg shadow" />
                                )}
                                <div className="text-left">
                                    <h3 className="text-xl font-bold text-gray-800 break-words">{summaryData.title || '제목 없음'}</h3>
                                    <p className="text-sm text-gray-500">업로더: {summaryData.uploaderName || '알 수 없음'}</p>
                                    {summaryData.viewCount !== null && summaryData.viewCount !== undefined && (
                                        <p className="text-sm text-gray-500">조회수: {summaryData.viewCount.toLocaleString()}회</p>
                                    )}
                                </div>
                            </div>

                            {/* 요약 본문 */}
                            <div className="mt-4 prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed bg-green-50 p-4 rounded-lg border border-green-100 text-base">
                                {summaryData.summary || '요약 내용을 불러올 수 없습니다.'}
                            </div>

                            {/* 태그 */}
                            {summaryData.tags && summaryData.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {summaryData.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={reset}
                        className="w-full bg-blue-50 text-blue-700 py-3 px-8 rounded-lg hover:bg-blue-100 transition duration-200 ease-in-out border border-blue-200 font-medium text-base"
                    >
                        새로운 요약하기
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
                    {/* 로그인 안내 메시지 */}
                    {!isLoggedIn && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center space-x-3">
                                <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                <div className="text-left">
                                    <h3 className="text-sm font-semibold text-blue-800">로그인이 필요합니다</h3>
                                    <p className="text-sm text-blue-700 mt-1">영상 요약 기능을 이용하려면 로그인해주세요.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="summaryType" className="block text-sm font-semibold text-gray-700 mb-2 text-left">요약 타입</label>
                        <select
                            id="summaryType"
                            value={summaryType}
                            onChange={e => setSummaryType(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 ease-in-out text-base"
                        >
                            {summaryTypesOptions.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="userPurpose" className="block text-sm font-semibold text-gray-700 mb-2 text-left">사용자 목적 (선택 사항)</label>
                        <textarea
                            id="userPurpose"
                            value={userPurpose}
                            onChange={e => setUserPurpose(e.target.value)}
                            placeholder="어떤 목적으로 이 영상을 요약하고 싶으신가요? 예: '초보자를 위한 핵심 개념 위주로 요약해줘', '장점과 단점을 비교 분석해줘'"
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 ease-in-out text-base"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label htmlFor="youtubeUrl" className="block text-sm font-semibold text-gray-700 mb-2 text-left">유튜브 URL</label>
                        <input
                            id="youtubeUrl"
                            type="url"
                            value={youtubeUrl}
                            onChange={e => setYoutubeUrl(e.target.value)}
                            placeholder="예: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 ease-in-out text-base"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-semibold text-red-800">오류가 발생했습니다</h3>
                                    <div className="text-sm text-red-700 mt-1 whitespace-pre-line">{error}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !youtubeUrl.trim()}
                        className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out flex items-center justify-center gap-2 text-base"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                요약 중...
                            </>
                        ) : '요약 시작'}
                    </button>

                    {/* 요약 중일 때 타자 게임 표시 */}
                    {isLoading && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl p-2 max-w-lg w-full mx-4 shadow-2xl">
                                <SummaryTypingGame 
                                    summaryComplete={summaryComplete}
                                    onComplete={() => {
                                        // 게임 완료 시 모달 닫기 처리 (자동으로 처리됨)
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
