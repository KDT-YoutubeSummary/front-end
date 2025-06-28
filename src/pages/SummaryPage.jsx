import React, { useState } from 'react';
import { FileText, Play, Sparkles } from 'lucide-react';
import { youtubeApi } from '../services/api.jsx';
import GameHub from '../components/game/GameHub';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function SummaryPage({ onShowAuthModal, isLoggedIn }) {
    const [summaryType, setSummaryType] = useState('기본 요약');
    const [userPurpose, setUserPurpose] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [summaryData, setSummaryData] = useState(null); // 백엔드 SummaryResponseDTO에 매핑
    const [error, setError] = useState('');
    const [summaryComplete, setSummaryComplete] = useState(false);
    const [showSummaryInfo, setShowSummaryInfo] = useState(false);

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

            // API 서비스를 통한 일관성 있는 요청 처리
            const response = await youtubeApi.uploadVideo(
                youtubeUrl,
                userPurpose?.trim() || null,
                summaryTypeMap[summaryType]
            );

            console.log('✅ 요약 성공:', response);

            // 백엔드 응답 구조: { code: 200, data: {...}, message: "..." }
            const actualData = response?.data || response; // 실제 요약 데이터 추출

            console.log('📋 응답 데이터 구조 확인:', {
                responseStructure: {
                    code: response?.code,
                    message: response?.message,
                    hasData: !!response?.data
                },
                actualData: {
                    title: actualData?.title,
                    summary: actualData?.summary,
                    thumbnailUrl: actualData?.thumbnailUrl,
                    uploaderName: actualData?.uploaderName,
                    viewCount: actualData?.viewCount,
                    tags: actualData?.tags,
                    allKeys: Object.keys(actualData || {})
                }
            });

            setSummaryComplete(true); // 요약 완료 상태 먼저 설정
            
            // 3초 후 요약 데이터 설정 (게임 완료 화면을 위한 딜레이)
            setTimeout(() => {
                setSummaryData(actualData); // 실제 요약 데이터 저장
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
                setError('🌐 네트워크 연결 오류\n\n서버에 연결할 수 없습니다. 다음을 확인해주세요:\n\n• 인터넷 연결 상태 확인\n• 백엔드 서버가 실행 중인지 확인 (서버 주소)\n• 방화벽이나 보안 프로그램 확인\n• 잠시 후 다시 시도해보세요');
            } else if (err.code === 'ERR_NETWORK') {
                setError('🔌 서버 연결 실패\n\n백엔드 서버(배포 주소)에 연결할 수 없습니다.\n서버가 실행 중인지 확인해주세요.');
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {summaryData ? (
                    <div className="max-w-6xl mx-auto">
                        {/* 통합된 요약 정리본 카드 */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            {/* 헤더 영역 - 썸네일과 메타데이터 */}
                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 border-b border-gray-100">
                                <div className="flex items-start space-x-8">
                                    {/* 썸네일 */}
                                    <div
                                        className="relative w-48 h-32 bg-black rounded-xl overflow-hidden shadow-lg cursor-pointer flex-shrink-0 ring-2 ring-white"
                                        onClick={() => window.open(youtubeUrl, '_blank')}
                                    >
                                        {summaryData.thumbnailUrl ? (
                                            <img
                                                src={summaryData.thumbnailUrl}
                                                alt="영상 썸네일"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                                <Play className="w-12 h-12 text-white opacity-50" />
                                            </div>
                                        )}

                                        {/* 재생 오버레이 */}
                                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-red-600 rounded-full p-3 transform hover:scale-110 transition-transform duration-200">
                                                <Play className="w-6 h-6 text-white fill-current" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 메타데이터 */}
                                    <div className="flex-1 space-y-3">
                                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                                            {summaryData.title || '제목 없음'}
                                        </h1>

                                        <div className="flex items-center space-x-2 text-lg text-gray-700">
                                            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    {(summaryData.uploaderName || 'U').charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="font-semibold">
                                                {summaryData.uploaderName || '알 수 없는 채널'}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            {summaryData.viewCount !== null && summaryData.viewCount !== undefined && (
                                                <span className="flex items-center space-x-1">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                                                    </svg>
                                                    <span>{summaryData.viewCount?.toLocaleString() || '0'}회</span>
                                                </span>
                                            )}

                                            <span className="text-gray-400">•</span>
                                            <span>요약 완료</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 본문 영역 */}
                            <div className="p-6 space-y-6">
                                {/* 해시태그 섹션 */}
                                {summaryData.tags && summaryData.tags.length > 0 && (
                                    <div className="border-l-4 border-green-400 pl-4">
                                        <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.94l1-4H9.03z" clipRule="evenodd"/>
                                            </svg>
                                            태그
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {summaryData.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        index % 3 === 0 ? 'bg-blue-100 text-blue-800' :
                                                            index % 3 === 1 ? 'bg-green-100 text-green-800' :
                                                                'bg-purple-100 text-purple-800'
                                                    }`}
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* AI 요약 섹션 */}
                                <div className="border-l-4 border-blue-400 pl-4">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <h2 className="text-lg font-bold text-blue-900">AI 요약</h2>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                            {summaryType}
                                        </span>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <div className="text-gray-700 leading-relaxed prose prose-lg max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {summaryData.summary || '요약 내용을 불러올 수 없습니다.'}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>

                                {/* 요약 정보 섹션 */}
                                <div className="border-l-4 border-gray-400 pl-4">
                                    <button
                                        onClick={() => setShowSummaryInfo(!showSummaryInfo)}
                                        className="w-full text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg p-2 -ml-2"
                                    >
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                            </svg>
                                            요약 정보
                                        </h3>
                                        <svg
                                            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showSummaryInfo ? 'rotate-180' : ''}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                                        </svg>
                                    </button>

                                    {showSummaryInfo && (
                                        <div className="mt-3 space-y-3 text-sm bg-gray-50 p-4 rounded-lg">
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-600">요약 타입:</span>
                                                <span className="font-medium text-gray-900">{summaryData.summaryType || summaryType}</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-600">처리 시간:</span>
                                                <span className="font-medium text-gray-900">약 2분</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-600">AI 모델:</span>
                                                <span className="font-medium text-gray-900">GPT-4</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-600">원본 URL:</span>
                                                <a
                                                    href={youtubeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-blue-600 hover:text-blue-800 text-xs truncate max-w-48"
                                                >
                                                    {youtubeUrl}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 푸터 영역 - 새로운 요약하기 버튼 */}
                            <div className="bg-gray-50 p-6 border-t border-gray-100">
                                <button
                                    onClick={reset}
                                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-[1.01] shadow-lg hover:shadow-xl"
                                >
                                    새로운 요약하기
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* 왼쪽: 요약 입력 폼 */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-10 space-y-8 h-fit">
                                    {/* 로그인 안내 메시지 */}
                                    {!isLoggedIn && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                                            <div className="flex items-center space-x-3">
                                                <Sparkles className="h-6 w-6 text-blue-600 flex-shrink-0" />
                                                <div className="text-left">
                                                    <h3 className="text-lg font-semibold text-blue-800">로그인이 필요합니다</h3>
                                                    <p className="text-base text-blue-700 mt-1">영상 요약 기능을 이용하려면 로그인해주세요.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="summaryType" className="block text-lg font-semibold text-gray-700 mb-3 text-left">요약 타입</label>
                                        <select
                                            id="summaryType"
                                            value={summaryType}
                                            onChange={e => setSummaryType(e.target.value)}
                                            className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 ease-in-out text-lg"
                                        >
                                            {summaryTypesOptions.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="userPurpose" className="block text-lg font-semibold text-gray-700 mb-3 text-left">사용자 목적 (선택 사항)</label>
                                        <textarea
                                            id="userPurpose"
                                            value={userPurpose}
                                            onChange={e => setUserPurpose(e.target.value)}
                                            placeholder="어떤 목적으로 이 영상을 요약하고 싶으신가요? 예: '초보자를 위한 핵심 개념 위주로 요약해줘', '장점과 단점을 비교 분석해줘'"
                                            className="w-full border rounded-lg px-5 py-4 focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 ease-in-out text-lg"
                                            rows={4}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="youtubeUrl" className="block text-lg font-semibold text-gray-700 mb-3 text-left">유튜브 URL</label>
                                        <input
                                            id="youtubeUrl"
                                            type="url"
                                            value={youtubeUrl}
                                            onChange={e => setYoutubeUrl(e.target.value)}
                                            placeholder="예: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                            className="w-full border rounded-lg px-5 py-4 focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 ease-in-out text-lg"
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-6 w-6 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="text-lg font-semibold text-red-800">오류가 발생했습니다</h3>
                                                    <div className="text-base text-red-700 mt-1 whitespace-pre-line">{error}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading || !youtubeUrl.trim()}
                                        className="w-full bg-red-500 text-white py-5 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out flex items-center justify-center gap-2 text-lg font-semibold"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                요약 중...
                                            </>
                                        ) : '요약 시작'}
                                    </button>
                                </div>
                            </div>

                            {/* 오른쪽: 요약 기능 안내 */}
                            <div className="lg:col-span-1">
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8 h-full flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                            <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                            요약 기능 안내
                                        </h3>
                                        <div className="space-y-5 text-base text-gray-700">
                                            <div className="flex items-start space-x-3 p-3 bg-white bg-opacity-60 rounded-lg">
                                                <span className="text-blue-500 font-bold text-lg flex-shrink-0">•</span>
                                                <div className="text-left">
                                                    <p className="font-semibold text-blue-700">기본 요약</p>
                                                    <p className="text-sm text-gray-600 mt-1">전반적인 내용을 간결하게 정리</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3 p-3 bg-white bg-opacity-60 rounded-lg">
                                                <span className="text-green-500 font-bold text-lg flex-shrink-0">•</span>
                                                <div className="text-left">
                                                    <p className="font-semibold text-green-700">3줄 요약</p>
                                                    <p className="text-sm text-gray-600 mt-1">핵심 내용을 3줄로 압축</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3 p-3 bg-white bg-opacity-60 rounded-lg">
                                                <span className="text-purple-500 font-bold text-lg flex-shrink-0">•</span>
                                                <div className="text-left">
                                                    <p className="font-semibold text-purple-700">키워드 요약</p>
                                                    <p className="text-sm text-gray-600 mt-1">주요 키워드 중심으로 정리</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3 p-3 bg-white bg-opacity-60 rounded-lg">
                                                <span className="text-orange-500 font-bold text-lg flex-shrink-0">•</span>
                                                <div className="text-left">
                                                    <p className="font-semibold text-orange-700">타임라인 요약</p>
                                                    <p className="text-sm text-gray-600 mt-1">시간순으로 구성된 상세 요약</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 추가 팁 섹션 */}
                                    <div className="mt-6 p-4 bg-white bg-opacity-70 rounded-lg border border-blue-100">
                                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center text-left">
                                            <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                                            사용 팁
                                        </h4>
                                        <ul className="text-sm text-gray-600 space-y-1 text-left">
                                            <li>• 자막이 있는 영상에서 더 정확한 요약</li>
                                            <li>• 사용자 목적을 구체적으로 작성하면 맞춤형 요약</li>
                                            <li>• 긴 영상일수록 타임라인 요약 추천</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 요약 중일 때 게임 표시 */}
                {isLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-auto min-w-96 max-w-full max-h-[95vh] overflow-auto">
                            <GameHub 
                                summaryComplete={summaryComplete}
                                onComplete={() => {
                                    // 게임 완료 시 모달 닫기 처리 (자동으로 처리됨)
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
