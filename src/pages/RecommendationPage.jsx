import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // React Router 추가
import Recommendation from '../components/Recommendation';
import { recommendationApi } from '../services/api.jsx';
import { Lightbulb, Plus, TrendingUp, Users, Clock, Search, Hash, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Helper Functions ---
const getYoutubeIdFromUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^&\n?#]+)/);
    return match ? match[1] : null;
};

const getYoutubeThumbnailUrl = (youtubeId) => {
    if (!youtubeId) return 'https://placehold.co/320x180/e2e8f0/64748b?text=No+Image'; // Placeholder 이미지
    return `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`;
};

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
    const [error, setError] = useState(null); // 에러 상태 추가

    // --- Search States ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTag, setFilterTag] = useState('');
    
    // --- Pagination States ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // 사용자 ID를 localStorage에서 가져옴 - 더 안전하게 처리
    const getUserId = () => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('accessToken');
        const username = localStorage.getItem('username');
        
        console.log('🔍 사용자 인증 정보 확인:', {
            userId: userId,
            hasToken: !!token,
            username: username,
            userIdType: typeof userId
        });
        
        // 인증 정보가 모두 있는지 확인
        if (!userId || !token || !username) {
            console.warn('⚠️ 불완전한 사용자 인증 정보:', { userId, hasToken: !!token, username });
            return null;
        }
        
        return userId;
    };

    const userId = getUserId();

    // 요약 페이지로 이동하는 함수
    const handleNavigateToSummary = () => {
        navigate('/');
    };

    // 백엔드 서버 상태 확인 함수
    const checkServerHealth = async () => {
        try {
            // 서버 헬스 체크 API 호출
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/actuator/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000
            });
            
            if (response.ok) {
                console.log('✅ 백엔드 서버가 정상적으로 실행 중입니다.');
                return true;
            } else {
                console.warn('⚠️ 백엔드 서버 응답이 정상적이지 않습니다.');
                return false;
            }
        } catch (error) {
            console.error('❌ 백엔드 서버에 연결할 수 없습니다:', error);
            return false;
        }
    };

    // 페이지가 로드될 때 추천 영상 정보를 자동으로 가져오는 함수
    const fetchRecommendations = async () => {
        if (!userId) {
            console.warn('⚠️ 사용자 ID가 없어서 추천 데이터를 조회할 수 없습니다.');
            setError('사용자 인증 정보가 없습니다. 다시 로그인해주세요.');
            setIsDataFetched(true);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('🔍 추천 데이터 조회 시작 - userId:', userId);
            
            // API 호출 (SummaryArchivePage와 동일한 방식)
            const response = await recommendationApi.getUserRecommendations(userId);
            console.log('📋 추천 영상 목록 응답:', response);
            
            // SummaryArchivePage와 동일한 방식으로 데이터 처리
            const recommendations = response.data || response || [];
            
            if (recommendations && recommendations.length > 0) {
                const formattedRecommendations = recommendations.map((rec, index) => {
                    console.log(`🔍 추천 항목 ${index + 1}:`, rec);
                    console.log(`🔍 추천 항목 구조 분석:`, Object.keys(rec));
                    
                    // 백엔드 Entity에서 관련 영상 정보 추출
                    // VideoRecommendation Entity는 recommendedVideo (추천된 영상)과 sourceVideo (소스 영상)을 가짐
                    const recommendedVideo = rec.recommendedVideo || rec.recommended_video || {};
                    const sourceVideo = rec.sourceVideo || rec.source_video || {};
                    
                    console.log(`🔍 추천된 영상 (recommendedVideo):`, recommendedVideo);
                    console.log(`🔍 소스 영상 (sourceVideo):`, sourceVideo);
                    
                    // 추천된 영상의 정보를 우선적으로 사용 (없으면 소스 영상 정보 사용)
                    const targetVideo = Object.keys(recommendedVideo).length > 0 ? recommendedVideo : sourceVideo;
                    console.log(`🔍 사용할 영상 정보:`, targetVideo);
                    
                    // Video Entity에서 영상 정보 추출
                    const videoTitle = targetVideo.title || targetVideo.videoTitle || rec.title || '제목 없음';
                    const originalUrl = targetVideo.originalUrl || targetVideo.original_url || rec.url || '';
                    const uploaderName = targetVideo.uploaderName || targetVideo.uploader_name || '';
                    const viewCount = targetVideo.viewCount || targetVideo.view_count || 0;
                    const thumbnailUrl = targetVideo.thumbnailUrl || targetVideo.thumbnail_url || '';
                    
                    // 썸네일이 없으면 YouTube ID로 생성
                    const finalThumbnailUrl = thumbnailUrl || getYoutubeThumbnailUrl(getYoutubeIdFromUrl(originalUrl));

                    const formattedItem = {
                        id: rec.recommendationId || rec.id || index,
                        title: videoTitle,
                        reason: rec.recommendationReason || rec.reason || '추천 이유가 제공되지 않았습니다.',
                        youtubeUrl: originalUrl,
                        thumbnailUrl: finalThumbnailUrl,
                        uploaderName: uploaderName,
                        viewCount: viewCount,
                        createdAt: rec.createdAt || rec.recommendedAt || null,
                    };
                    
                    console.log(`🔍 변환된 추천 항목:`, formattedItem);
                    return formattedItem;
                });

                console.log('✅ 변환된 추천 영상 목록:', formattedRecommendations);
                setRecommendedVideos(formattedRecommendations);
                setError(null);
            } else {
                console.log('📝 추천 영상이 없습니다.');
                setRecommendedVideos([]);
                setError(null);
            }
        } catch (error) {
            console.error('❌ 추천 영상 조회 실패:', error);
            console.error('❌ 에러 상세:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });

            // 403 오류 발생 시 (권한 문제)
            if (error.response && error.response.status === 403) {
                console.log('⚠️ 권한 오류가 발생했습니다.');
                setError('접근 권한이 없습니다. 다시 로그인해주세요.');
                setRecommendedVideos([]);
            } else if (error.response && error.response.status === 401) {
                console.log('⚠️ 인증 오류가 발생했습니다.');
                setError('인증이 만료되었습니다. 다시 로그인해주세요.');
                setRecommendedVideos([]);
            } else if (error.response && error.response.status === 404) {
                console.log('⚠️ 사용자 추천 데이터를 찾을 수 없습니다.');
                setError('사용자 추천 데이터를 찾을 수 없습니다.');
                setRecommendedVideos([]);
            } else if (error.isNetworkError || error.code === 'ERR_NETWORK' || error.name === 'TypeError') {
                console.log('⚠️ 네트워크 오류가 발생했습니다.');
                setError('백엔드 서버에 연결할 수 없습니다.\n\n• 백엔드 서버가 실행 중인지 확인해주세요 (포트 8080)\n• 네트워크 연결 상태를 확인해주세요');
                setRecommendedVideos([]);
            } else {
                // 다른 오류의 경우 메시지 표시
                setError(`추천 데이터 조회 중 오류가 발생했습니다:\n${error.message}`);
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
            console.log('🔍 컴포넌트가 화면에 표시됨, API 호출 시작');
            fetchRecommendations();
        }
    }, [isVisible, userId, isDataFetched]);
    
    // 컴포넌트가 마운트될 때도 데이터를 가져오도록 추가
    useEffect(() => {
        if (userId) {
            console.log('🔍 컴포넌트 마운트됨, 추천 데이터 조회 시작');
            fetchRecommendations();
        } else {
            console.warn('⚠️ 사용자 ID가 없어서 추천 데이터를 조회하지 않습니다.');
            setError('사용자 인증 정보가 없습니다. 다시 로그인해주세요.');
            setIsDataFetched(true);
        }
    }, [userId]);

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
    
    // 검색어나 필터가 변경될 때 페이지를 첫 번째로 리셋
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterTag]);

    // 페이지네이션 계산
    const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentVideos = filteredVideos.slice(startIndex, endIndex);

    // 페이지 변경 함수
    const handlePageChange = (page) => {
        setCurrentPage(page);
        // 페이지 변경 시 스크롤을 맨 위로
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 페이지네이션 렌더링 함수
    const renderPagination = () => {
        if (filteredVideos.length <= itemsPerPage) return null;

        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex justify-center items-center space-x-2 mt-8">
                {/* 이전 페이지 버튼 */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg flex items-center space-x-1 ${
                        currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-purple-600 hover:bg-purple-50 hover:text-purple-700'
                    } transition-colors`}
                >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="hidden sm:inline">이전</span>
                </button>

                {/* 첫 페이지 */}
                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => handlePageChange(1)}
                            className="px-3 py-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="text-gray-400">...</span>}
                    </>
                )}

                {/* 페이지 번호 */}
                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === page
                                ? 'bg-purple-500 text-white font-medium'
                                : 'text-purple-600 hover:bg-purple-50'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {/* 마지막 페이지 */}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            className="px-3 py-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* 다음 페이지 버튼 */}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg flex items-center space-x-1 ${
                        currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-purple-600 hover:bg-purple-50 hover:text-purple-700'
                    } transition-colors`}
                >
                    <span className="hidden sm:inline">다음</span>
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        );
    };

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

            {/* 에러 발생 시 표시 */}
            {!isLoading && error && (
                <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">데이터 조회 오류</h3>
                        <p className="text-red-600 mb-6 whitespace-pre-line">{error}</p>
                        <div className="flex flex-col gap-4 justify-center items-center">
                            <button
                                onClick={() => {
                                    setError(null);
                                    setIsDataFetched(false);
                                    fetchRecommendations();
                                }}
                                className="bg-red-500 text-white py-3 px-8 rounded-lg font-bold hover:bg-red-600 transition-colors transform hover:scale-105 shadow-md text-base"
                            >
                                다시 시도
                            </button>
                            <button
                                onClick={handleNavigateToSummary}
                                className="bg-purple-500 text-white py-3 px-8 rounded-lg font-bold hover:bg-purple-600 transition-colors transform hover:scale-105 shadow-md flex items-center space-x-2 text-base"
                            >
                                <Plus className="h-5 w-5" />
                                <span>영상 요약 등록</span>
                            </button>
                        </div>
                        </div>
                    </div>
                )}

            {/* 추천 영상이 없을 때만 소개 텍스트와 버튼 표시 */}
            {!isLoading && !error && recommendedVideos.length === 0 && isDataFetched ? (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <TrendingUp className="h-10 w-10 text-purple-600" />
                            </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">맞춤형 영상을 추천받으세요!</h3>
                            <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed text-base">
                            사용자 요약 저장소에 요약본을 추가하면 AI가 태그를 분석하여<br />
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

            {/* 데이터가 로드되지 않았고, 로딩중이 아니고, 에러가 없는 경우 안내문구 표시 */}
            {!isLoading && !error && !isDataFetched && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    <div className="text-center py-8">
                        <p className="text-gray-600 text-base">추천 영상 정보를 로드하는 중입니다...</p>
                        </div>
                    </div>
                )}

            {/* 추천 영상 목록 표시 */}
            {!isLoading && !error && recommendedVideos.length > 0 && (
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

                    {/* 페이지네이션 정보 */}
                    {filteredVideos.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>총 {filteredVideos.length}개의 추천 영상</span>
                                {totalPages > 1 && (
                                    <span>페이지 {currentPage} / {totalPages}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Loading or No Results Message */}
                    {filteredVideos.length === 0 && (searchTerm || filterTag) ? (
                            <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                                <p className="text-lg font-medium">검색 결과가 없습니다.</p>
                                <p className="text-sm">다른 검색어나 태그를 시도해보세요.</p>
                            </div>
                    ) : (
                        <div className="space-y-4">
                            {currentVideos.map((video, index) => (
                                <Recommendation key={video.id} recommendation={video} index={startIndex + index} />
                                    ))}
                                </div>
                    )}

                                {/* 페이지네이션 */}
                    {renderPagination()}
                    </div>
                )}
        </div>
    );
};

export default RecommendationPage;
