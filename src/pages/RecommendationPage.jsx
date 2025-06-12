import React from 'react';
import { Lightbulb, Play } from 'lucide-react';

/**
 * Recommendation Page Component
 * Displays video recommendations based on user's library tags.
 * @param {object} props - Component props.
 * @param {object|null} props.recommendedVideo - The recommended video object.
 * @param {boolean} props.isGeneratingRecommendation - Loading state for recommendation.
 * @param {function} props.onGenerateRecommendation - Function to trigger recommendation generation.
 * @param {number} props.libraryItemsCount - Count of library items (to enable/disable button).
 */
const RecommendationPage = ({ recommendedVideo, isGeneratingRecommendation, onGenerateRecommendation, libraryItemsCount }) => {
    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200 space-y-6 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">영상을 추천받으세요!</h3>
            <p className="text-gray-600 mb-6">사용자 라이브러리의 요약본 태그를 기반으로 <br/>흥미로워할 만한 YouTube 동영상을 추천해 드립니다.</p>

            <button
                onClick={onGenerateRecommendation}
                disabled={isGeneratingRecommendation || libraryItemsCount === 0}
                className="bg-purple-500 text-white py-3 px-8 rounded-lg font-bold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-md"
            >
                {isGeneratingRecommendation ? '추천 생성 중...' : (libraryItemsCount === 0 ? '요약본 없음' : '추천 영상 받기')}
            </button>

            {recommendedVideo && (
                <div className="mt-8 p-6 border-t-2 border-purple-200 bg-purple-50 rounded-lg text-left shadow-inner">
                    <h4 className="text-xl font-semibold text-purple-800 mb-3 flex items-center space-x-2">
                        <Lightbulb className="h-6 w-6" />
                        <span>추천 영상</span>
                    </h4>
                    <h5 className="text-lg font-bold text-gray-800 mb-2">{recommendedVideo.title}</h5>
                    <p className="text-gray-700 mb-3 leading-relaxed">{recommendedVideo.reason}</p>
                    {recommendedVideo.youtubeUrl && (
                        <a
                            href={recommendedVideo.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                            <Play className="h-4 w-4 mr-1" />
                            영상 보기 (목업 URL)
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecommendationPage;
