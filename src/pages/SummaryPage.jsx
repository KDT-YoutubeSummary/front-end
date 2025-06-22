import React, { useState } from 'react';
import axios from 'axios';

export default function SummaryPage() {
    const [summaryType, setSummaryType] = useState('기본 요약');
    const [userPurpose, setUserPurpose] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
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

        if (!token || !userId) {
            setError('로그인이 필요합니다. 다시 로그인해 주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('🔐 accessToken:', token);
            console.log('👤 userId:', userId);

            const response = await axios.post('/api/summary', {
                youtubeUrl,
                summaryType: summaryTypeMap[summaryType],
                userPrompt: userPurpose?.trim() || null,
                text: youtubeUrl?.trim(),                // ✅ 이 줄을 반드시 추가!
                transcriptId: 1,                         // ✅ 백엔드가 요구하므로 무조건 필요
                userId,
                languageCode: 'ko'
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });



            setSummaryData(response.data);
        } catch (err) {
            console.error('❌ 요약 생성 실패:', err);
            setError(
                err.response?.data?.message ||
                (err.response?.status === 401
                    ? '인증 실패: 다시 로그인해주세요.'
                    : '요약 생성 중 오류가 발생했습니다.')
            );
        } finally {
            setIsLoading(false);
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
        <div className="max-w-full md:max-w-4xl mx-auto">
            {summaryData ? (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                        <div className="p-6 border-b space-y-2">
                            {/* ✅ 썸네일 + 제목 */}
                            <div className="flex items-center gap-4">
                                <img src={summaryData.thumbnailUrl} alt="썸네일" className="w-32 rounded-lg shadow" />
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{summaryData.title}</h3>
                                    <p className="text-sm text-gray-500">업로더: {summaryData.uploaderName}</p>
                                    <p className="text-sm text-gray-500">조회수: {summaryData.viewCount?.toLocaleString()}회</p>
                                </div>
                            </div>

                            {/* ✅ 요약 본문 */}
                            <div className="mt-4 prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                                {summaryData.summary}
                            </div>

                            {/* ✅ 태그 */}
                            {summaryData.tags?.length > 0 && (
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
                        className="bg-gray-200 text-gray-800 py-3 px-8 rounded-lg hover:bg-gray-300"
                    >
                        새로운 요약하기
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">요약 타입</label>
                        <select
                            value={summaryType}
                            onChange={e => setSummaryType(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                            {summaryTypesOptions.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">사용자 목적</label>
                        <textarea
                            value={userPurpose}
                            onChange={e => setUserPurpose(e.target.value)}
                            placeholder="어떤 목적으로 요약할까요?"
                            className="w-full border rounded-lg px-4 py-3"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">유튜브 URL</label>
                        <input
                            type="url"
                            value={youtubeUrl}
                            onChange={e => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full border rounded-lg px-4 py-3"
                        />
                    </div>

                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !youtubeUrl.trim()}
                        className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                        {isLoading ? '요약 중...' : '요약 시작'}
                    </button>
                </div>
            )}
        </div>
    );
}
