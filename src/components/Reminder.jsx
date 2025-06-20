import React, { useState } from 'react';
import { Trash2, Edit, Clock, Repeat, User, Eye, Play } from 'lucide-react';

/**
 * Reminder Component
 * Displays a single reminder item with expand, edit, and delete functionalities.
 * @param {object} props - Component props.
 * @param {object} props.reminder - The reminder object data.
 * @param {function} props.onDelete - Function to delete a reminder.
 * @param {function} props.onEdit - Function to edit a reminder.
 */
const Reminder = ({ reminder, onDelete, onEdit }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="border-b border-gray-200 last:border-b-0 py-6">
            {/* Header with Video Info */}
            <div className="flex items-start space-x-4">
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
                        <div className="flex-1 min-w-0">
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

                            {/* Reminder Info */}
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                                <div className="flex items-center space-x-1 text-blue-600">
                                    <Clock className="h-3 w-3" />
                                    <span>{reminder.reminderTime}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-purple-600">
                                    <Repeat className="h-3 w-3" />
                                    <span>{reminder.reminderInterval}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 ml-4">
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

            {/* Expanded Reminder Details */}
            {isExpanded && (
                <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Summary Content */}
                        <div>
                            <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <Play className="h-4 w-4 mr-2 text-red-500" />
                                요약 내용
                            </h5>
                            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed bg-white p-4 rounded-lg border border-gray-100">
                                {reminder.summaryContent}
                            </div>
                        </div>

                        {/* Reminder Details */}
                        <div className="space-y-4">
                            <div>
                                <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                    리마인더 설정
                                </h5>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <span className="text-sm font-medium text-blue-700">알림 시간</span>
                                        <span className="text-sm text-blue-800 font-semibold">{reminder.reminderTime}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                        <span className="text-sm font-medium text-purple-700">반복 주기</span>
                                        <span className="text-sm text-purple-800 font-semibold">{reminder.reminderInterval}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <Edit className="h-4 w-4 mr-2 text-green-500" />
                                    메모
                                </h5>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                                        {reminder.reminderNotes || '메모 없음'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reminder;
