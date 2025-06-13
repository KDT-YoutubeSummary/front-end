import React, { useState, useEffect } from 'react';
import Reminder from '../components/Reminder';
import ReminderEditModal from '../components/ReminderEditModal';
import { reminderApi } from '../services/api';

/**
 * Reminder Page Component
 * Displays a list of all set reminders with expand, edit, and delete functionalities.
 * @param {object} props - Component props.
 * @param {string} props.userId - The current user's ID.
 * @param {boolean} props.isLoggedIn - Whether the user is logged in.
 * @param {function} props.setMessageModalContent - Function to set the message modal content.
 * @param {function} props.setShowMessageModal - Function to show the message modal.
 */
const ReminderPage = ({ userId, isLoggedIn, setMessageModalContent, setShowMessageModal }) => {
    // --- Reminder States ---
    const [reminders, setReminders] = useState([]);
    const [showReminderEditModal, setShowReminderEditModal] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- Constants ---
    const reminderTimesOptions = ['30분 후', '1시간 후', '2시간 후', '내일 같은 시간'];
    const reminderIntervalsOptions = ['1일마다', '3일마다', '1주마다', '1달마다'];

    // 리마인더 삭제 핸들러
    const handleDeleteReminder = async (reminderId) => {
        try {
            setIsLoading(true);
            await reminderApi.deleteReminder(reminderId);
            setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
            setMessageModalContent(`리마인더가 성공적으로 삭제되었습니다.`);
        } catch (error) {
            console.error(`리마인더 삭제 오류:`, error);
            setMessageModalContent(`리마인더 삭제 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setShowMessageModal(true);
            setIsLoading(false);
        }
    };

    // 리마인더 수정 핸들러
    const handleUpdateReminder = async (reminderId, notes, time, interval) => {
        try {
            setIsLoading(true);
            const reminderData = {
                reminderNotes: notes,
                reminderTime: time,
                reminderInterval: interval
            };

            const updatedReminder = await reminderApi.updateReminder(reminderId, reminderData);
            setReminders(prev => prev.map(reminder =>
                reminder.id === reminderId ? { ...reminder, ...reminderData } : reminder
            ));
            setMessageModalContent(`리마인더가 성공적으로 수정되었습니다.`);
            setShowReminderEditModal(false);
        } catch (error) {
            console.error(`리마인더 수정 오류:`, error);
            setMessageModalContent(`리마인더 수정 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setShowMessageModal(true);
            setIsLoading(false);
        }
    };

    // 리마인더 데이터 로드
    const fetchUserReminders = async () => {
        if (!userId) return;

        try {
            setIsLoading(true);
            const fetchedReminders = await reminderApi.getUserReminders(userId);
            setReminders(fetchedReminders);
        } catch (error) {
            console.error('리마인더 데이터 로드 오류:', error);
            setMessageModalContent(`리마인더 데이터를 불러오는 중 오류가 발생했습니다: ${error.message}`);
            setShowMessageModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    // 사용자 로그인 시 리마인더 데이터 로드
    useEffect(() => {
        if (isLoggedIn && userId) {
            fetchUserReminders();
        }
    }, [isLoggedIn, userId]);

    // 더미 리마인더 데이터 생성 (테스트용)
    useEffect(() => {
        // 앱 시작 시 더미 리마인더 데이터 생성
        if (reminders.length === 0) {
            const dummyReminders = [
                {
                    id: '1',
                    summaryTitle: '리액트 기초 개념 요약',
                    summaryContent: '리액트는 컴포넌트 기반 UI 라이브러리로 가상 DOM을 활용하여 효율적인 렌더링을 제공합니다.',
                    reminderTime: '1시간 후',
                    reminderInterval: '1일마다',
                    reminderNotes: '컴포넌트 개념과 상태 관리를 중점적으로 복습하기'
                },
                {
                    id: '2',
                    summaryTitle: '타입스크립트 활용법 요약',
                    summaryContent: '타입스크립트는 자바스크립트의 슈퍼셋으로 정적 타입 기능을 제공합니다.',
                    reminderTime: '2시간 후',
                    reminderInterval: '3일마다',
                    reminderNotes: ''
                }
            ];
            setReminders(dummyReminders);
        }
    }, []);

    const handleEditReminder = (reminder) => {
        setEditingReminder(reminder);
        setShowReminderEditModal(true);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto text-center animate-fade-in-up">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mx-auto mb-6"></div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">처리 중입니다</h3>
                        <p className="text-gray-600">잠시만 기다려주세요...</p>
                    </div>
                </div>
            )}

            {reminders.length === 0 ? (
                <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                    <p className="text-lg font-medium">설정된 리마인더가 없습니다.</p>
                    <p className="text-sm">라이브러리에서 요약본에 대한 리마인더를 설정해보세요.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    {reminders.map((reminder) => (
                        <Reminder
                            key={reminder.id}
                            reminder={reminder}
                            onDelete={handleDeleteReminder}
                            onEdit={handleEditReminder}
                        />
                    ))}
                </div>
            )}

            {/* Reminder Edit Modal */}
            {showReminderEditModal && editingReminder && (
                <ReminderEditModal
                    reminder={editingReminder}
                    onClose={() => setShowReminderEditModal(false)}
                    onSave={handleUpdateReminder}
                    reminderTimes={reminderTimesOptions}
                    reminderIntervals={reminderIntervalsOptions}
                />
            )}
        </div>
    );
};

export { ReminderPage, ReminderEditModal };
