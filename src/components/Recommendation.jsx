// src/components/Recommendation.jsx
import React from 'react';
import { Lightbulb, Play, User, Eye, Sparkles } from 'lucide-react';

/**
 * Recommendation Component
 * Displays a single recommendation item.
 * @param {object} props - Component props.
 * @param {object} props.recommendation - The recommendation object data.
 * @param {number} props.index - The index of the recommendation item.
 */
const Recommendation = ({ recommendation, index }) => {
    // 썸네일 클릭 핸들러
    const handleThumbnailClick = (e) => {
        e.stopPropagation();
        if (recommendation.youtubeUrl) {
            window.open(recommendation.youtubeUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6 h-full">
                    {/* 썸네일 영역 - 클릭 가능 */}
                    {recommendation.thumbnailUrl ? (
                        <div className="w-full lg:w-1/3 flex-shrink-0 flex items-start">
                            <div 
                                className="aspect-video relative rounded-lg overflow-hidden bg-gray-200 shadow-md group cursor-pointer w-full"
                                onClick={handleThumbnailClick}
                            >
                                <img
                                    src={recommendation.thumbnailUrl}
                                    alt={`${recommendation.title} 썸네일`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="bg-red-600 text-white p-3 rounded-full transform hover:scale-110 transition-transform shadow-lg">
                                        <Play className="h-6 w-6 fill-current" />
                                    </div>
                                </div>
                                {/* 추천 순위 배지 */}
                                <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
                                    <Sparkles className="h-3 w-3" />
                                    <span>#{index + 1}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full lg:w-1/3 flex-shrink-0 flex items-start">
                            <div 
                                className="aspect-video relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center cursor-pointer w-full"
                                onClick={handleThumbnailClick}
                            >
                                <div className="text-center">
                                    <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">썸네일 없음</p>
                                </div>
                                {/* 추천 순위 배지 */}
                                <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
                                    <Sparkles className="h-3 w-3" />
                                    <span>#{index + 1}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 텍스트 콘텐츠 영역 - 높이를 썸네일과 맞춤 */}
                    <div className="flex-1 flex flex-col justify-between min-h-full">
                        <div className="space-y-4">
                            {/* 제목 및 아이콘 */}
                            <div className="flex items-start justify-between">
                                <h4 className="text-xl font-bold text-gray-800 flex items-start space-x-2 leading-tight">
                                    <Lightbulb className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                                    <span className="line-clamp-2">{recommendation.title}</span>
                                </h4>
                            </div>

                            {/* 추가 정보 (업로더, 조회수, 추천일 등) - 가운데 정렬 */}
                            <div className="flex items-center justify-center text-sm text-gray-600 flex-wrap gap-3">
                                {recommendation.uploaderName && (
                                    <span className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                                        <User className="h-4 w-4 mr-1 text-gray-500" />
                                        <span className="font-medium">{recommendation.uploaderName}</span>
                                    </span>
                                )}
                                {recommendation.viewCount > 0 && (
                                    <span className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                                        <Eye className="h-4 w-4 mr-1 text-gray-500" />
                                        <span className="font-medium">{recommendation.viewCount.toLocaleString()}회 조회</span>
                                    </span>
                                )}
                                {recommendation.createdAt && (
                                    <span className="flex items-center bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                                        <Sparkles className="h-4 w-4 mr-1 text-purple-500" />
                                        <span className="font-medium text-purple-600">
                                            {new Date(recommendation.createdAt).toLocaleDateString('ko-KR', {
                                                month: 'short',
                                                day: 'numeric'
                                            })} 추천
                                        </span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 추천 이유 - 하단에 고정 */}
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mt-4">
                            <h5 className="font-semibold text-purple-800 mb-2 flex items-center">
                                <Lightbulb className="h-4 w-4 mr-2 text-purple-600" />
                                추천 이유
                            </h5>
                            <p className="text-purple-700 text-sm leading-relaxed">{recommendation.reason}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Recommendation;
