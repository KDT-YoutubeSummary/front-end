import React, { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import Recommendation from '../components/Recommendation';

/**
 * Recommendation Page Component
 * Displays video recommendations based on user's library tags.
 * @param {object} props - Component props.
 * @param {object|null} props.recommendedVideo - The recommended video object.
 * @param {boolean} props.isGeneratingRecommendation - Loading state for recommendation.
 * @param {function} props.onGenerateRecommendation - Function to trigger recommendation generation.
 * @param {number} props.libraryItemsCount - Count of library items (to enable/disable button).
 * @param {function} props.onNavigateToLibrary - Function to navigate to library page.
 */
const RecommendationPage = ({
  recommendedVideo,
  isGeneratingRecommendation,
  onGenerateRecommendation,
  libraryItemsCount,
  // 통합 시 주의: 이 props는 App.jsx에서 전달되며, 파일 구조 변경에 따라 수정이 필요합니다.
  onNavigateToLibrary
}) => {
    // 컴포넌트가 화면에 표시되는지 감지
    const [isVisible, setIsVisible] = useState(false);

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
            {/* 추천 영상이 없을 때만 소개 텍스트와 버튼 표시 */}
            {!recommendedVideo ? (
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
            {recommendedVideo && (
                <Recommendation recommendation={recommendedVideo} />
            )}
        </div>
    );
};

export default RecommendationPage;
