import React, { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import Recommendation from '../components/Recommendation';
import { recommendationApi } from '../services/api.jsx';

/**
 * Recommendation Page Component
 * Displays video recommendations based on user's library tags.
 * @param {object} props - Component props.
 * @param {object|null} props.recommendedVideo - The recommended video object.
 * @param {boolean} props.isGeneratingRecommendation - Loading state for recommendation.
 * @param {function} props.onGenerateRecommendation - Function to trigger recommendation generation.
 * @param {number} props.libraryItemsCount - Count of library items (to enable/disable button).
 * @param {function} props.onNavigateToLibrary - Function to navigate to library page.
 * @param {string} props.userId - Current user ID.
 * @param {function} props.setRecommendedVideo - Function to set recommendation data.
 * @param {function} props.setIsGeneratingRecommendation - Function to set loading state.
 * @param {function} props.setMessageModalContent - Function to set message modal content.
 * @param {function} props.setShowMessageModal - Function to show message modal.
 */
const RecommendationPage = ({
  recommendedVideo,
  isGeneratingRecommendation,
  onGenerateRecommendation,
  libraryItemsCount,
  // 통합 시 주의: 이 props는 App.jsx에서 전달되며, 파일 구조 변경에 따라 수정이 필요합니다.
  onNavigateToLibrary,
  userId,
  setRecommendedVideo,
  setIsGeneratingRecommendation,
  setMessageModalContent,
  setShowMessageModal
}) => {
    // 컴포넌트가 화면에 표시되는지 감지
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 더미 추천 데이터 - API 실패 시 폴백용 (현재 사용하지 않음)
    /*
    const dummyRecommendation = {
        title: "LLM을 활용한 애플리케이션 개발",
        reason: "사용자 라이브러리의 'AI요약', '영상학습' 태그와 관련하여 LLM 활용 분야의 심화 학습에 도움이 될 것입니다.",
        youtubeUrl: "https://www.youtube.com/watch?v=dummy_video_id_123"
    };
    */

    // 페이지가 로드될 때 추천 영상 정보를 자동으로 가져오는 함수
    const fetchRecommendations = async () => {
        if (!userId) return;

        setIsLoading(true);
        setIsGeneratingRecommendation(true);

        try {
            // API 호출 시도
            const recommendations = await recommendationApi.getUserRecommendations(userId);
            console.log('추천 영상 데이터:', recommendations); // 콘솔에 추천 영상 데이터 출력

            if (recommendations && recommendations.length > 0) {
                // API 응답에서 첫 번째 추천 영상 정보를 사용
                const latestRecommendation = recommendations[0];

                // API 응답 구조 확인 및 필요한 형식으로 변환
                // API 응답 구조는 { recommendedVideo: { title, originalUrl }, recommendationReason } 형태
                const formattedRecommendation = {
                    title: latestRecommendation.recommendedVideo?.title || '제목 없음',
                    reason: latestRecommendation.recommendationReason || '추천 이유가 제공되지 않았습니다.',
                    youtubeUrl: latestRecommendation.recommendedVideo?.originalUrl || '',
                    // 추가 정보 (표시가 필요한 경우 Recommendation 컴포넌트도 수정 필요)
                    uploaderName: latestRecommendation.recommendedVideo?.uploaderName || '',
                    thumbnailUrl: latestRecommendation.recommendedVideo?.thumbnailUrl || '',
                    viewCount: latestRecommendation.recommendedVideo?.viewCount || 0
                };

                console.log('변환된 추천 영상:', formattedRecommendation); // 변환된 데이터 확인
                setRecommendedVideo(formattedRecommendation);
            } else {
                // 추천 영상이 없는 경우 null로 설정
                setRecommendedVideo(null);
                console.log('추천 영상이 없습니다.');
            }
        } catch (error) {
            console.error('추천 영상 조회 실패:', error);

            // 403 오류 발생 시 (권한 문제)
            if (error.response && error.response.status === 403) {
                console.log('권한 오류가 발생했습니다.');
                // 더미 데이터 사용 코드 주석 처리
                // setRecommendedVideo(dummyRecommendation);

                // 사용자에게 알림 메시지 표시
                setMessageModalContent('인증 권한이 없습니다. 다시 로그인해주세요.');
                setShowMessageModal(true);
                setRecommendedVideo(null);
            } else {
                // 다른 오류의 경우 메시지 표시
                setMessageModalContent('추천 영상을 불러오는 중 오류가 발생했습니다.');
                setShowMessageModal(true);
                setRecommendedVideo(null);
            }
        } finally {
            setIsLoading(false);
            setIsGeneratingRecommendation(false);
        }
    };

    // 컴포넌트가 마운트될 때와 userId가 변경될 때 추천 영상 정보를 가져옴
    useEffect(() => {
        fetchRecommendations();
    }, [userId]);

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

    return (
        <div id="recommendation-page" className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200 space-y-6 text-center">
            {/* 로딩 중 표시 */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500 mb-4"></div>
                    <p className="text-gray-600">추천 영상을 불러오는 중입니다...</p>
                </div>
            )}

            {/* 추천 영상이 없을 때만 소개 텍스트와 버튼 표시 */}
            {!isLoading && !recommendedVideo ? (
                <>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">영상을 추천받으세요!</h3>
                    <p className="text-gray-600 mb-6">사용자 라이브러리에 요약본을 추가하면 <br/>요약본의 태그를 분석하여 관심사에 맞는 YouTube 동영상을 추천해 드립니다.</p>

                    {/*
                      * 주의: 통합 개발 시 파일 구조 변경에 따라 이 버튼의 동작 방식을 수정해야 합니다.
                      * LibraryPage 컴포넌트 구현 완료 후 onNavigateToLibrary 함수의 실제 구현을 연결해야 합니다.
                      * 현재는 App.jsx의 setCurrentPage 함수를 사용하여 페이지 전환을 처리하지만,
                      * 향후 React Router 등을 사용하는 경우 이 부분을 useNavigate 또는 Link 컴포넌트로 변경해야 합니다.
                      */}
                    <button
                        onClick={onNavigateToLibrary} // 사용자 라이브러리 페이지로 이동하는 함수 호출
                        className="bg-purple-500 text-white py-3 px-8 rounded-lg font-bold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-md"
                    >
                        사용자 라이브러리 등록
                    </button>
                </>
            ) : null}

            {/* Recommendation 컴포넌트 사용 */}
            {!isLoading && recommendedVideo && (
                <Recommendation recommendation={recommendedVideo} />
            )}
        </div>
    );
};

export default RecommendationPage;
