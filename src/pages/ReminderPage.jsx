import React, { useState, useEffect, useCallback } from 'react';
import Reminder from '../components/Reminder';
import ReminderEditModal from '../components/ReminderEditModal';
import { reminderApi } from '../services/api.jsx';
import { Bell, Clock, Sparkles, Search, Hash, Plus, Calendar } from 'lucide-react';

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
    const [filteredReminders, setFilteredReminders] = useState([]);
    const [showReminderEditModal, setShowReminderEditModal] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- Search States ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTag, setFilterTag] = useState('');

    // --- Constants ---
    const reminderIntervalsOptions = ['반복하지 않음', '1일마다', '3일마다', '1주마다', '1달마다'];

    // 검색 및 필터링 함수
    const filterReminders = useCallback(() => {
        let filtered = reminders;

        // 제목 검색
        if (searchTerm) {
            filtered = filtered.filter(reminder =>
                reminder.summaryTitle.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 태그 필터링 (리마인더의 경우 태그 정보가 제한적이므로 제목에서 검색)
        if (filterTag) {
            filtered = filtered.filter(reminder =>
                reminder.summaryTitle.toLowerCase().includes(filterTag.toLowerCase()) ||
                reminder.summaryContent.toLowerCase().includes(filterTag.toLowerCase())
            );
        }

        setFilteredReminders(filtered);
    }, [reminders, searchTerm, filterTag]);

    // 검색어나 필터가 변경될 때마다 필터링 적용
    useEffect(() => {
        filterReminders();
    }, [filterReminders]);

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
            // setIsLoading(true); // 페이지 로드 시 로딩 모달 제거
            const fetchedReminders = await reminderApi.getUserReminders(userId);
            console.log('로드된 리마인더 데이터:', fetchedReminders);

            // 최신순으로 정렬
            const sortedReminders = fetchedReminders.sort((a, b) => 
                new Date(a.nextNotificationDatetime) - new Date(b.nextNotificationDatetime)
            );

            // 각 리마인더에 대해 라이브러리 정보를 조회하여 영상 제목 가져오기
            const formattedReminders = await Promise.all(
                sortedReminders.map(async (reminder) => {
                    let videoTitle = `리마인더 ${reminder.reminderId}`;
                    let summaryContent = `알림 예정: ${new Date(reminder.nextNotificationDatetime).toLocaleString()}`;
                    let videoMetadata = {
                        thumbnail: null,
                        uploader: '정보 없음',
                        views: '정보 없음',
                        duration: '정보 없음'
                    };
                    
                    try {
                        // summaryArchiveId를 사용해서 요약 저장소 정보 조회
                        const libraryResponse = await fetch(`http://localhost:8080/api/summary-archives/${reminder.summaryArchiveId}`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                            }
                        });
                        
                        if (libraryResponse.ok) {
                            const libraryData = await libraryResponse.json();
                            if (libraryData.data) {
                                // 영상 제목 설정
                                if (libraryData.data.video_title) {
                                    videoTitle = libraryData.data.video_title;
                                }
                                
                                // 요약 내용 설정
                                if (libraryData.data.summary_text) {
                                    summaryContent = libraryData.data.summary_text;
                                }
                                
                                // 유튜브 메타데이터 설정
                                if (libraryData.data.uploader_name) {
                                    videoMetadata.uploader = libraryData.data.uploader_name;
                                }
                                if (libraryData.data.view_count) {
                                    videoMetadata.views = libraryData.data.view_count.toLocaleString();
                                }
                                
                                // 썸네일 URL 생성 (original_url에서 video ID 추출)
                                if (libraryData.data.original_url) {
                                    const videoId = libraryData.data.original_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
                                    if (videoId) {
                                        videoMetadata.thumbnail = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        console.error(`요약 저장소 정보 조회 실패 (ID: ${reminder.summaryArchiveId}):`, error);
                    }

                    return {
                        id: reminder.reminderId,
                        summaryTitle: videoTitle,
                        reminderTime: formatReminderTime(reminder.nextNotificationDatetime),
                        reminderInterval: formatReminderInterval(reminder.reminderType, reminder.frequencyInterval),
                        summaryContent: summaryContent,
                        reminderNotes: reminder.reminderNote || '메모 없음',
                        videoMetadata: videoMetadata
                    };
                })
            );

            setReminders(formattedReminders);
        } catch (error) {
            console.error('리마인더 데이터 로드 오류:', error);
            setMessageModalContent(`리마인더 데이터를 불러오는 중 오류가 발생했습니다: ${error.message}`);
            setShowMessageModal(true);
        } finally {
            // setIsLoading(false); // 페이지 로드 시 로딩 모달 제거
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

    // 컴포넌트 마운트 시 리마인더 데이터 로드
    useEffect(() => {
        if (isLoggedIn && userId) {
            console.log('ReminderPage 마운트됨, 리마인더 API 호출 시작');
            console.log('userId:', userId);
            console.log('isLoggedIn:', isLoggedIn);
            fetchUserReminders();
        }
    }, [isLoggedIn, userId]);

    const handleEditReminder = (reminder) => {
        setEditingReminder(reminder);
        setShowReminderEditModal(true);
    };

    return (
        <div id="reminder-page" className="max-w-6xl mx-auto p-6 space-y-8">
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto text-center animate-fade-in-up">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mx-auto mb-6"></div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">처리 중입니다</h3>
                        <p className="text-gray-600 text-base">잠시만 기다려주세요...</p>
                    </div>
                </div>
            )}

            {reminders.length === 0 && !isLoading ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell className="h-10 w-10 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">첫 번째 리마인더를 설정해보세요!</h3>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed text-base">
                            요약 저장소의 요약본에 리마인더를 설정하여<br />
                            <span className="font-semibold text-blue-600">중요한 내용을 놓치지 않도록</span> 하세요.
                        </p>

                        <div className="flex flex-col gap-4 justify-center items-center">
                            <button
                                onClick={() => window.location.href = '/library'}
                                className="bg-blue-500 text-white py-3 px-8 rounded-lg font-bold hover:bg-blue-600 transition-colors transform hover:scale-105 shadow-md flex items-center space-x-2 text-base"
                            >
                                <Plus className="h-5 w-5" />
                                <span>요약 저장소로 이동</span>
                            </button>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>리마인더 설정</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {reminders.length > 0 && (
                <div className="space-y-6">
                    {/* Search and Filter Inputs */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                type="text"
                                placeholder="요약 제목으로 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 text-base"
                            />
                        </div>
                        <div className="flex-1 relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                type="text"
                                placeholder="태그로 필터링..."
                                value={filterTag}
                                onChange={(e) => setFilterTag(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 text-base"
                            />
                        </div>
                    </div>

                    {/* Loading or No Results Message */}
                    {filteredReminders.length === 0 && (searchTerm || filterTag) ? (
                        <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                            <p className="text-lg font-medium">검색 결과가 없습니다.</p>
                            <p className="text-sm">다른 검색어나 태그를 시도해보세요.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            {filteredReminders.map((reminder) => (
                                <Reminder
                                    key={reminder.id}
                                    reminder={reminder}
                                    onDelete={handleDeleteReminder}
                                    onEdit={handleEditReminder}
                                />
                            ))}
                        </div>
                    )}
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
