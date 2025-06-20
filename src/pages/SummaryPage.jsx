import React, { useState } from 'react';
import axios from 'axios';

export default function SummaryPage() {
    const [summaryType, setSummaryType] = useState('기본 요약');
    const [userPurpose, setUserPurpose] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [summaryData, setSummaryData] = useState(null); // 백엔드 SummaryResponseDTO에 매핑
    const [error, setError] = useState('');

    const summaryTypesOptions = ['기본 요약', '3줄 요약', '키워드 요약', '타임라인 요약'];
    const summaryTypeMap = {
        '기본 요약': 'BASIC',
        '3줄 요약': 'THREE_LINE',
        '키워드 요약': 'KEYWORD',
        '타임라인 요약': 'TIMELINE'
    };

    const handleSubmit = async () => {
        if (!youtubeUrl.trim()) {
            setError('YouTube URL을 입력해주세요.');
            return;
        }

        const token = localStorage.getItem('accessToken');
        const rawUserId = localStorage.getItem('userId');
        const userId = rawUserId && !isNaN(Number(rawUserId)) ? parseInt(rawUserId, 10) : null;

        // 프론트엔드에서 로그인 여부를 확인하는 로직은 유지합니다.
        // 백엔드 요청 바디에 userId를 포함할 필요는 없어진 것입니다.
        if (!token || !userId) {
            setError('로그인이 필요합니다. 다시 로그인해 주세요.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSummaryData(null); // 새로운 요약 요청 시 기존 요약 데이터 초기화

        try {
            console.log('--- 요약 요청 시작 ---');
            console.log('🔐 accessToken:', token ? '존재함' : '없음');
            console.log('🔗 YouTube URL (originalUrl):', youtubeUrl);
            console.log('📝 Summary Type:', summaryTypeMap[summaryType]);
            console.log('🎯 User Prompt:', userPurpose?.trim() || '없음');

            // api-endpoints.json에 정의된 엔드포인트에 맞게 요청 수정
            const response = await axios.post('http://localhost:8080/api/youtube/upload', {
                originalUrl: youtubeUrl,
                userPrompt: userPurpose?.trim() || null,
                summaryType: summaryTypeMap[summaryType]
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('✅ 요약 성공:', response.data);
            setSummaryData(response.data); // 백엔드 SummaryResponseDTO 데이터 저장

        } catch (err) {
            console.error('❌ 요약 생성 실패:', err);
            setError(
                err.response?.data?.message ||
                (err.response?.status === 401
                    ? '인증 실패: 로그인 세션이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.'
                    : '요약 생성 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
            );
        } finally {
            setIsLoading(false);
            console.log('--- 요약 요청 종료 ---');
        }
    };

    const reset = () => {
        setYoutubeUrl('');
        setUserPurpose('');
        setSummaryType('기본 요약');
        setSummaryData(null);
        setError('');
    };

    return (
        <div className="max-w-full md:max-w-4xl mx-auto p-4 md:p-6"> {/* padding 추가로 UI 개선 */}
            {summaryData ? (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                        <div className="p-6 border-b space-y-2">
                            {/* 썸네일 + 제목 + 업로더 + 조회수 */}
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                                {summaryData.thumbnailUrl && (
                                    <img src={summaryData.thumbnailUrl} alt="썸네일" className="w-full md:w-32 h-auto md:h-20 object-cover rounded-lg shadow" />
                                )}
                                <div className="text-center md:text-left">
                                    <h3 className="text-xl font-bold text-gray-800 break-words">{summaryData.title || '제목 없음'}</h3>
                                    <p className="text-sm text-gray-500">업로더: {summaryData.uploaderName || '알 수 없음'}</p>
                                    {summaryData.viewCount !== null && summaryData.viewCount !== undefined && (
                                        <p className="text-sm text-gray-500">조회수: {summaryData.viewCount.toLocaleString()}회</p>
                                    )}
                                </div>
                            </div>

                            {/* 요약 본문 */}
                            <div className="mt-4 prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                                {summaryData.summary || '요약 내용을 불러올 수 없습니다.'}
                            </div>

                            {/* 태그 */}
                            {summaryData.tags && summaryData.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {summaryData.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="inline-block bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full"
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
                        className="w-full bg-gray-200 text-gray-800 py-3 px-8 rounded-lg hover:bg-gray-300 transition duration-200 ease-in-out"
                    >
                        새로운 요약하기
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">YouTube 영상 요약</h2>
                    <div>
                        <label htmlFor="summaryType" className="block text-sm font-semibold text-gray-700 mb-2">요약 타입</label>
                        <select
                            id="summaryType"
                            value={summaryType}
                            onChange={e => setSummaryType(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 ease-in-out"
                        >
                            {summaryTypesOptions.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="userPurpose" className="block text-sm font-semibold text-gray-700 mb-2">사용자 목적 (선택 사항)</label>
                        <textarea
                            id="userPurpose"
                            value={userPurpose}
                            onChange={e => setUserPurpose(e.target.value)}
                            placeholder="어떤 목적으로 이 영상을 요약하고 싶으신가요? 예: '초보자를 위한 핵심 개념 위주로 요약해줘', '장점과 단점을 비교 분석해줘'"
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 ease-in-out"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label htmlFor="youtubeUrl" className="block text-sm font-semibold text-gray-700 mb-2">유튜브 URL</label>
                        <input
                            id="youtubeUrl"
                            type="url"
                            value={youtubeUrl}
                            onChange={e => setYoutubeUrl(e.target.value)}
                            placeholder="예: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 ease-in-out"
                        />
                    </div>

                    {error && <div className="text-red-500 text-sm mt-4 text-center">{error}</div>}

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !youtubeUrl.trim()}
                        className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out flex items-center justify-center gap-2"
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
                </div>
            )}
        </div>
    );
}
