import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // React Router 추가
import Recommendation from '../components/Recommendation';
import { recommendationApi } from '../services/api.jsx';
import { Lightbulb, Plus, TrendingUp, Users, Clock, Search, Hash } from 'lucide-react';

/**
 * Recommendation Page Component
 * Displays video recommendations based on user's library tags.
 */
const RecommendationPage = () => {
    // React Router 네비게이션 훅 추가
    const navigate = useNavigate();

    // 컴포넌트가 화면에 표시되는지 감지
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recommendedVideos, setRecommendedVideos] = useState([]); // 복수의 추천 영상을 저장하도록 변경
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [isDataFetched, setIsDataFetched] = useState(false);

    // --- Search States ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTag, setFilterTag] = useState('');

    // 사용자 ID를 localStorage에서 가져옴
    const userId = localStorage.getItem('userId');

    // 요약 페이지로 이동하는 함수
    const handleNavigateToSummary = () => {
        navigate('/');
    };

    // 페이지가 로드될 때 추천 영상 정보를 자동으로 가져오는 함수
    const fetchRecommendations = async () => {
        if (!userId) return;

        setIsLoading(true);

        try {
            // API 호출 시도
            const recommendations = await recommendationApi.getUserRecommendations(userId);
            console.log('추천 영상 데이터:', recommendations); // 콘솔에 추천 영상 데이터 출력

            if (recommendations && recommendations.length > 0) {
                // 최신순으로 정렬 (생성 시간 기준)
                const sortedRecommendations = recommendations.sort((a, b) => 
                    new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id)
                );

                // 모든 추천 영상을 처리하여 배열에 저장
                const formattedRecommendations = sortedRecommendations.map(recommendation => ({
                    id: recommendation.id, // 추천 영상 ID 추가
                    title: recommendation.recommendedVideo?.title || '제목 없음',
                    reason: recommendation.recommendationReason || '추천 이유가 제공되지 않았습니다.',
                    youtubeUrl: recommendation.recommendedVideo?.originalUrl || '',
                    // 추가 정보 (표시가 필요한 경우 Recommendation 컴포넌트도 수정 필요)
                    uploaderName: recommendation.recommendedVideo?.uploaderName || '',
                    thumbnailUrl: recommendation.recommendedVideo?.thumbnailUrl || '',
                    viewCount: recommendation.recommendedVideo?.viewCount || 0
                }));

                console.log('변환된 추천 영상 목록:', formattedRecommendations); // 변환된 데이터 확인
                setRecommendedVideos(formattedRecommendations);
            } else {
                // 추천 영상이 없는 경우 빈 배열로 설정
                setRecommendedVideos([]);
                console.log('추천 영상이 없습니다.');
            }
        } catch (error) {
            console.error('추천 영상 조회 실패:', error);

            // 403 오류 발생 시 (권한 문제)
            if (error.response && error.response.status === 403) {
                console.log('권한 오류가 발생했습니다.');
                setRecommendedVideos([]);
            } else {
                // 다른 오류의 경우 메시지 표시
                setRecommendedVideos([]);
            }
        } finally {
            setIsLoading(false);
            setIsDataFetched(true);
        }
    };

    // Intersection Observer를 사용하여 컴포넌트가 화면에 표시될 때 감지
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // 화면에 표시되는지 확인
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 } // 10% 이상 보이면 표시된 것으로 간주
        );

        // 현재 컴포넌트를 관찰 대상으로 설정
        const currentElement = document.getElementById('recommendation-page');
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, []);

    // 컴포넌트가 화면에 보일 때만 API 호출하도록 수정
    useEffect(() => {
        if (isVisible && userId && !isDataFetched) {
            console.log('컴포넌트가 화면에 표시됨, API 호출 시작');
            fetchRecommendations();
        }
    }, [isVisible, userId, isDataFetched]);

    // 검색 및 필터링 함수
    const filterVideos = useCallback(() => {
        let filtered = recommendedVideos;

        // 제목 검색
        if (searchTerm) {
            filtered = filtered.filter(video =>
                video.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 태그 필터링 (추천 이유에서 검색)
        if (filterTag) {
            filtered = filtered.filter(video =>
                video.title.toLowerCase().includes(filterTag.toLowerCase()) ||
                video.reason.toLowerCase().includes(filterTag.toLowerCase())
            );
        }

        setFilteredVideos(filtered);
    }, [recommendedVideos, searchTerm, filterTag]);

    // 검색어나 필터가 변경될 때마다 필터링 적용
    useEffect(() => {
        filterVideos();
    }, [filterVideos]);

    return (
        <div id="recommendation-page" className="max-w-6xl mx-auto p-6 space-y-8">
            {/* 로딩 중 표시 */}
            {isLoading && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500 mb-4"></div>
                        <p className="text-gray-600 font-medium text-base">추천 영상을 분석하고 있습니다...</p>
                        <p className="text-gray-500 text-sm mt-2">잠시만 기다려주세요</p>
                    </div>
                </div>
            )}

            {/* 추천 영상이 없을 때만 소개 텍스트와 버튼 표시 */}
            {!isLoading && recommendedVideos.length === 0 && isDataFetched ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <TrendingUp className="h-10 w-10 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">맞춤형 영상을 추천받으세요!</h3>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed text-base">
                            사용자 라이브러리에 요약본을 추가하면 AI가 태그를 분석하여<br />
                            <span className="font-semibold text-purple-600">관심사에 맞는 YouTube 동영상</span>을 추천해 드립니다.
                        </p>

                        <div className="flex flex-col gap-4 justify-center items-center">
                            <button
                                onClick={handleNavigateToSummary}
                                className="bg-purple-500 text-white py-3 px-8 rounded-lg font-bold hover:bg-purple-600 transition-colors transform hover:scale-105 shadow-md flex items-center space-x-2 text-base"
                            >
                                <Plus className="h-5 w-5" />
                                <span>영상 요약 등록</span>
                            </button>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Users className="h-4 w-4" />
                                <span>개인화된 추천</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* 추천 영상이 로드되지 않았고, 로딩중이 아닌 경우 안내문구 표시 */}
            {!isLoading && !isDataFetched && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    <div className="text-center py-8">
                        <p className="text-gray-600 text-base">추천 영상 정보를 로드하는 중입니다...</p>
                    </div>
                </div>
            )}

            {/* 추천 영상 목록 표시 */}
            {!isLoading && recommendedVideos.length > 0 && (
                <div className="space-y-6">
                    {/* Search and Filter Inputs */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                type="text"
                                placeholder="영상 제목으로 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 text-base"
                            />
                        </div>
                        <div className="flex-1 relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                type="text"
                                placeholder="태그로 필터링..."
                                value={filterTag}
                                onChange={(e) => setFilterTag(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 text-base"
                            />
                        </div>
                    </div>

                    {/* Loading or No Results Message */}
                    {filteredVideos.length === 0 && (searchTerm || filterTag) ? (
                        <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                            <p className="text-lg font-medium">검색 결과가 없습니다.</p>
                            <p className="text-sm">다른 검색어나 태그를 시도해보세요.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredVideos.map((video, index) => (
                                <Recommendation key={video.id} recommendation={video} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecommendationPage;
