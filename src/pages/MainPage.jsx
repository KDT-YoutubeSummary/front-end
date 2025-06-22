import React, { useState } from 'react';
import axios from 'axios';
import MessageModal from '../components/MessageModal';

export default function MainPage() {
    const [summaryType, setSummaryType] = useState('기본 요약');
    const [userPurpose, setUserPurpose] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
    const [message, setMessage] = useState('');

    const summaryTypeMap = {
        '기본 요약': 'BASIC',
        '3줄 요약': 'THREE_LINE',
        '키워드 요약': 'KEYWORD'
    };

    const handleSubmit = async () => {
        if (!youtubeUrl.trim()) {
            setMessage('유튜브 URL을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('accessToken');
            const userId = parseInt(localStorage.getItem('userId'), 10);

            const response = await axios.post('/api/youtube/upload', {
                youtubeUrl,
                summaryType: summaryTypeMap[summaryType],
                userPrompt: userPurpose || '요약',
                userId,
                languageCode: 'ko'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            setSummaryData(response.data);
        } catch (e) {
            console.error('❌ 요약 생성 실패:', e);
            setMessage(e.response?.data?.message || '요약 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setYoutubeUrl('');
        setUserPurpose('');
        setSummaryData(null);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {!summaryData ? (
                <div className="bg-white rounded-xl shadow-lg border p-8 space-y-6">
                    <div>
                        <label className="block mb-2 font-semibold">요약 타입</label>
                        <select
                            value={summaryType}
                            onChange={e => setSummaryType(e.target.value)}
                            className="w-full border rounded-lg px-4 py-3"
                        >
                            {Object.keys(summaryTypeMap).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold">사용자 목적</label>
                        <textarea
                            value={userPurpose}
                            onChange={e => setUserPurpose(e.target.value)}
                            placeholder="어떤 목적으로 요약할까요?"
                            className="w-full border rounded-lg px-4 py-3"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold">유튜브 URL</label>
                        <input
                            type="url"
                            value={youtubeUrl}
                            onChange={e => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full border rounded-lg px-4 py-3"
                        />
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        {isLoading ? '요약 중...' : '요약 시작'}
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                        <div className="p-6 border-b">
                            <h3 className="text-xl font-bold mb-2 text-gray-800">{summaryData.title}</h3>
                            <p className="text-sm text-gray-500">업로더: {summaryData.uploaderName}</p>
                            <p className="text-sm text-gray-500 mb-4">조회수: {summaryData.viewCount?.toLocaleString()}회</p>
                            <img src={summaryData.thumbnailUrl} alt="썸네일" className="mb-4 w-full max-w-md rounded-lg" />
                            <div className="prose whitespace-pre-wrap">{summaryData.summary}</div>
                            {summaryData.tags?.length > 0 && (
                                <div className="mt-4 space-x-2">
                                    {summaryData.tags.map(tag => (
                                        <span key={tag} className="inline-block bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full">
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
            )}
            {message && <MessageModal message={message} onClose={() => setMessage('')} />}
        </div>
    );
}
