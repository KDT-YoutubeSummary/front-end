import React, { useState, useEffect } from 'react';
// react-markdown 라이브러리를 사용합니다.
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, Eye, Calendar, Hash, Edit, Trash2, Bell, Lightbulb, X, Loader2, Archive, Plus, BookOpen, Play, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * SummaryArchive Component
 * Displays user's video summary storage UI (search, filter, list, detail view).
 * Data and handlers are passed as props from a parent container (e.g., SummaryArchivePage).
 */
const SummaryArchive = ({
                         summaryArchives,
                         selectedArchive,
                         setSelectedArchive,
                         handleSaveUserNotes,
                         handleDeleteArchive,
                         handleSetReminder,
                         searchTerm,
                         setSearchTerm,
                         filterTag,
                         setFilterTag,
                         tagChartData,
                         showTagStats,
                         setShowTagStats,
                         COLORS,
                         isSearching
                     }) => {

    const [userNotes, setUserNotes] = useState('');
    const [hoveredTag, setHoveredTag] = useState(null);
    
    // 페이징 상태 추가
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // 개선된 색상 팔레트 - 더 부드럽고 접근성 좋은 색상
    const improvedColors = [
        '#8FA7CA', // 소프트 블루
        '#98D8C8', // 소프트 민트
        '#F7DC6F', // 소프트 옐로우
        '#F1948A', // 소프트 코랄
        '#BB8FCE', // 소프트 퍼플
        '#85C1E9', // 소프트 라이트블루
        '#A9DFBF', // 소프트 그린
        '#F8C471', // 소프트 오렌지
        '#F48FB1', // 소프트 핑크
        '#9FA8DA', // 소프트 인디고
    ];

    // 패턴 배열 (색맹 사용자를 위한)
    const patterns = [
        'solid',
        'diagonal',
        'horizontal',
        'vertical',
        'dots',
        'crosshatch'
    ];

    useEffect(() => {
        if (selectedArchive && typeof selectedArchive === 'object') {
            setUserNotes(selectedArchive.userNotes || '');
        } else {
            setUserNotes('');
        }
    }, [selectedArchive]);

    // 검색어나 필터가 변경될 때 페이지를 첫 번째로 리셋
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterTag]);

    // 태그 정보 카드 컴포넌트 (파이차트 오른쪽에 고정)
    const TagInfoCard = () => {
        if (!hoveredTag) {
            return (
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 w-72 h-80 flex items-center justify-center mx-auto">
                    <div className="text-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <p className="text-base font-medium">태그에 마우스를 올려보세요</p>
                        <p className="text-sm mt-3">자세한 정보를 확인할 수 있습니다</p>
                    </div>
                </div>
            );
        }

        const tagData = tagChartData.find(item => item.name === hoveredTag);
        if (!tagData) return null;

        const total = tagChartData.reduce((sum, item) => sum + item.value, 0);
        const percentage = ((tagData.value / total) * 100).toFixed(1);
        const tagIndex = tagChartData.findIndex(item => item.name === hoveredTag);
        const tagColor = improvedColors[tagIndex % improvedColors.length];

        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 w-72 h-80 transition-all duration-300 mx-auto">
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-3">
                        <div 
                            className="w-6 h-6 rounded-full shadow-sm" 
                            style={{ backgroundColor: tagColor }}
                        ></div>
                        <span className="font-bold text-lg text-gray-800">{tagData.name}</span>
                    </div>
                </div>
                <div className="space-y-4 text-base">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 text-center">
                            <span className="font-bold text-xl text-blue-600">{tagData.value}</span>
                            <span className="text-gray-600 ml-1">개 영상</span>
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 text-center">
                            전체의 <span className="font-bold text-xl text-green-600">{percentage}%</span>
                        </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                        <div 
                            className="h-3 rounded-full transition-all duration-500 shadow-sm"
                            style={{ 
                                width: `${percentage}%`,
                                backgroundColor: tagColor 
                            }}
                        ></div>
                    </div>
                    <div className="text-center text-sm text-gray-500 mt-4">
                        {tagData.name} 태그 분포
                    </div>
                </div>
            </div>
        );
    };

    // 태그 확장/축소 상태
    const [isTagListExpanded, setIsTagListExpanded] = useState(false);
    // 태그 상세 정보 확장/축소 상태
    const [isTagDetailExpanded, setIsTagDetailExpanded] = useState(false);

    // 커스텀 레전드 컴포넌트 (상위 3개만 기본 표시)
    const CustomLegend = ({ payload }) => {
        if (!payload || payload.length === 0) return null;
        
        const visibleTags = isTagListExpanded ? payload : payload.slice(0, 3);
        const hasMoreTags = payload.length > 3;
        
        return (
            <div className="mt-6">
                <div className="flex flex-wrap justify-center gap-4">
                    {visibleTags.map((entry, index) => (
                        <div 
                            key={`legend-${entry.value}-${index}`}
                            className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredTag(entry.value)}
                            onMouseLeave={() => setHoveredTag(null)}
                        >
                            <div 
                                className="w-4 h-4 rounded-full transition-transform duration-200"
                                style={{ 
                                    backgroundColor: entry.color,
                                    transform: hoveredTag === entry.value ? 'scale(1.2)' : 'scale(1)'
                                }}
                            ></div>
                            <span className="text-sm font-medium text-gray-700">{entry.value}</span>
                            <span className="text-xs text-gray-500">
                                ({tagChartData.find(item => item.name === entry.value)?.value || 0}개)
                            </span>
                        </div>
                    ))}
                </div>
                {hasMoreTags && (
                    <div className="flex justify-center mt-4">
                        <button 
                            onClick={() => setIsTagListExpanded(!isTagListExpanded)}
                            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                        >
                            {isTagListExpanded ? '접기' : `더보기 (${payload.length - 3}개 더)`}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {selectedArchive ? (
                // Detailed Archive Item View (요약 페이지와 동일한 디자인)
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* 헤더 영역 - 썸네일과 메타데이터 */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-100">
                            <div className="flex items-start space-x-6">
                                {/* 썸네일 */}
                                <div
                                    className="relative w-48 h-32 bg-black rounded-xl overflow-hidden shadow-lg cursor-pointer flex-shrink-0 ring-2 ring-white"
                                    onClick={() => {
                                        if (selectedArchive.original_url) {
                                            window.open(selectedArchive.original_url, '_blank');
                                        }
                                    }}
                                >
                                    {selectedArchive.thumbnail ? (
                                        <img
                                            src={selectedArchive.thumbnail}
                                            alt="영상 썸네일"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                            <Play className="w-12 h-12 text-white opacity-50" />
                                        </div>
                                    )}

                                    {/* 재생 오버레이 */}
                                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-red-600 rounded-full p-3 transform hover:scale-110 transition-transform duration-200">
                                            <Play className="w-6 h-6 text-white fill-current" />
                                        </div>
                                    </div>
                                </div>

                                {/* 메타데이터 */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight flex-1 mr-4">
                                            {selectedArchive.title || '제목 없음'}
                                        </h1>
                                        
                                        {/* 액션 버튼들 */}
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            <button
                                                onClick={() => {
                                                    if (selectedArchive && selectedArchive.id) {
                                                        handleSetReminder(selectedArchive);
                                                    }
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="리마인더 설정"
                                            >
                                                <Bell className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (selectedArchive && selectedArchive.id) {
                                                        handleDeleteArchive(selectedArchive.id);
                                                    }
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="삭제"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => setSelectedArchive(null)}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="닫기"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 text-lg text-gray-700">
                                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">
                                                {(selectedArchive.uploader || 'U').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="font-semibold">
                                            {selectedArchive.uploader || '알 수 없는 채널'}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        {selectedArchive.views && (
                                            <span className="flex items-center space-x-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                                                </svg>
                                                <span>{selectedArchive.views}</span>
                                            </span>
                                        )}

                                        <span className="text-gray-400">•</span>
                                        <span className="flex items-center space-x-1">
                                            <Calendar className="w-4 h-4"/>
                                            <span>{selectedArchive.date}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 본문 영역 */}
                        <div className="p-6 space-y-6">
                            {/* 해시태그 섹션 */}
                            {selectedArchive.hashtags && selectedArchive.hashtags.length > 0 && (
                                <div className="border-l-4 border-green-400 pl-4">
                                    <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.94l1-4H9.03z" clipRule="evenodd"/>
                                        </svg>
                                        태그
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedArchive.hashtags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    index % 3 === 0 ? 'bg-blue-100 text-blue-800' :
                                                        index % 3 === 1 ? 'bg-green-100 text-green-800' :
                                                            'bg-purple-100 text-purple-800'
                                                }`}
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI 요약 섹션 */}
                            <div className="border-l-4 border-blue-400 pl-4">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-blue-900">AI 요약</h2>
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                        저장된 요약
                                    </span>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {selectedArchive.summary || '요약 내용을 불러올 수 없습니다.'}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            {/* 사용자 메모 섹션 */}
                            <div className="border-l-4 border-purple-400 pl-4">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Edit className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-purple-900">개인 메모</h2>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                    <textarea
                                        value={userNotes}
                                        onChange={(e) => setUserNotes(e.target.value)}
                                        placeholder="이 영상에 대한 개인적인 메모를 작성해보세요..."
                                        className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-base bg-white"
                                        rows={4}
                                    />
                                    <div className="mt-3">
                                        <button
                                            onClick={() => {
                                                if (selectedArchive && selectedArchive.id) {
                                                    handleSaveUserNotes(selectedArchive.id, userNotes);
                                                }
                                            }}
                                            className="bg-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-600 transition-colors text-base"
                                        >
                                            메모 저장
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 푸터 영역 - 목록으로 돌아가기 버튼 */}
                        <div className="bg-gray-50 p-6 border-t border-gray-100">
                            <button
                                onClick={() => setSelectedArchive(null)}
                                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-[1.01] shadow-lg hover:shadow-xl"
                            >
                                목록으로 돌아가기
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // Archive List View
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-base"
                            />
                        </div>
                        <div className="flex-1 relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                type="text"
                                placeholder="태그로 필터링..."
                                value={filterTag}
                                onChange={(e) => setFilterTag(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-base"
                            />
                        </div>
                    </div>

                    {/* Loading or No Results Message */}
                    {isSearching ? (
                        <div
                            className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col items-center justify-center min-h-[300px]">
                            <Loader2 className="h-10 w-10 animate-spin text-red-500 mb-4"/>
                            <p className="text-lg font-medium">검색 중...</p>
                            <p className="text-sm">잠시만 기다려주세요.</p>
                        </div>
                    ) : summaryArchives.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Archive className="h-10 w-10 text-yellow-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">첫 번째 요약본을 저장해보세요!</h3>
                                <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed text-base">
                                    YouTube 영상을 요약하여<br />
                                    <span className="font-semibold text-yellow-600">개인 요약 저장소</span>에 저장하고 관리하세요.
                                </p>

                                <div className="flex flex-col gap-4 justify-center items-center">
                                    <button
                                        onClick={() => window.location.href = '/'}
                                        className="bg-yellow-500 text-white py-3 px-8 rounded-lg font-bold hover:bg-yellow-600 transition-colors transform hover:scale-105 shadow-md flex items-center space-x-2 text-base"
                                    >
                                        <Plus className="h-5 w-5" />
                                        <span>영상 요약하기</span>
                                    </button>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <BookOpen className="h-4 w-4" />
                                        <span>개인 요약 저장소</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Archive Items Grid with Pagination */}
                            {(() => {
                                // 페이징 계산
                                const totalItems = summaryArchives.length;
                                const totalPages = Math.ceil(totalItems / itemsPerPage);
                                const startIndex = (currentPage - 1) * itemsPerPage;
                                const endIndex = startIndex + itemsPerPage;
                                const currentItems = summaryArchives.slice(startIndex, endIndex);

                                return (
                                    <>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                            {currentItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 ease-in-out cursor-pointer transform hover:-translate-y-1"
                                                    onClick={() => setSelectedArchive(item.id)}
                                                >
                                                    <div className="relative">
                                                        <img
                                                            src={item.thumbnail || 'https://placehold.co/320x180/e2e8f0/64748b?text=No+Image'}
                                                            alt="썸네일"
                                                            className="w-full h-48 object-cover hover:opacity-80 transition-opacity"
                                                            onError={(e) => e.target.src = 'https://placehold.co/320x180/e2e8f0/64748b?text=No+Image'}
                                                        />
                                                        <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                                                            저장됨
                                                        </div>
                                                    </div>
                                                    <div className="p-6">
                                                        <h3 className="text-lg font-semibold text-gray-800 mb-3 hover:text-blue-600 transition-colors line-clamp-2 leading-relaxed min-h-[3.5rem]">
                                                            {item.title}
                                                        </h3>
                                                        <div className="flex items-center text-gray-500 text-sm mb-4 justify-center">
                                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                            </svg>
                                                            {item.date}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mb-4 justify-center">
                                                            {item.hashtags?.slice(0, 3).map((tag, idx) => (
                                                                <span
                                                                    key={`${item.id}-tag-${idx}-${tag}`}
                                                                    className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs rounded-full font-medium border border-blue-200 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 transition-colors"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                            {item.hashtags?.length > 3 && (
                                                                <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                                                    +{item.hashtags.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* 페이지네이션 UI */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-center space-x-2 mt-12">
                                                {/* 이전 페이지 버튼 */}
                                                <button
                                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                    disabled={currentPage === 1}
                                                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                                                        currentPage === 1
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md hover:shadow-lg'
                                                    }`}
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                                    </svg>
                                                    <span>이전</span>
                                                </button>

                                                {/* 페이지 번호 버튼들 */}
                                                <div className="flex items-center space-x-1">
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                                                        // 현재 페이지 주변 5개만 표시
                                                        if (
                                                            pageNumber === 1 ||
                                                            pageNumber === totalPages ||
                                                            (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                                                        ) {
                                                            return (
                                                                <button
                                                                    key={pageNumber}
                                                                    onClick={() => setCurrentPage(pageNumber)}
                                                                    className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                                                                        currentPage === pageNumber
                                                                            ? 'bg-blue-600 text-white shadow-lg'
                                                                            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md hover:shadow-lg'
                                                                    }`}
                                                                >
                                                                    {pageNumber}
                                                                </button>
                                                            );
                                                        } else if (
                                                            pageNumber === currentPage - 3 ||
                                                            pageNumber === currentPage + 3
                                                        ) {
                                                            return (
                                                                <span key={pageNumber} className="px-2 text-gray-400">
                                                                    ...
                                                                </span>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                </div>

                                                {/* 다음 페이지 버튼 */}
                                                <button
                                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                                                        currentPage === totalPages
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md hover:shadow-lg'
                                                    }`}
                                                >
                                                    <span>다음</span>
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        )}

                                        {/* 페이지 정보 표시 */}
                                        <div className="text-center text-sm text-gray-500 mt-4">
                                            총 {totalItems}개 중 {startIndex + 1}-{Math.min(endIndex, totalItems)}개 표시
                                            {totalPages > 1 && ` (${currentPage}/${totalPages} 페이지)`}
                                        </div>
                                    </>
                                );
                            })()}
                        </>
                    )}

                    {/* Tag Statistics Section */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-6 space-y-0">
                            <div className="flex items-center space-x-3">
                                <svg className="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                                <div className="text-left">
                                    <h3 className="text-2xl font-bold text-gray-800">요약 저장소 통계</h3>
                                    <p className="text-gray-600 text-sm">태그별 요약 영상 분포를 한눈에 확인하세요</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowTagStats(!showTagStats)}
                                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 text-base ${
                                    showTagStats 
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md' 
                                        : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-lg'
                                }`}
                            >
                                <span className="flex items-center space-x-2">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                    <span>{showTagStats ? '통계 숨기기' : '통계 보기'}</span>
                                </span>
                            </button>
                        </div>
                        
                        {showTagStats && (
                            <div className="space-y-6 animate-fade-in">
                                {/* 통계 요약 카드 */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-700 text-sm font-medium mb-1">총 영상 수</p>
                                                <p className="text-3xl font-bold">{summaryArchives.length}</p>
                                                <p className="text-xs text-blue-600 mt-1">저장된 요약 영상</p>
                                            </div>
                                            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200">
                                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 text-green-800 rounded-xl p-6 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-green-700 text-sm font-medium mb-1">사용된 태그</p>
                                                <p className="text-3xl font-bold">{tagChartData.length}</p>
                                                <p className="text-xs text-green-600 mt-1">다양한 카테고리</p>
                                            </div>
                                            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200">
                                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800 rounded-xl p-6 shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-purple-700 text-sm font-medium mb-1">가장 인기 태그</p>
                                                <p className="text-lg font-bold truncate">
                                                    {tagChartData.length > 0 ? tagChartData[0]?.name || '-' : '-'}
                                                </p>
                                                <p className="text-xs text-purple-600 mt-1">
                                                    {tagChartData.length > 0 ? `${tagChartData[0]?.value || 0}개 영상` : '데이터 없음'}
                                                </p>
                                            </div>
                                            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200">
                                                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 차트 섹션 */}
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                            </svg>
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-800">태그별 분포</h4>
                                    </div>
                                    
                                    {tagChartData.length > 0 ? (
                                        <div className="space-y-6">
                                            {/* 차트 컨테이너 */}
                                            <div className="flex items-center gap-2">
                                                {/* 파이차트 */}
                                                <div className="relative" style={{ width: '55%' }}>
                                                    <ResponsiveContainer width="100%" height={400}>
                                                        <PieChart>
                                                            <Pie
                                                                data={tagChartData}
                                                                cx="50%"
                                                                cy="50%"
                                                                outerRadius={100}
                                                                innerRadius={50}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                                labelLine={false}
                                                                label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
                                                                onMouseEnter={(data, index) => setHoveredTag(data.name)}
                                                                onMouseLeave={() => setHoveredTag(null)}
                                                                stroke="#ffffff"
                                                                strokeWidth={2}
                                                                animationDuration={1000}
                                                                animationBegin={0}
                                                            >
                                                                {tagChartData.map((entry, index) => (
                                                                    <Cell 
                                                                        key={`cell-${index}`} 
                                                                        fill={improvedColors[index % improvedColors.length]}
                                                                        className="transition-all duration-300"
                                                                        style={{
                                                                            filter: hoveredTag === entry.name ? 'brightness(1.1)' : 'brightness(1)',
                                                                            transition: 'all 0.3s ease'
                                                                        }}
                                                                    />
                                                                ))}
                                                            </Pie>
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                    
                                                    {/* 중앙 통계 */}
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
                                                        <div className="text-center bg-white bg-opacity-80 rounded-full p-4 shadow-lg">
                                                            <div className="text-2xl font-bold text-gray-700">
                                                                {tagChartData.length}
                                                            </div>
                                                            <div className="text-sm text-gray-500">총 태그</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* 태그 정보 카드 */}
                                                <div className="flex-shrink-0" style={{ width: '45%' }}>
                                                    <TagInfoCard />
                                                </div>
                                            </div>
                                            
                                            {/* 커스텀 레전드 */}
                                            <CustomLegend payload={tagChartData.map((item, index) => ({
                                                value: item.name,
                                                color: improvedColors[index % improvedColors.length]
                                            }))} />
                                            
                                            {/* 태그 상세 목록 */}
                                            <div className="mt-8">
                                                <h5 className="text-md font-semibold text-gray-700 mb-4 flex items-center">
                                                    <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                                    </svg>
                                                    태그별 상세 정보
                                                </h5>
                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {(isTagDetailExpanded ? tagChartData : tagChartData.slice(0, 6)).map((tag, index) => {
                                                        const total = tagChartData.reduce((sum, item) => sum + item.value, 0);
                                                        const percentage = ((tag.value / total) * 100).toFixed(1);
                                                        const isHovered = hoveredTag === tag.name;
                                                        
                                                        return (
                                                            <div 
                                                                key={`tag-detail-${tag.name}-${index}`} 
                                                                className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                                                                    isHovered 
                                                                        ? 'border-blue-300 bg-blue-50 shadow-md' 
                                                                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                                                                }`}
                                                                onMouseEnter={() => setHoveredTag(tag.name)}
                                                                onMouseLeave={() => setHoveredTag(null)}
                                                            >
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center space-x-2">
                                                                        <div 
                                                                            className="w-4 h-4 rounded-full transition-transform duration-200"
                                                                            style={{ backgroundColor: improvedColors[index % improvedColors.length] }}
                                                                        ></div>
                                                                        <span className="font-medium text-base text-gray-800 truncate">{tag.name}</span>
                                                                    </div>
                                                                    <span className="text-base font-bold text-gray-700">{tag.value}개</span>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-600">비율</span>
                                                                        <span className="font-medium text-blue-600">{percentage}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                                        <div 
                                                                            className="h-2 rounded-full transition-all duration-500 ease-out"
                                                                            style={{ 
                                                                                width: `${percentage}%`,
                                                                                backgroundColor: improvedColors[index % improvedColors.length]
                                                                            }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {tagChartData.length > 6 && (
                                                    <div className="flex justify-center mt-6">
                                                        <button 
                                                            onClick={() => setIsTagDetailExpanded(!isTagDetailExpanded)}
                                                            className="px-6 py-3 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium flex items-center space-x-2"
                                                        >
                                                            <span>
                                                                {isTagDetailExpanded ? '접기' : `더보기 (${tagChartData.length - 6}개 더)`}
                                                            </span>
                                                            <svg 
                                                                className={`h-4 w-4 transition-transform duration-200 ${isTagDetailExpanded ? 'rotate-180' : ''}`}
                                                                fill="none" 
                                                                stroke="currentColor" 
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500 text-base">태그 데이터가 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <style>{`
              .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
              .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
              @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
        </div>
    );
};

export default SummaryArchive; 