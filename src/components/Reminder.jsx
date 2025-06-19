// src/components/Reminder.jsx
import React, { useState } from 'react';
import { Trash2, Edit, Clock, Repeat } from 'lucide-react';

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
        <div className="border-b border-gray-200 last:border-b-0 py-4">
            <div className="flex items-center justify-between">
                <button
                    onClick={toggleExpand}
                    className="flex-1 text-left text-lg font-semibold text-gray-800 hover:text-red-600 transition-colors"
                >
                    {reminder.summaryTitle}
                </button>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(reminder)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors transform hover:scale-110"
                        title="리마인더 수정"
                    >
                        <Edit className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(reminder.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors transform hover:scale-110"
                        title="리마인더 삭제"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                    <button
                        onClick={toggleExpand}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                    >
                        {isExpanded ? (
                            <svg className="h-5 w-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        )}
                    </button>
                </div>
            </div>
            {/* Expanded Reminder Details */}
            {isExpanded && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h5 className="font-semibold text-gray-700 mb-2">리마인더 설정 내용:</h5>
                    <p className="text-gray-600 text-sm mb-1">
                        <Clock className="h-4 w-4 inline mr-1 text-blue-500" />
                        알림 시간: {reminder.reminderTime}
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                        <Repeat className="h-4 w-4 inline mr-1 text-purple-500" />
                        반복 주기: {reminder.reminderInterval}
                    </p>

                    <h5 className="font-semibold text-gray-700 mb-2">요약 내용:</h5>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed mb-4">
                        {reminder.summaryContent}
                    </div>

                    <h5 className="font-semibold text-gray-700 mb-2">메모:</h5>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                        {reminder.reminderNotes || '메모 없음'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reminder;
