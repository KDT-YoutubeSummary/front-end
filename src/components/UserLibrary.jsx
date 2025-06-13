// src/components/UserLibrary.jsx

import React, { useState, useEffect } from 'react';
import { Search, Eye, Calendar, Hash, Edit, Trash2, Bell, Lightbulb, X, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * UserLibrary Component
 * Displays user's video library UI (search, filter, list, detail view).
 * Data and handlers are passed as props from a parent container (e.g., LibraryPage).
 * @param {object} props - Component props.
 * @param {Array<object>} props.libraryItems - Currently displayed (filtered) list of summarized video items.
 * @param {object|null} props.selectedLibraryItem - The currently selected item's *detailed* data for detail view.
 * @param {function} props.setSelectedLibraryItem - Function to set the selected item's ID (or null to go back).
 * @param {function} props.handleSaveUserNotes - Function to save user notes to backend.
 * @param {function} props.handleDeleteLibraryItem - Function to delete a library item from backend.
 * @param {function} props.handleSetReminder - Function to open reminder modal for an item.
 * @param {string} props.librarySearchTerm - Current search term for library.
 * @param {function} props.setLibrarySearchTerm - Function to set library search term.
 * @param {string} props.libraryFilterTag - Current filter tag for library.
 * @param {function} props.setLibraryFilterTag - Function to set library filter tag.
 * @param {Array<object>} props.tagChartData - Data for tag statistics from API.
 * @param {boolean} props.showTagStats - Whether to show tag statistics.
 * @param {function} props.setShowTagStats - Function to toggle tag statistics.
 * @param {Array<string>} props.COLORS - Colors for charts.
 * @param {boolean} props.isSearching - Indicates if search/fetch is in progress.
 */
const UserLibrary = ({
                         libraryItems,
                         selectedLibraryItem,
                         setSelectedLibraryItem,
                         handleSaveUserNotes, // props로 받음
                         handleDeleteLibraryItem, // props로 받음
                         handleSetReminder,
                         librarySearchTerm,
                         setLibrarySearchTerm,
                         libraryFilterTag,
                         setLibraryFilterTag,
                         tagChartData, // props로 받음
                         showTagStats,
                         setShowTagStats,
                         COLORS,
                         isSearching
                     }) => {

    const [userNotes, setUserNotes] = useState('');

    useEffect(() => {
        if (selectedLibraryItem && typeof selectedLibraryItem === 'object') {
            setUserNotes(selectedLibraryItem.userNotes || '');
        } else {
            setUserNotes('');
        }
    }, [selectedLibraryItem]);


    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {selectedLibraryItem ? (
                // Detailed Library Item View
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                        <div className="flex space-x-4 items-start">
                            <img
                                src={selectedLibraryItem.thumbnail || 'https://placehold.co/128x80/e2e8f0/64748b?text=No+Image'}
                                alt="썸네일"
                                className="w-32 h-20 object-cover rounded-lg shadow-md"
                                onError={(e) => e.target.src = 'https://placehold.co/128x80/e2e8f0/64748b?text=No+Image'}
                            />
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    {selectedLibraryItem.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-2">{selectedLibraryItem.uploader}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <Eye className="h-4 w-4"/>
                                        <span>{selectedLibraryItem.views} 조회수</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4"/>
                                        <span>{selectedLibraryItem.date}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleSetReminder(true)}
                                className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors transform hover:scale-110"
                                title="리마인더 설정"
                            >
                                <Bell className="h-6 w-6"/>
                            </button>
                            <button
                                onClick={() => handleDeleteLibraryItem(selectedLibraryItem.id)}
                                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors transform hover:scale-110"
                                title="삭제"
                            >
                                <Trash2 className="h-6 w-6"/>
                            </button>
                            <button
                                onClick={() => setSelectedLibraryItem(null)}
                                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors transform hover:scale-110"
                                title="목록으로 돌아가기"
                            >
                                <X className="h-6 w-6"/>
                            </button>
                        </div>
                    </div>

                    {/* Hashtags */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <Hash className="h-4 w-4 text-gray-400"/>
                            <div className="flex flex-wrap gap-2">
                                {selectedLibraryItem.hashtags?.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary Content */}
                    <div className="p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                            요약 내용
                        </h4>
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                            {selectedLibraryItem.summary}
                        </div>
                    </div>

                    {/* User Memo Section */}
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">사용자 메모</h4>
                        <textarea
                            value={userNotes}
                            onChange={(e) => setUserNotes(e.target.value)}
                            placeholder="나만의 메모를 추가해보세요..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-y min-h-[120px] text-gray-700"
                            rows="5"
                        />
                        <button
                            onClick={() => handleSaveUserNotes(selectedLibraryItem.id, userNotes)}
                            className="mt-4 bg-red-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-red-600 transition-colors transform hover:scale-105 shadow-md"
                        >
                            메모 저장
                        </button>
                    </div>
                </div>
            ) : (
                // Library Grid View (Main Library Page)
                <div className="space-y-6">
                    {/* Search and Filter Inputs */}
                    <div
                        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input
                                type="text"
                                placeholder="제목으로 검색..."
                                value={librarySearchTerm}
                                onChange={(e) => setLibrarySearchTerm(e.target.value)}
                                className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                            />
                        </div>
                        <div className="flex-1 relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input
                                type="text"
                                placeholder="태그로 필터링..."
                                value={libraryFilterTag}
                                onChange={(e) => setLibraryFilterTag(e.target.value)}
                                className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Loading or No Results Message */}
                    {isSearching ? (
                        <div
                            className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-red-500 mb-4"/>
                            <p className="text-lg font-medium">검색 중...</p>
                            <p className="text-sm">잠시만 기다려주세요.</p>
                        </div>
                    ) : (
                        libraryItems.length === 0 ? (
                            <div
                                className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                                <p className="text-lg font-medium">검색 결과가 없습니다.</p>
                                <p className="text-sm">다른 검색어나 태그를 시도해보세요.</p>
                            </div>
                        ) : (
                            // Library Items Grid
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {libraryItems.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedLibraryItem(item.id)}
                                        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-1"
                                    >
                                        <img
                                            src={item.thumbnail || 'https://placehold.co/320x180/e2e8f0/64748b?text=No+Image'}
                                            alt="썸네일"
                                            className="w-full h-40 object-cover"
                                            onError={(e) => e.target.src = 'https://placehold.co/320x180/e2e8f0/64748b?text=No+Image'}
                                        />
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-2">{item.date}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {item.hashtags?.map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}


                    {/* Tag Statistics Section */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
                            <span>태그별 통계</span>
                            <button
                                onClick={() => setShowTagStats(!showTagStats)}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                            >
                                {showTagStats ? '통계 숨기기' : '통계 보기'}
                            </button>
                        </h3>
                        {showTagStats && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                {tagChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={tagChartData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                                labelLine={false}
                                                label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                            >
                                                {tagChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                                ))}
                                            </Pie>
                                            <Tooltip/>
                                            </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-center text-gray-600">태그 통계를 표시할 데이터가 없습니다.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default UserLibrary;