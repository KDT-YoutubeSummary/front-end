// src/pages/LibraryPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UserLibrary from '../components/UserLibrary.jsx';

// --- 헬퍼 함수 ---
const getYoutubeIdFromUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^&\n?#]+)/);
    return (match && match[1]) ? match[1] : null;
};

const getYoutubeThumbnailUrl = (youtubeId) => {
    if (!youtubeId) return 'https://placehold.co/128x80/e2e8f0/64748b?text=No+Image';
    return `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`;
};

// --- 메시지 모달 ---
const MessageModal = ({ message, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-auto text-center animate-fade-in-up">
                <h3 className="text-xl font-bold text-gray-800 mb-4">알림</h3>
                <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full bg-red-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-600 transition-colors transform hover:scale-105 shadow-md"
                >
                    확인
                </button>
            </div>
        </div>
    );
};

// --- ✨✨✨ 반복 설정 기능이 완벽히 구현된 리마인더 모달 ✨✨✨ ---
const ReminderModal = ({ isOpen, onClose, onSave, itemTitle }) => {
    // 기본 정보
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [note, setNote] = useState('');

    // 반복 설정 정보
    const [reminderType, setReminderType] = useState('ONE_TIME');
    const [interval, setInterval] = useState(1);
    const [dayOfWeek, setDayOfWeek] = useState(1); // 1: 월요일
    const [dayOfMonth, setDayOfMonth] = useState(1); // 1: 1일

    const getTodayString = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    // 모달이 열릴 때 오늘 날짜와 현재 시간으로 기본값 설정
    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const hh = String(now.getHours()).padStart(2, '0');
            const min = String(now.getMinutes()).padStart(2, '0');
            setDate(`${yyyy}-${mm}-${dd}`);
            setTime(`${hh}:${min}`);
        }
    }, [isOpen]);

    const handleSave = () => {
        if (!date || !time) {
            alert('리마인더의 기준이 될 날짜와 시간을 먼저 설정해주세요.');
            return;
        }

        // 사용자가 설정한 모든 값을 객체로 묶어 onSave 함수로 전달
        const reminderSettings = {
            date,
            time,
            note,
            reminderType,
            // '반복 안함'일 경우, 반복 관련 값들은 null로 보냄
            frequencyInterval: reminderType !== 'ONE_TIME' ? Number(interval) || 1 : null,
            dayOfWeek: reminderType === 'WEEKLY' ? Number(dayOfWeek) : null,
            dayOfMonth: reminderType === 'MONTHLY' ? Number(dayOfMonth) : null,
        };

        onSave(reminderSettings);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-auto text-left animate-fade-in-up">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">리마인더 설정</h3>
                <p className="text-gray-600 mb-6 break-words">
                    <span className="font-semibold">{itemTitle}</span> 영상에 대한 리마인더를 설정합니다.
                </p>

                <div className="space-y-4">
                    {/* 날짜 및 시간 입력 (기본) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="reminder-date" className="block text-sm font-medium text-gray-700 mb-1">기준 날짜</label>
                            <input type="date" id="reminder-date" value={date} min={getTodayString()} onChange={(e) => setDate(e.target.value)} className="w-full input-style"/>
                        </div>
                        <div>
                            <label htmlFor="reminder-time" className="block text-sm font-medium text-gray-700 mb-1">기준 시간</label>
                            <input type="time" id="reminder-time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full input-style"/>
                        </div>
                    </div>

                    <hr className="my-4"/>

                    {/* 반복 설정 */}
                    <div>
                        <label htmlFor="reminder-type" className="block text-sm font-medium text-gray-700 mb-1">반복</label>
                        <select id="reminder-type" value={reminderType} onChange={(e) => setReminderType(e.target.value)} className="w-full input-style">
                            <option value="ONE_TIME">반복하지 않음</option>
                            <option value="DAILY">일마다</option>
                            <option value="WEEKLY">주마다</option>
                            <option value="MONTHLY">달마다</option>
                        </select>
                    </div>

                    {/* 조건부 반복 설정 필드 */}
                    {reminderType === 'DAILY' && (
                        <div className="p-4 bg-gray-50 rounded-lg animate-fade-in">
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-700">매</span>
                                <input type="number" min="1" value={interval} onChange={(e) => setInterval(e.target.value)} className="w-20 input-style text-center"/>
                                <span className="text-gray-700">일 마다 반복</span>
                            </div>
                        </div>
                    )}
                    {reminderType === 'WEEKLY' && (
                        <div className="p-4 bg-gray-50 rounded-lg animate-fade-in">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                                <span className="text-gray-700">매</span>
                                <input type="number" min="1" value={interval} onChange={(e) => setInterval(e.target.value)} className="w-20 input-style text-center"/>
                                <span className="text-gray-700">주</span>
                                <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="input-style">
                                    <option value="1">월요일</option>
                                    <option value="2">화요일</option>
                                    <option value="3">수요일</option>
                                    <option value="4">목요일</option>
                                    <option value="5">금요일</option>
                                    <option value="6">토요일</option>
                                    <option value="7">일요일</option>
                                </select>
                                <span className="text-gray-700">마다 반복</span>
                            </div>
                        </div>
                    )}
                    {reminderType === 'MONTHLY' && (
                        <div className="p-4 bg-gray-50 rounded-lg animate-fade-in">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                                <span className="text-gray-700">매</span>
                                <input type="number" min="1" value={interval} onChange={(e) => setInterval(e.target.value)} className="w-20 input-style text-center"/>
                                <span className="text-gray-700">달</span>
                                <select value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} className="input-style">
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                        <option key={day} value={day}>{day}일</option>
                                    ))}
                                </select>
                                <span className="text-gray-700">마다 반복</span>
                            </div>
                        </div>
                    )}

                    <hr className="my-4"/>

                    {/* 메모 입력 */}
                    <div>
                        <label htmlFor="reminder-note" className="block text-sm font-medium text-gray-700 mb-1">메모 (선택)</label>
                        <textarea id="reminder-note" rows="3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="리마인더와 함께 받을 간단한 메모를 남겨보세요." className="w-full input-style resize-none"></textarea>
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                    <button onClick={onClose} className="btn-secondary">취소</button>
                    <button onClick={handleSave} className="btn-primary">저장</button>
                </div>
            </div>
            {/* 간단한 스타일링을 위한 CSS */}
            <style>{`
                .input-style { padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; transition: all 0.2s; }
                .input-style:focus { ring-color: #ef4444; border-color: #ef4444; outline: none; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.5); }
                .btn-primary { padding: 0.6rem 1.25rem; background-color: #ef4444; color: white; border-radius: 0.5rem; font-weight: bold; transition: background-color 0.2s; }
                .btn-primary:hover { background-color: #dc2626; }
                .btn-secondary { padding: 0.6rem 1.25rem; background-color: #e5e7eb; color: #374151; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; }
                .btn-secondary:hover { background-color: #d1d5db; }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};


const LibraryPage = () => {
    // 모든 상태와 함수는 이전과 동일
    const [libraryItems, setLibraryItems] = useState([]);
    const [selectedLibraryItem, setSelectedLibraryItem] = useState(null);
    const [librarySearchTerm, setLibrarySearchTerm] = useState('');
    const [libraryFilterTag, setLibraryFilterTag] = useState('');
    const [showTagStats, setShowTagStats] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageModalContent, setMessageModalContent] = useState('');
    const [tagStatsData, setTagStatsData] = useState([]);
    const [tagChartData, setTagChartData] = useState([]);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [reminderItem, setReminderItem] = useState(null);

    const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98FB98', '#DA70D6', '#FFD700', '#ADD8E6'];

    // 라이브러리 조회, 통계 등 다른 useEffect 및 함수들은 동일
    useEffect(() => {
        const fetchLibraryItems = async () => {
            setIsSearching(true);
            try {
                let url = 'http://localhost:8080/api/library';

                if (librarySearchTerm || libraryFilterTag) {
                    url = 'http://localhost:8080/api/library/search';
                    const params = new URLSearchParams();
                    if (librarySearchTerm) params.append('title', librarySearchTerm);
                    if (libraryFilterTag) params.append('tags', libraryFilterTag);
                    url += `?${params.toString()}`;
                }

                const res = await axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });

                setLibraryItems(
                    res.data.data.map(item => ({
                        id: item.library_id,
                        title: item.video_title,
                        hashtags: item.tags,
                        date: new Date(item.saved_at).toLocaleDateString('ko-KR'),
                        userNotes: item.user_notes,
                        thumbnail: getYoutubeThumbnailUrl(getYoutubeIdFromUrl(item.original_url)),
                        uploader: '알 수 없음',
                        views: 'N/A',
                        summary: '요약 내용을 불러오는 중...',
                        original_url: item.original_url,
                        youtube_id: getYoutubeIdFromUrl(item.original_url),
                    }))
                );
            } catch (err) {
                console.error('❌ 라이브러리 검색/조회 실패:', err);
                setLibraryItems([]);
            } finally {
                setIsSearching(false);
            }
        };

        const handler = setTimeout(fetchLibraryItems, 300);
        return () => clearTimeout(handler);

    }, [librarySearchTerm, libraryFilterTag]);

    const fetchTagStats = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/library/stat/tags', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
            setTagStatsData(res.data.data.map(item => ({ name: item.tag, value: item.count })));
        } catch (err) {
            console.error('❌ 태그 통계 불러오기 실패:', err);
        }
    }, []);

    useEffect(() => {
        fetchTagStats();
    }, [fetchTagStats]);

    useEffect(() => {
        if (tagStatsData.length === 0) {
            setTagChartData([]);
            return;
        }
        const totalCount = tagStatsData.reduce((sum, tag) => sum + tag.value, 0);
        let otherSum = 0;
        let processedChartData = [];
        tagStatsData.forEach(tag => {
            if (tag.value / totalCount < 0.03) {
                otherSum += tag.value;
            } else {
                processedChartData.push(tag);
            }
        });
        processedChartData.sort((a, b) => b.value - a.value);
        if (otherSum > 0) {
            processedChartData.push({ name: '기타', value: otherSum });
        }
        setTagChartData(processedChartData);
    }, [tagStatsData]);

    useEffect(() => {
        const fetchLibraryDetail = async () => {
            if (typeof selectedLibraryItem !== 'number') return;
            try {
                const res = await axios.get(`http://localhost:8080/api/library/${selectedLibraryItem}`, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
                const detailedItem = res.data.data;
                const fullDetailedItem = {
                    id: detailedItem.library_id,
                    summary: detailedItem.summary_text,
                    thumbnail: getYoutubeThumbnailUrl(detailedItem.youtube_id),
                    uploader: detailedItem.uploader_name,
                    views: detailedItem.view_count,
                    original_url: detailedItem.original_url,
                    userNotes: detailedItem.user_notes,
                    hashtags: detailedItem.tags,
                    title: detailedItem.video_title,
                    youtube_id: detailedItem.youtube_id,
                    date: new Date(detailedItem.saved_at).toLocaleDateString('ko-KR'),
                };
                setLibraryItems(prev => prev.map(item => item.id === detailedItem.library_id ? { ...item, ...fullDetailedItem } : item));
                setSelectedLibraryItem(fullDetailedItem);
            } catch (err) {
                console.error(`❌ 라이브러리 상세 조회 실패:`, err);
                setMessageModalContent('상세 정보 로딩에 실패했습니다.');
                setShowMessageModal(true);
                setSelectedLibraryItem(null);
            }
        };
        if (typeof selectedLibraryItem === 'number') fetchLibraryDetail();
    }, [selectedLibraryItem]);

    const handleSaveUserNotes = async (itemId, notes) => {
        try {
            await axios.patch('http://localhost:8080/api/library/note', { user_library_id: itemId, user_notes: notes }, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
            setMessageModalContent('메모가 성공적으로 저장되었습니다!');
            setShowMessageModal(true);
            setLibraryItems(prev => prev.map(item => item.id === itemId ? { ...item, userNotes: notes } : item));
            if (selectedLibraryItem && selectedLibraryItem.id === itemId) {
                setSelectedLibraryItem(prev => ({ ...prev, userNotes: notes }));
            }
        } catch (err) {
            console.error('❌ 메모 저장 실패:', err);
            setMessageModalContent('메모 저장에 실패했습니다.');
            setShowMessageModal(true);
        }
    };

    const handleDeleteLibraryItem = async (itemId) => {
        if (!window.confirm('정말로 이 요약본을 삭제하시겠습니까?')) return;
        try {
            await axios.delete(`http://localhost:8080/api/library/${itemId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
            setMessageModalContent('요약본이 성공적으로 삭제되었습니다!');
            setShowMessageModal(true);
            setLibraryItems(prev => prev.filter(item => item.id !== itemId));
            setSelectedLibraryItem(null);
            fetchTagStats();
        } catch (err) {
            console.error('❌ 요약본 삭제 실패:', err);
            setMessageModalContent('삭제 중 오류가 발생했습니다.');
            setShowMessageModal(true);
        }
    };

    const handleSetReminder = (item) => {
        if (!item || typeof item !== 'object') {
            setMessageModalContent("리마인더를 설정할 아이템 정보가 올바르지 않습니다.");
            setShowMessageModal(true);
            return;
        }
        setReminderItem(item);
        setIsReminderModalOpen(true);
    };

    // ✨✨✨ 최종 리마인더 저장 핸들러 ✨✨✨
    const handleSaveReminder = async (reminderSettings) => {
        if (!reminderItem) return;

        const userId = parseInt(localStorage.getItem('userId'), 10);
        if (!userId) {
            setMessageModalContent('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
            setShowMessageModal(true);
            return;
        }

        // 백엔드 DTO에 맞게 최종 payload 구성
        const payload = {
            userId: userId,
            userLibraryId: reminderItem.id,
            reminderType: reminderSettings.reminderType,
            baseDatetimeForRecurrence: `${reminderSettings.date}T${reminderSettings.time}:00`,
            reminderNote: reminderSettings.note,
            frequencyInterval: reminderSettings.frequencyInterval,
            dayOfWeek: reminderSettings.dayOfWeek,
            dayOfMonth: reminderSettings.dayOfMonth,
            isActive: true,
        };

        console.log('⏰ 리마인더 생성 요청 Payload:', payload);

        try {
            const response = await axios.post('http://localhost:8080/api/reminder', payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200 || response.status === 201) {
                setMessageModalContent('리마인더가 성공적으로 설정되었습니다!');
            } else {
                setMessageModalContent(`리마인더 설정에 실패했습니다: ${response.data?.message || '알 수 없는 오류'}`);
            }
        } catch (err) {
            console.error('❌ 리마인더 설정 실패:', err);
            setMessageModalContent(`리마인더 설정 중 오류가 발생했습니다: ${err.response?.data?.message || err.message}`);
        } finally {
            setShowMessageModal(true);
            setIsReminderModalOpen(false);
            setReminderItem(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <UserLibrary
                libraryItems={libraryItems}
                selectedLibraryItem={selectedLibraryItem}
                setSelectedLibraryItem={setSelectedLibraryItem}
                handleSaveUserNotes={handleSaveUserNotes}
                handleDeleteLibraryItem={handleDeleteLibraryItem}
                handleSetReminder={handleSetReminder}
                librarySearchTerm={librarySearchTerm}
                setLibrarySearchTerm={setLibrarySearchTerm}
                libraryFilterTag={libraryFilterTag}
                setLibraryFilterTag={setLibraryFilterTag}
                tagChartData={tagChartData}
                showTagStats={showTagStats}
                setShowTagStats={setShowTagStats}
                COLORS={COLORS}
                isSearching={isSearching}
            />

            {showMessageModal && (
                <MessageModal
                    message={messageModalContent}
                    onClose={() => setShowMessageModal(false)}
                />
            )}

            {isReminderModalOpen && reminderItem && (
                <ReminderModal
                    isOpen={isReminderModalOpen}
                    onClose={() => setIsReminderModalOpen(false)}
                    onSave={handleSaveReminder}
                    itemTitle={reminderItem.title}
                />
            )}
            <style>{`.animate-fade-in-up{animation:fade-in-up .4s ease-out forwards}@keyframes fade-in-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
    );
};

export default LibraryPage;
