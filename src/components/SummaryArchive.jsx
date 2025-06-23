import React, { useState, useEffect } from 'react';
// react-markdown 라이브러리를 사용합니다.
import ReactMarkdown from 'react-markdown';
import { Search, Eye, Calendar, Hash, Edit, Trash2, Bell, Lightbulb, X, Loader2, Archive, Plus, BookOpen } from 'lucide-react';
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

    // 개선된 색상 팔레트 - 더 부드럽고 접근성 좋은 색상
    const improvedColors = [
        '#3B82F6', // Blue
        '#10B981', // Emerald
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#8B5CF6', // Violet
        '#06B6D4', // Cyan
        '#84CC16', // Lime
        '#F97316', // Orange
        '#EC4899', // Pink
        '#6366F1', // Indigo
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
                // Detailed Archive Item View
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in-up">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                        <div className="flex space-x-4 items-start flex-1 min-w-0">
                            <img
                                src={selectedArchive.thumbnail || 'https://placehold.co/128x80/e2e8f0/64748b?text=No+Image'}
                                alt="썸네일"
                                className="w-32 h-20 object-cover rounded-lg shadow-md flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                                    if (selectedArchive.original_url) {
                                        window.open(selectedArchive.original_url, '_blank');
                                    }
                                }}
                                onError={(e) => e.target.src = 'https://placehold.co/128x80/e2e8f0/64748b?text=No+Image'}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-xl font-semibold text-gray-800 break-words text-left flex-1 mr-3">{selectedArchive.title}</h3>
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                        <button
                                            onClick={() => {
                                                console.log('🔍 삭제 클릭 - selectedArchive:', selectedArchive);
                                                if (selectedArchive && selectedArchive.id) {
                                                    handleDeleteArchive(selectedArchive.id);
                                                } else {
                                                    console.error('❌ selectedArchive 또는 ID가 없습니다:', selectedArchive);
                                                    alert('삭제 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
                                                }
                                            }}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="삭제"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                console.log('🔍 리마인더 설정 클릭 - selectedArchive:', selectedArchive);
                                                if (selectedArchive && selectedArchive.id) {
                                                    handleSetReminder(selectedArchive);
                                                } else {
                                                    console.error('❌ selectedArchive 또는 ID가 없습니다:', selectedArchive);
                                                    alert('리마인더 설정 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
                                                }
                                            }}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="리마인더 설정"
                                        >
                                            <Bell className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedArchive(null)}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm mb-2 truncate text-left">{selectedArchive.uploader}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <Eye className="h-4 w-4"/>
                                        <span>{selectedArchive.views} 조회수</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4"/>
                                        <span>{selectedArchive.date}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* 요약 내용 */}
                        <div className="text-left">
                            <h4 className="text-base font-semibold text-gray-800 mb-2">요약 내용</h4>
                            <div className="bg-gray-50 rounded-lg p-4 text-base text-gray-700 leading-relaxed">
                                <ReactMarkdown>{selectedArchive.summary}</ReactMarkdown>
                            </div>
                        </div>

                        {/* 사용자 메모 */}
                        <div className="text-left">
                            <h4 className="text-base font-semibold text-gray-800 mb-2">내 메모</h4>
                            <textarea
                                value={userNotes}
                                onChange={(e) => setUserNotes(e.target.value)}
                                placeholder="이 영상에 대한 개인적인 메모를 작성해보세요..."
                                className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                                rows={4}
                            />
                            <div className="mt-3">
                                <button
                                    onClick={() => {
                                        console.log('🔍 메모 저장 클릭 - selectedArchive:', selectedArchive);
                                        console.log('🔍 selectedArchive.id:', selectedArchive?.id);
                                        console.log('🔍 userNotes:', userNotes);
                                        
                                        if (selectedArchive && selectedArchive.id) {
                                            handleSaveUserNotes(selectedArchive.id, userNotes);
                                        } else {
                                            console.error('❌ selectedArchive 또는 ID가 없습니다:', selectedArchive);
                                            alert('메모 저장 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
                                        }
                                    }}
                                    className="bg-red-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-600 transition-colors text-base"
                                >
                                    메모 저장
                                </button>
                            </div>
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
                        // Archive Items Grid
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {summaryArchives.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200 ease-in-out cursor-pointer"
                                    onClick={() => setSelectedArchive(item.id)}
                                >
                                    <img
                                        src={item.thumbnail || 'https://placehold.co/320x180/e2e8f0/64748b?text=No+Image'}
                                        alt="썸네일"
                                        className="w-full h-40 object-cover hover:opacity-80 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation(); // 카드 클릭 이벤트 방지
                                            if (item.original_url) {
                                                window.open(item.original_url, '_blank');
                                            }
                                        }}
                                        onError={(e) => e.target.src = 'https://placehold.co/320x180/e2e8f0/64748b?text=No+Image'}
                                    />
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-2">{item.date}</p>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {item.hashtags?.slice(0, 3).map((tag, idx) => (
                                                <span
                                                    key={`${item.id}-tag-${idx}-${tag}`}
                                                    className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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