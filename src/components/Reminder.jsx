import React from 'react';
import { Bell, Clock, Repeat, Edit, Trash2, X } from 'lucide-react';

// =======================================================================
// 리마인더 페이지 UI 컴포넌트 (Reminder Page Presentation Component)
// =======================================================================
/**
 * 설정된 모든 리마인더 목록을 표시합니다.
 * @param {object} props
 * @param {Array<object>} props.reminders - 리마인더 객체 배열
 * @param {function} props.handleDeleteReminder - 리마인더 삭제 함수
 * @param {function} props.openEditModal - 수정 모달을 여는 함수
 * @param {string|null} props.expandedReminderId - 현재 확장된 리마인더 ID
 * @param {function} props.toggleExpand - 리마인더 확장/축소 토글 함수
 */
export const ReminderList = ({
    reminders,
    handleDeleteReminder,
    openEditModal,
    expandedReminderId,
    toggleExpand
}) => {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">리마인더 페이지</h2>
            {reminders.length === 0 ? (
                <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                    <p className="text-lg font-medium">설정된 리마인더가 없습니다.</p>
                    <p className="text-sm">라이브러리에서 요약본에 대한 리마인더를 설정해보세요.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    {reminders.map((reminder) => (
                        <div key={reminder.id} className="border-b border-gray-200 last:border-b-0 py-4">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => toggleExpand(reminder.id)}
                                    className="flex-1 text-left text-lg font-semibold text-gray-800 hover:text-red-600 transition-colors"
                                >
                                    {reminder.summaryTitle}
                                </button>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => openEditModal(reminder)}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors transform hover:scale-110"
                                        title="리마인더 수정"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteReminder(reminder.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors transform hover:scale-110"
                                        title="리마인더 삭제"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => toggleExpand(reminder.id)}
                                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                                    >
                                        {expandedReminderId === reminder.id ? (
                                            <svg className="h-5 w-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            {expandedReminderId === reminder.id && (
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
                    ))}
                </div>
            )}
        </div>
    );
};

// =======================================================================
// 리마인더 수정 모달 (Reminder Edit Modal)
// =======================================================================
/**
 * 기존 리마인더를 수정합니다.
 * @param {object} props
 * @param {object} props.reminder - 수정할 리마인더 객체
 * @param {function} props.onClose - 모달 닫기 함수
 * @param {function} props.onSave - 리마인더 저장 함수
 * @param {Array<string>} props.reminderTimesOptions - 알림 시간 옵션
 * @param {Array<string>} props.reminderIntervalsOptions - 반복 주기 옵션
 * @param {string} props.editNotes - 수정 중인 메모 내용
 * @param {function} props.setEditNotes - 메모 내용 변경 함수
 * @param {string} props.editTime - 수정 중인 알림 시간
 * @param {function} props.setEditTime - 알림 시간 변경 함수
 * @param {string} props.editInterval - 수정 중인 반복 주기
 * @param {function} props.setEditInterval - 반복 주기 변경 함수
 */
export const ReminderEditModal = ({
    reminder,
    onClose,
    onSave,
    reminderTimesOptions,
    reminderIntervalsOptions,
    editNotes,
    setEditNotes,
    editTime,
    setEditTime,
    editInterval,
    setEditInterval
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">리마인더 수정</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                            {reminderTimesOptions.map((time) => (
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                            {reminderIntervalsOptions.map((interval) => (
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 min-h-[120px]"
                            placeholder="리마인더에 대한 메모를 작성하세요"
                        />
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={() => onSave(reminder.id, editNotes, editTime, editInterval)}
                            className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-600"
                        >
                            저장
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold hover:bg-gray-300"
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// =======================================================================
// 리마인더 설정 모달 (Reminder Settings Modal)
// =======================================================================
/**
 * 새로운 리마인더를 설정합니다. (라이브러리 상세 페이지에서 사용)
 * @param {object} props
 * @param {boolean} props.show - 모달 표시 여부
 * @param {function} props.onClose - 모달 닫기 함수
 * @param {function} props.onSave - 리마인더 설정(저장) 함수
 * @param {string} props.reminderTime - 현재 선택된 알림 시간
 * @param {function} props.setReminderTime - 알림 시간 변경 함수
 * @param {string} props.reminderInterval - 현재 선택된 반복 주기
 * @param {function} props.setReminderInterval - 반복 주기 변경 함수
 * @param {Array<string>} props.reminderTimesOptions - 알림 시간 옵션
 * @param {Array<string>} props.reminderIntervalsOptions - 반복 주기 옵션
 */
export const ReminderSettingsModal = ({
    show,
    onClose,
    onSave,
    reminderTime,
    setReminderTime,
    reminderInterval,
    setReminderInterval,
    reminderTimesOptions,
    reminderIntervalsOptions
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto animate-fade-in-up">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">리마인더 설정</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
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
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                            {reminderTimesOptions.map((time) => (
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
                            value={reminderInterval}
                            onChange={(e) => setReminderInterval(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                            {reminderIntervalsOptions.map((interval) => (
                                <option key={interval} value={interval}>{interval}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={onSave}
                            className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-600"
                        >
                            설정하기
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold hover:bg-gray-300"
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
