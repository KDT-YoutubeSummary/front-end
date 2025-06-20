// src/components/Recommendation.jsx
import React from 'react';
import { Lightbulb, Play, User, Eye } from 'lucide-react';

/**
 * Recommendation Component
 * Displays a single recommendation item.
 * @param {object} props - Component props.
 * @param {object} props.recommendation - The recommendation object data.
 */
const Recommendation = ({ recommendation }) => {
    return (
        <div className="p-6 border border-purple-200 bg-purple-50 rounded-lg text-left shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row gap-4">
                {/* 썸네일 영역 */}
                {recommendation.thumbnailUrl ? (
                    <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                        <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-200 shadow-inner">
                            <img
                                src={recommendation.thumbnailUrl}
                                alt={`${recommendation.title} 썸네일`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <a
                                    href={recommendation.youtubeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-red-600 text-white p-3 rounded-full transform hover:scale-110 transition-transform"
                                >
                                    <Play className="h-6 w-6 fill-current" />
                                </a>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* 텍스트 콘텐츠 영역 */}
                <div className="flex-1">
                    {/* 제목 및 아이콘 */}
                    <div className="flex items-start justify-between mb-2">
                        <h4 className="text-xl font-semibold text-purple-800 flex items-center">
                            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                            <span className="line-clamp-2">{recommendation.title}</span>
                        </h4>
                    </div>

                    {/* 추가 정보 (업로더, 조회수 등) */}
                    <div className="flex items-center text-sm text-gray-600 mb-3 flex-wrap gap-3">
                        {recommendation.uploaderName && (
                            <span className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {recommendation.uploaderName}
                            </span>
                        )}
                        {recommendation.viewCount > 0 && (
                            <span className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {recommendation.viewCount.toLocaleString()}회 조회
                            </span>
                        )}
                    </div>

                    {/* 추천 이유 */}
                    <div className="mb-4">
                        <h5 className="font-semibold text-gray-700 mb-1">추천 이유:</h5>
                        <p className="text-gray-700 text-sm leading-relaxed">{recommendation.reason}</p>
                    </div>

                    {/* 영상 보기 링크 */}
                    <div className="mt-auto pt-2">
                        <a
                            href={recommendation.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-medium transition-colors"
                        >
                            <Play className="h-4 w-4 mr-2" />
                            유튜브에서 보기
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Recommendation;
