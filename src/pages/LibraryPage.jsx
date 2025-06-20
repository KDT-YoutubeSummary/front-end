import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import UserLibrary from '../components/UserLibrary.jsx';
import { BookOpen, Database, Sparkles, Library, Play } from 'lucide-react';

// --- 헬퍼 함수: 유튜브 ID 추출 ---
const getYoutubeIdFromUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^&\n?#]+)/);
    return (match && match[1]) ? match[1] : null;
};

// --- 헬퍼 함수: 유튜브 썸네일 URL 생성 ---
const getYoutubeThumbnailUrl = (youtubeId) => {
    if (!youtubeId) return 'https://placehold.co/128x80/e2e8f0/64748b?text=No+Image';
    return `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`;
};

// --- 메시지 모달 컴포넌트 ---
const MessageModal = ({ message, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-auto text-center animate-fade-in-up">
                <h3 className="text-xl font-bold text-gray-800 mb-4">알림</h3>
                <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full bg-red-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-600 transition-colors"
                >
                    확인
                </button>
            </div>
        </div>
    );
};

// --- 로딩 모달 컴포넌트 ---
const LoadingModal = ({ message }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-auto text-center animate-fade-in-up">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-500 mx-auto mb-6"></div>
                <h3 className="text-lg font-semibold text-gray-800">{message}</h3>
                <p className="text-gray-500 text-sm mt-2">잠시만 기다려주세요...</p>
            </div>
        </div>
    );
};

// --- 리마인더 설정 모달 컴포넌트 ---
const ReminderModal = ({ isOpen, onClose, onSave, itemTitle, onShowError }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [note, setNote] = useState('');
    const [reminderType, setReminderType] = useState('ONE_TIME');
    const [interval, setInterval] = useState(1);
    const [dayOfWeek, setDayOfWeek] = useState(1);
    const [dayOfMonth, setDayOfMonth] = useState(1);

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setDate(`${year}-${month}-${day}`);
            setTime(`${hours}:${minutes}`);
        }
    }, [isOpen]);

    const handleSave = () => {
        if (!date || !time) {
            onShowError('리마인더의 기준이 될 날짜와 시간을 먼저 설정해주세요.');
            return;
        }
        const reminderSettings = {
            date, time, note, reminderType,
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
                <p className="text-gray-600 mb-6 break-words"><span className="font-semibold">{itemTitle}</span> 영상에 대한 리마인더를 설정합니다.</p>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label htmlFor="reminder-date" className="block text-sm font-medium text-gray-700 mb-1">기준 날짜</label><input type="date" id="reminder-date" value={date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border rounded-lg"/></div>
                        <div><label htmlFor="reminder-time" className="block text-sm font-medium text-gray-700 mb-1">기준 시간</label><input type="time" id="reminder-time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-2 border rounded-lg"/></div>
                    </div><hr/><label htmlFor="reminder-type" className="block text-sm font-medium">반복</label><select id="reminder-type" value={reminderType} onChange={(e) => setReminderType(e.target.value)} className="w-full p-2 border rounded-lg"><option value="ONE_TIME">반복하지 않음</option><option value="DAILY">일마다</option><option value="WEEKLY">주마다</option><option value="MONTHLY">달마다</option></select>
                    {reminderType === 'DAILY' && <div className="p-2 bg-gray-50 rounded-lg flex items-center space-x-2"><span>매</span><input type="number" min="1" value={interval} onChange={e=>setInterval(e.target.value)} className="w-20 p-1 border rounded text-center"/><span>일 마다</span></div>}
                    {reminderType === 'WEEKLY' && <div className="p-2 bg-gray-50 rounded-lg flex items-center space-x-2"><span>매</span><input type="number" min="1" value={interval} onChange={e=>setInterval(e.target.value)} className="w-20 p-1 border rounded text-center"/><span>주</span><select value={dayOfWeek} onChange={e=>setDayOfWeek(e.target.value)} className="p-1 border rounded"><option value="1">월요일</option><option value="2">화요일</option><option value="3">수요일</option><option value="4">목요일</option><option value="5">금요일</option><option value="6">토요일</option><option value="7">일요일</option></select><span>마다</span></div>}
                    {reminderType === 'MONTHLY' && <div className="p-2 bg-gray-50 rounded-lg flex items-center space-x-2"><span>매</span><input type="number" min="1" value={interval} onChange={e=>setInterval(e.target.value)} className="w-20 p-1 border rounded text-center"/><span>달</span><select value={dayOfMonth} onChange={e=>setDayOfMonth(e.target.value)} className="p-1 border rounded">{Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>{d}일</option>)}</select><span>마다</span></div>}
                    <hr/><label htmlFor="reminder-note" className="block text-sm font-medium">메모 (선택)</label><textarea id="reminder-note" rows="3" value={note} onChange={e=>setNote(e.target.value)} placeholder="리마인더 메모를 남겨보세요." className="w-full p-2 border rounded-lg"></textarea>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                    <button onClick={onClose} className="py-2 px-5 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">취소</button>
                    <button onClick={handleSave} className="py-2 px-5 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600">저장</button>
                </div>
            </div>
        </div>
    );
};

