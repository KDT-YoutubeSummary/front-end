import React, { useState } from 'react';
import { Trash2, Edit, Clock, Repeat, User, Eye, Play, Sparkles, Hash } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Reminder Component
 * Displays a single reminder item with expand, edit, and delete functionalities.
 * @param {object} props - Component props.
 * @param {object} props.reminder - The reminder object data.
 * @param {function} props.onDelete - Function to delete a reminder.
 * @param {function} props.onEdit - Function to edit a reminder.
 * @param {string} props.expandedId - Currently expanded reminder ID.
 * @param {function} props.onToggleExpand - Function to handle expand/collapse.
 */
const Reminder = ({ reminder, onDelete, onEdit, expandedId, onToggleExpand }) => {
    const isExpanded = expandedId === reminder.id;

    const toggleExpand = () => {
        onToggleExpand(isExpanded ? null : reminder.id);
    };

    return (
        <div className="border-b border-gray-200 last:border-b-0 py-6">
            {/* Header with Video Info */}
            <div className="flex items-start space-x-6 px-6">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                    <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden relative">
                        {reminder.videoMetadata?.thumbnail ? (
                            <img 
                                src={reminder.videoMetadata.thumbnail} 
                                alt="영상 썸네일"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://placehold.co/240x160/e2e8f0/64748b?text=No+Image';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                <Play className="h-6 w-6 text-white" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                            <h3 className="text-lg font-semibold text-gray-800 hover:text-red-600 transition-colors cursor-pointer text-left" onClick={toggleExpand}>
                                {reminder.summaryTitle}
                            </h3>
                            
                            {/* Video Metadata */}
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                {reminder.videoMetadata?.uploader && (
                                    <div className="flex items-center space-x-1">
                                        <User className="h-3 w-3" />
                                        <span className="truncate">{reminder.videoMetadata.uploader}</span>
                                    </div>
                                )}
                                {reminder.videoMetadata?.views && (
                                    <div className="flex items-center space-x-1">
                                        <Eye className="h-3 w-3" />
                                        <span>{reminder.videoMetadata.views}회</span>
                                    </div>
                                )}
                            </div>

                            {/* Reminder Info as Tags */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{reminder.reminderTime}</span>
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex items-center space-x-1">
                                    <Repeat className="h-3 w-3" />
                                    <span>{reminder.reminderInterval}</span>
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 ml-6">
                            <button
                                onClick={() => onEdit(reminder)}
                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors transform hover:scale-110"
                                title="리마인더 수정"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onDelete(reminder.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors transform hover:scale-110"
                                title="리마인더 삭제"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={toggleExpand}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                            >
                                {isExpanded ? (
                                    <svg className="h-4 w-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Reminder Details - 애니메이션과 함께 */}
            <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="mt-6">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-6 space-y-6">
                            {/* 1. 리마인더 설정 섹션 */}
                            <div className="border-l-4 border-green-400 pl-4">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-green-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-green-900">리마인더 설정</h2>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                                            <span className="text-sm font-medium text-green-700">알림 시간</span>
                                            <span className="text-sm text-green-800 font-semibold">{reminder.reminderTime}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                                            <span className="text-sm font-medium text-green-700">반복 주기</span>
                                            <span className="text-sm text-green-800 font-semibold">{reminder.reminderInterval}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. 요약 내용 */}
                            <div className="border-l-4 border-blue-400 pl-4">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-blue-900">요약 내용</h2>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 max-h-96 overflow-y-auto">
                                    <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {reminder.summaryContent || '요약 내용을 불러올 수 없습니다.'}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            {/* 3. 메모 섹션 */}
                            <div className="border-l-4 border-purple-400 pl-4">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Edit className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-purple-900">메모</h2>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                    <div className="text-gray-700 leading-relaxed prose prose-lg max-w-none">
                                        {reminder.reminderNotes || '메모 없음'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reminder;
