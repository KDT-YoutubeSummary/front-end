import React, { useState, useEffect } from 'react';
import Reminder from '../components/Reminder';
import ReminderEditModal from '../components/ReminderEditModal';
import { reminderApi } from '../services/api.jsx';

// 확인된 문제 : 리마인더에 데이터가 호출되지 않는 문제
//               콘솔에는 별 다른 출력이 없어서 디버깅이 힘듬

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
    const [isVisible, setIsVisible] = useState(false);
    const [isDataFetched, setIsDataFetched] = useState(false);

    // --- Constants ---
    const reminderIntervalsOptions = ['반복하지 않음', '1일마다', '3일마다', '1주마다', '1달마다'];

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
    const handleUpdateReminder = async (reminderId, notes, dateTime, interval) => {
        try {
            setIsLoading(true);

            // 주기 설정에 따른 값 변환
            let reminderType = 'ONE_TIME';
            let frequencyInterval = 1;

            // reminderInterval 값에 따라 타입과 간격 설정
            if (interval === '반복하지 않음') {
                reminderType = 'ONE_TIME';
                frequencyInterval = 1;
            } else if (interval.includes('일마다')) {
                reminderType = 'DAILY';
                frequencyInterval = parseInt(interval);
            } else if (interval.includes('주마다')) {
                reminderType = 'WEEKLY';
                frequencyInterval = parseInt(interval);
            } else if (interval.includes('달마다')) {
                reminderType = 'MONTHLY';
                frequencyInterval = parseInt(interval);
            }

            // datetime-local 입력값을 Date 객체로 변환
            const baseDatetime = new Date(dateTime);

            // API 요청 데이터 형식으로 변환
            const reminderData = {
                reminderType: reminderType,
                frequencyInterval: frequencyInterval,
                baseDatetimeForRecurrence: baseDatetime.toISOString(),
                reminderNote: notes,
                isActive: true
            };

            console.log('수정 API 요청 데이터:', reminderData);

            const updatedReminder = await reminderApi.updateReminder(reminderId, reminderData);
            console.log('수정 API 응답:', updatedReminder);

            // UI 업데이트를 위한 데이터 형식 변환
            setReminders(prev => prev.map(reminder =>
                reminder.id === reminderId ? {
                    ...reminder,
                    reminderNotes: notes,
                    reminderTime: formatReminderTime(baseDatetime.toISOString()),
                    reminderInterval: interval
                } : reminder
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
            console.log('로드된 리마인더 데이터:', fetchedReminders);

            // API 데이터를 컴포넌트에 맞게 변환
            const formattedReminders = fetchedReminders.map(reminder => ({
                id: reminder.reminderId,
                summaryTitle: `리마인더 ${reminder.reminderId}`,
                reminderTime: formatReminderTime(reminder.nextNotificationDatetime),
                reminderInterval: formatReminderInterval(reminder.reminderType, reminder.frequencyInterval),
                summaryContent: `알림 예정: ${new Date(reminder.nextNotificationDatetime).toLocaleString()}`,
                reminderNotes: reminder.reminderNote || '메모 없음'
            }));

            setReminders(formattedReminders);
        } catch (error) {
            console.error('리마인더 데이터 로드 오류:', error);
            setMessageModalContent(`리마인더 데이터를 불러오는 중 오류가 발생했습니다: ${error.message}`);
            setShowMessageModal(true);
        } finally {
            setIsLoading(false);
            setIsDataFetched(true);
        }
    };

    // 리마인더 시간 포맷팅 함수
    const formatReminderTime = (dateTimeStr) => {
        if (!dateTimeStr) return '시간 정보 없음';

        const reminderDate = new Date(dateTimeStr);
        const now = new Date();
        const diffMinutes = Math.floor((reminderDate - now) / (1000 * 60));

        if (diffMinutes < 0) {
            return '지난 알림';
        } else if (diffMinutes < 60) {
            return `${diffMinutes}분 후`;
        } else if (diffMinutes < 60 * 24) {
            return `${Math.floor(diffMinutes / 60)}시간 후`;
        } else {
            return reminderDate.toLocaleDateString() + ' ' + reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    // 리마인더 주기 포맷팅 함수
    const formatReminderInterval = (reminderType, interval) => {
        if (reminderType === 'ONE_TIME') {
            return '반복하지 않음';
        } else if (reminderType === 'DAILY') {
            return `${interval}일마다`;
        } else if (reminderType === 'WEEKLY') {
            return `${interval}주마다`;
        } else if (reminderType === 'MONTHLY') {
            return `${interval}개월마다`;
        } else {
            return '알 수 없는 주기';
        }
    };

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
        const currentElement = document.getElementById('reminder-page');
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, []);

    // 컴포넌트가 화면에 표시될 때 리마인더 데이터 다시 로드
    useEffect(() => {
        if (isVisible && isLoggedIn && userId && !isDataFetched) {
            console.log('컴포넌트가 화면에 표시됨, 리마인더 API 호출 시작');
            fetchUserReminders();
        }
    }, [isVisible, isLoggedIn, userId, isDataFetched]);

    const handleEditReminder = (reminder) => {
        setEditingReminder(reminder);
        setShowReminderEditModal(true);
    };

    return (
        <div id="reminder-page" className="max-w-4xl mx-auto space-y-6">
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto text-center animate-fade-in-up">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mx-auto mb-6"></div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">처리 중입니다</h3>
                        <p className="text-gray-600">잠시만 기다려주세요...</p>
                    </div>
                </div>
            )}

            {reminders.length === 0 && isDataFetched ? (
                <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                    <p className="text-lg font-medium">설정된 리마인더가 없습니다.</p>
                    <p className="text-sm">라이브러리에서 요약본에 대한 리마인더를 설정해보세요.</p>
                </div>
            ) : null}

            {!isLoading && !isDataFetched && (
                <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                    <p className="text-lg font-medium">리마인더 데이터를 로드하는 중입니다...</p>
                </div>
            )}

            {reminders.length > 0 && (
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
                    reminderIntervals={reminderIntervalsOptions}
                />
            )}
        </div>
    );
};

export { ReminderPage };