// --- LibraryPage 주 컴포넌트 ---
const LibraryPage = () => {
    // --- 상태(State) 선언 ---
    const [libraryItems, setLibraryItems] = useState([]);
    const [librarySearchTerm, setLibrarySearchTerm] = useState('');
    const [libraryFilterTag, setLibraryFilterTag] = useState('');
    const [isSearching, setIsSearching] = useState(true);
    const [selectedItemId, setSelectedItemId] = useState(null); // ID만 저장

    // 모달 및 기타 상태
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageModalContent, setMessageModalContent] = useState('');
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [reminderItem, setReminderItem] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // 통계 관련 상태
    const [tagStatsData, setTagStatsData] = useState([]);
    const [tagChartData, setTagChartData] = useState([]);
    const [showTagStats, setShowTagStats] = useState(false);
    const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98FB98', '#DA70D6', '#FFD700'];

    const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });

    // --- 통계 데이터 조회 함수 ---
    const fetchTagStats = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/libraries/stat/tags', getAuthHeader());
            setTagStatsData(res.data.data.map(item => ({ name: item.tag, value: item.count })));
        } catch (err) { console.error('❌ 태그 통계 조회 실패:', err); }
    }, []);

    // --- 라이브러리 목록 조회 (검색 및 필터링) ---
    useEffect(() => {
        const fetchLibraryItems = async () => {
            setIsSearching(true);
            try {
                let url = 'http://localhost:8080/api/libraries';
                const params = new URLSearchParams();
                if (librarySearchTerm) params.append('title', librarySearchTerm);
                if (libraryFilterTag) params.append('tags', libraryFilterTag);
                if (params.toString()) url = `http://localhost:8080/api/library/search?${params.toString()}`;

                const res = await axios.get(url, getAuthHeader());
                setLibraryItems(res.data.data.map(item => ({
                    id: item.library_id,
                    title: item.video_title,
                    hashtags: item.tags,
                    date: new Date(item.saved_at).toLocaleDateString('ko-KR'),
                    userNotes: item.user_notes,
                    thumbnail: getYoutubeThumbnailUrl(getYoutubeIdFromUrl(item.original_url)),
                    uploader: '정보 없음',
                    views: '정보 없음',
                    summary: '상세 정보를 보려면 클릭하세요.',
                    original_url: item.original_url,
                })));
                fetchTagStats();
            } catch (err) { console.error('❌ 라이브러리 조회 실패:', err); }
            finally { setIsSearching(false); }
        };
        const handler = setTimeout(fetchLibraryItems, 300);
        return () => clearTimeout(handler);
    }, [librarySearchTerm, libraryFilterTag, fetchTagStats]);

    // --- 통계 데이터를 차트용 데이터로 가공 ---
    useEffect(() => {
        if (tagStatsData.length === 0) { setTagChartData([]); return; }
        const totalCount = tagStatsData.reduce((sum, tag) => sum + tag.value, 0);
        if (totalCount === 0) { setTagChartData([]); return; }
        let otherSum = 0;
        let processedChartData = [];
        tagStatsData.forEach(tag => {
            if ((tag.value / totalCount) < 0.05) otherSum += tag.value;
            else processedChartData.push(tag);
        });
        processedChartData.sort((a, b) => b.value - a.value);
        if (otherSum > 0) processedChartData.push({ name: '기타', value: otherSum });
        setTagChartData(processedChartData);
    }, [tagStatsData]);

    // --- 선택된 ID를 기반으로 실제 아이템 객체를 찾는 파생 상태 ---
    const selectedLibraryItem = useMemo(() => {
        if (!selectedItemId) return null;
        return libraryItems.find(item => item.id === selectedItemId) || null;
    }, [selectedItemId, libraryItems]);

    // --- 상세 정보 조회 로직 (무한 루프 방지) ---
    useEffect(() => {
        const fetchDetailIfNeeded = async () => {
            if (selectedItemId && selectedLibraryItem && selectedLibraryItem.summary === '상세 정보를 보려면 클릭하세요.') {
                try {
                    const res = await axios.get(`http://localhost:8080/api/libraries/${selectedItemId}`, getAuthHeader());
                    const detailedData = res.data.data;
                    setLibraryItems(prevItems =>
                        prevItems.map(item =>
                            item.id === selectedItemId
                                ? { ...item,
                                    summary: detailedData.summary_text,
                                    uploader: detailedData.uploader_name,
                                    views: detailedData.view_count,
                                }
                                : item
                        )
                    );
                } catch (err) {
                    console.error(`❌ 상세 조회 실패 (ID: ${selectedItemId}):`, err);
                    setMessageModalContent('상세 정보 로딩에 실패했습니다.');
                    setShowMessageModal(true);
                    setSelectedItemId(null);
                }
            }
        };
        fetchDetailIfNeeded();
    }, [selectedItemId, selectedLibraryItem]);

    const handleSaveUserNotes = async (itemId, notes) => {
        try {
            await axios.patch('http://localhost:8080/api/libraries/notes', { user_library_id: itemId, user_notes: notes }, getAuthHeader());
            setMessageModalContent('메모가 성공적으로 저장되었습니다!');
            setShowMessageModal(true);
            setLibraryItems(prev => prev.map(item => item.id === itemId ? { ...item, userNotes: notes } : item));
        } catch (err) {
            setMessageModalContent('메모 저장에 실패했습니다.');
            setShowMessageModal(true);
        }
    };

    const handleDeleteLibraryItem = async (itemId) => {
        if (!window.confirm('정말로 이 요약본을 삭제하시겠습니까?')) return;
        try {
            await axios.delete(`http://localhost:8080/api/libraries/${itemId}`, getAuthHeader());
            setMessageModalContent('요약본이 성공적으로 삭제되었습니다!');
            setShowMessageModal(true);
            setLibraryItems(prev => prev.filter(item => item.id !== itemId));
            setSelectedItemId(null); // 삭제 후 상세 보기 창 닫기
            fetchTagStats(); // 삭제 후 통계 다시 불러오기
        } catch (err) {
            setMessageModalContent('삭제 중 오류가 발생했습니다.');
            setShowMessageModal(true);
        }
    };

    const handleSetReminder = (item) => {
        setReminderItem(item);
        setIsReminderModalOpen(true);
    };

    const handleSaveReminder = async (reminderSettings) => {
        if (!reminderItem) return;
        
        // 모달 닫기 및 로딩 시작
        setIsReminderModalOpen(false);
        setIsGenerating(true);

        const userId = parseInt(localStorage.getItem('userId'), 10);
        if (!userId) {
            setMessageModalContent('사용자 정보를 찾을 수 없습니다.');
            setShowMessageModal(true);
            setIsGenerating(false); // 로딩 종료
            return;
        }

        const payload = {
            userId: userId, userLibraryId: reminderItem.id, reminderType: reminderSettings.reminderType,
            baseDatetimeForRecurrence: `${reminderSettings.date}T${reminderSettings.time}:00`,
            reminderNote: reminderSettings.note, frequencyInterval: reminderSettings.frequencyInterval,
            dayOfWeek: reminderSettings.dayOfWeek, dayOfMonth: reminderSettings.dayOfMonth, isActive: true,
        };

        try {
            await axios.post('http://localhost:8080/api/reminders', payload, getAuthHeader());

            let recommendationMessage = "\n\n하지만 추천 영상 생성에는 실패했습니다.";
            try {
                await axios.post(`http://localhost:8080/api/recommendations/ai/${reminderItem.id}`, {}, getAuthHeader());
                recommendationMessage = "\n\n또한, 5개의 추천 영상이 생성되었습니다.\n'추천 페이지'에서 확인하세요!";
            } catch (recError) { 
                console.error("❌ 추천 영상 생성 API 호출 실패:", recError); 
            }

            setMessageModalContent(`리마인더가 성공적으로 설정되었습니다!${recommendationMessage}`);
        } catch (err) {
            setMessageModalContent(`오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
        } finally {
            // 로딩 종료 및 상태 초기화
            setIsGenerating(false);
            setReminderItem(null);
            setShowMessageModal(true);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <UserLibrary
                libraryItems={libraryItems}
                selectedLibraryItem={selectedLibraryItem}
                setSelectedLibraryItem={setSelectedItemId} // 목록에서는 ID를, 닫을때는 null을 설정
                handleSaveUserNotes={handleSaveUserNotes}
                handleDeleteLibraryItem={handleDeleteLibraryItem}
                handleSetReminder={handleSetReminder}
                librarySearchTerm={librarySearchTerm}
                setLibrarySearchTerm={setLibrarySearchTerm}
                libraryFilterTag={libraryFilterTag}
                setLibraryFilterTag={setLibraryFilterTag}
                isSearching={isSearching}
                tagChartData={tagChartData}
                showTagStats={showTagStats}
                setShowTagStats={setShowTagStats}
                COLORS={COLORS}
            />

            {isGenerating && <LoadingModal message="리마인더 저장 & 추천 영상 생성 중..." />}

            {showMessageModal && (<MessageModal message={messageModalContent} onClose={() => setShowMessageModal(false)} />)}
            {isReminderModalOpen && reminderItem && (
                <ReminderModal 
                    isOpen={isReminderModalOpen} 
                    onClose={() => setIsReminderModalOpen(false)} 
                    onSave={handleSaveReminder} 
                    itemTitle={reminderItem.title}
                    onShowError={(message) => {
                        setMessageModalContent(message);
                        setShowMessageModal(true);
                    }}
                />
            )}
        </div>
    );
};

export default LibraryPage;
