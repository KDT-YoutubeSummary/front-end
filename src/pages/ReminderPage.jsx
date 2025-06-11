import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ReminderList, ReminderEditModal, ReminderSettingsModal } from '../components/Reminder';

/**
 * =======================================================================
 * 통합 가이드 (Integration Guide)
 * =======================================================================
 * * 이 파일의 컴포넌트들을 메인 애플리케이션(LearnClipApp)에 통합하려면
 * 아래와 같은 상태(State)와 함수(Functions)를 LearnClipApp에서 관리하고
 * 이 컴포넌트들에 props로 전달해야 합니다.
 * * --- 필요한 상태 (Required State in Parent Component) ---
 * * // 리마인더 데이터
 * const [reminders, setReminders] = useState([]);
 * * // 리마인더 생성/수정 모달 관련
 * const [showReminderModal, setShowReminderModal] = useState(false);
 * const [showReminderEditModal, setShowReminderEditModal] = useState(false);
 * const [editingReminder, setEditingReminder] = useState(null);
 * * // 리마인더 설정 값
 * const [reminderTime, setReminderTime] = useState('1시간 후');
 * const [reminderInterval, setReminderInterval] = useState('1일마다');
 * * // 현재 라이브러리에서 선택된 아이템
 * const [selectedLibraryItem, setSelectedLibraryItem] = useState(null);
 * * --- 필요한 상수 (Required Constants in Parent Component) ---
 * * const reminderTimesOptions = ['30분 후', '1시간 후', '2시간 후', '내일 같은 시간'];
 * const reminderIntervalsOptions = ['1일마다', '3일마다', '1주마다', '1달마다'];
 * * * --- 필요한 함수 (Required Functions in Parent Component) ---
 * * // API 연동 리마인더 데이터 가져오기 (useEffect 사용)
 * useEffect(() => {
 * if (!isAuthReady || !userId) return;
 * const fetchReminders = async () => {
 *   try {
 *     const response = await axios.get(`/api/reminder/user/${userId}`);
 *     setReminders(response.data);
 *   } catch (error) {
 *     console.error('리마인더 데이터 가져오기 실패:', error);
 *   }
 * };
 * fetchReminders();
 * }, [isAuthReady, userId]);
 *
 * * // 리마인더 추가
 * const handleAddReminder = async (summaryItem) => {
 *   try {
 *     const newReminder = {
 *       userId,
 *       summaryTitle: summaryItem.title,
 *       summaryContent: summaryItem.summary,
 *       reminderTime,
 *       reminderInterval,
 *       reminderNotes: ''
 *     };
 *     const response = await axios.post('/api/reminder', newReminder);
 *     setReminders(prev => [...prev, response.data]);
 *   } catch (error) {
 *     console.error('리마인더 추가 실패:', error);
 *   }
 * };
 *
 * * // 리마인더 삭제
 * const handleDeleteReminder = async (reminderId) => {
 *   try {
 *     await axios.delete(`/api/reminder/${reminderId}`);
 *     setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
 *   } catch (error) {
 *     console.error('리마인더 삭제 실패:', error);
 *   }
 * };
 *
 * * // 리마인더 수정
 * const handleUpdateReminder = async (reminderId, newNotes, newTime, newInterval) => {
 *   try {
 *     const updatedData = {
 *       reminderNotes: newNotes,
 *       reminderTime: newTime,
 *       reminderInterval: newInterval
 *     };
 *     const response = await axios.put(`/api/reminder/${reminderId}`, updatedData);
 *     setReminders(prev => prev.map(reminder =>
 *       reminder.id === reminderId ? response.data : reminder
 *     ));
 *   } catch (error) {
 *     console.error('리마인더 수정 실패:', error);
 *   }
 * };
 * */

// API 엔드포인트 상수
const API_ENDPOINTS = {
  BASE: '/api/reminder',
  GET_USER_REMINDERS: (userId) => `/api/reminder/user/${userId}`,
  GET_REMINDER: (reminderId) => `/api/reminder/${reminderId}`,
  UPDATE_REMINDER: (reminderId) => `/api/reminder/${reminderId}`,
  DELETE_REMINDER: (reminderId) => `/api/reminder/${reminderId}`
};

