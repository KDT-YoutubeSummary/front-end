// src/components/ReminderEditModal.jsx
import React, { useState } from 'react';
import { X, Clock, Repeat } from 'lucide-react';

/**
 * Reminder Edit Modal Component
 * Allows users to edit an existing reminder's notes, time, and interval.
 * @param {object} props - Component props.
 * @param {object} props.reminder - The reminder object to edit.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onSave - Function to save the updated reminder.
 * @param {Array<string>} props.reminderTimes - Options for reminder time.
 * @param {Array<string>} props.reminderIntervals - Options for reminder interval.
 */

// TODO: 알림 시간을 얼마 뒤가 아닌, 특정 시간을 지정하도록 변경
const ReminderEditModal = ({ reminder, onClose, onSave, reminderTimes, reminderIntervals }) => {
    const [editNotes, setEditNotes] = useState(reminder.reminderNotes || '');
    const [editTime, setEditTime] = useState(reminder.reminderTime);
    const [editInterval, setEditInterval] = useState(reminder.reminderInterval);

    const handleSave = () => {
        onSave(reminder.id, editNotes, editTime, editInterval);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">리마인더 수정</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-7 w-7" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Clock className="h-4 w-4 inline mr-2 text-blue-500" />
                            알림 시간
                        </label>
                        <select
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                        >
                            {reminderTimes.map((time) => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Repeat className="h-4 w-4 inline mr-2 text-purple-500" />
                            반복 주기
                        </label>
                        <select
                            value={editInterval}
                            onChange={(e) => setEditInterval(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                        >
                            {reminderIntervals.map((interval) => (
                                <option key={interval} value={interval}>{interval}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            메모
                        </label>
                        <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="리마인더에 대한 메모를 추가하세요..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-y min-h-[100px] text-gray-700"
                            rows="4"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-600 transition-colors transform hover:scale-105 shadow-md"
                        >
                            저장
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold hover:bg-gray-300 transition-colors transform hover:scale-105"
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReminderEditModal;