// =======================================================================
// 리마인더 페이지 컨테이너 컴포넌트 (Reminder Page Container Component)
// =======================================================================
export const ReminderPage = () => {
    // 상태 관리
    const [reminders, setReminders] = useState([]);
    const [expandedReminderId, setExpandedReminderId] = useState(null);
    const [showReminderEditModal, setShowReminderEditModal] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [editNotes, setEditNotes] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editInterval, setEditInterval] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 설정 옵션 상수
    const reminderTimesOptions = ['30분 후', '1시간 후', '2시간 후', '내일 같은 시간'];
    const reminderIntervalsOptions = ['1일마다', '3일마다', '1주마다', '1달마다'];

    // 현재 사용자 ID (실제 앱에서는 Auth 컨텍스트에서 가져와야 함)
    const userId = 'mock-user-id-123'; // 임시 사용자 ID

    // 리마인더 데이터 가져오기
    useEffect(() => {
        const fetchReminders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(API_ENDPOINTS.GET_USER_REMINDERS(userId));
                setReminders(response.data);
            } catch (error) {
                console.error('리마인더 데이터 가져오기 실패:', error);
                setError('리마인더를 불러오는 중 오류가 발생했습니다.');
                // 개발 환경에서는 더미 데이터 사용
                if (process.env.NODE_ENV === 'development') {
                    const dummyData = [
                        {
                            id: '1',
                            summaryTitle: '자바스크립트 비동기 프로그래밍',
                            summaryContent: '비동기 프로그래밍은 작업이 완료될 때까지 기다리지 않고 다른 작업을 수행할 수 있게 해줍니다. 프로미스와 async/await을 사용하여 비동기 코드를 더 읽기 쉽게 만들 수 있습니다.',
                            reminderTime: '1시간 후',
                            reminderInterval: '1일마다',
                            reminderNotes: '프로미스 체이닝과 에러 핸들링에 대해 더 공부하기'
                        },
                        {
                            id: '2',
                            summaryTitle: 'React Hooks 기초',
                            summaryContent: 'React Hooks는 함수형 컴포넌트에서 상태와 생명주기 기능을 사용할 수 있게 해주는 기능입니다. useState, useEffect, useContext 등이 있습니다.',
                            reminderTime: '2시간 후',
                            reminderInterval: '3일마다',
                            reminderNotes: 'useCallback과 useMemo에 대해 더 알아보기'
                        }
                    ];
                    setReminders(dummyData);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchReminders();
    }, [userId]);

    // 단일 리마인더 상세 정보 가져오기
    const fetchReminderDetail = async (reminderId) => {
        try {
            const response = await axios.get(API_ENDPOINTS.GET_REMINDER(reminderId));
            return response.data;
        } catch (error) {
            console.error(`리마인더 ID ${reminderId} 상세 정보 가져오기 실패:`, error);
            return null;
        }
    };

    // 리마인더 토글 핸들러
    const toggleExpand = (id) => {
        if (expandedReminderId === id) {
            setExpandedReminderId(null);
        } else {
            setExpandedReminderId(id);
            // 선택적으로 상세 정보를 가져올 수 있음
            // fetchReminderDetail(id);
        }
    };

    // 수정 모달 열기 핸들러
    const openEditModal = (reminder) => {
        setEditingReminder(reminder);
        setEditNotes(reminder.reminderNotes || '');
        setEditTime(reminder.reminderTime);
        setEditInterval(reminder.reminderInterval);
        setShowReminderEditModal(true);
    };

    // 수정 모달 닫기 핸들러
    const closeEditModal = () => {
        setShowReminderEditModal(false);
        setEditingReminder(null);
    };

    // 리마인더 삭제 핸들러
    const handleDeleteReminder = async (reminderId) => {
        try {
            await axios.delete(API_ENDPOINTS.DELETE_REMINDER(reminderId));
            setReminders(prevReminders => prevReminders.filter(reminder => reminder.id !== reminderId));
        } catch (error) {
            console.error('리마인더 삭제 실패:', error);
            alert('리마인더 삭제 중 오류가 발생했습니다.');
        }
    };

    // 리마인더 업데이트 핸들러
    const handleUpdateReminder = async (reminderId, newNotes, newTime, newInterval) => {
        try {
            const updatedData = {
                reminderNotes: newNotes,
                reminderTime: newTime,
                reminderInterval: newInterval
            };
            const response = await axios.put(API_ENDPOINTS.UPDATE_REMINDER(reminderId), updatedData);

            setReminders(prevReminders =>
                prevReminders.map(reminder =>
                    reminder.id === reminderId ? response.data : reminder
                )
            );
            closeEditModal();
        } catch (error) {
            console.error('리마인더 수정 실패:', error);
            alert('리마인더 수정 중 오류가 발생했습니다.');
        }
    };

    // 새 리마인더 생성 핸들러 (다른 컴포넌트에서 사용 가능)
    const createReminder = async (reminderData) => {
        try {
            const response = await axios.post(API_ENDPOINTS.BASE, {
                ...reminderData,
                userId
            });
            setReminders(prevReminders => [...prevReminders, response.data]);
            return response.data;
        } catch (error) {
            console.error('리마인더 생성 실패:', error);
            alert('리마인더 생성 중 오류가 발생했습니다.');
            return null;
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>;
    }

    if (error) {
        return <div className="text-center text-red-500 p-4">{error}</div>;
    }

    return (
        <>
            <ReminderList
                reminders={reminders}
                handleDeleteReminder={handleDeleteReminder}
                openEditModal={openEditModal}
                expandedReminderId={expandedReminderId}
                toggleExpand={toggleExpand}
            />

            {showReminderEditModal && editingReminder && (
                <ReminderEditModal
                    reminder={editingReminder}
                    onClose={closeEditModal}
                    onSave={handleUpdateReminder}
                    reminderTimesOptions={reminderTimesOptions}
                    reminderIntervalsOptions={reminderIntervalsOptions}
                    editNotes={editNotes}
                    setEditNotes={setEditNotes}
                    editTime={editTime}
                    setEditTime={setEditTime}
                    editInterval={editInterval}
                    setEditInterval={setEditInterval}
                />
            )}
        </>
    );
};
