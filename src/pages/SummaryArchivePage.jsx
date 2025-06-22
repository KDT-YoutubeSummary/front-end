// src/pages/SummaryArchivePage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { summaryArchiveApi, reminderApi, recommendationApi } from '../services/api.jsx';
import SummaryArchive from '../components/SummaryArchive.jsx';
import { BookOpen, Database, Sparkles, Archive, Play } from 'lucide-react';

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

// --- SummaryArchivePage 주 컴포넌트 ---
const SummaryArchivePage = () => {
    // --- 상태(State) 선언 ---
    const [summaryArchives, setSummaryArchives] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTag, setFilterTag] = useState('');
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

    // --- 통계 데이터 조회 함수 ---
    const fetchTagStats = useCallback(async () => {
        try {
            const res = await summaryArchiveApi.getTagStatistics();
            setTagStatsData(res.data.map(item => ({ name: item.tag, value: item.count })));
        } catch (err) { 
            console.error('❌ 태그 통계 조회 실패:', err);
            // 인증 오류 시 로그인 페이지로 리다이렉트
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                window.location.href = '/login';
            }
        }
    }, []);

    // --- 요약 저장소 목록 조회 (검색 및 필터링) ---
    useEffect(() => {
        const fetchArchives = async () => {
            setIsSearching(true);
            try {
                let res;
                if (searchTerm || filterTag) {
                    // 검색 API 사용
                    res = await summaryArchiveApi.searchArchives(searchTerm, filterTag);
                } else {
                    // 전체 조회 API 사용
                    res = await summaryArchiveApi.getArchives();
                }

                console.log('📋 요약 저장소 목록 응답:', res);
                
                const sortedData = (res.data || [])
                    .sort((a, b) => new Date(b.last_viewed_at || b.lastViewedAt || b.saved_at || b.savedAt) - new Date(a.last_viewed_at || a.lastViewedAt || a.saved_at || a.savedAt))
                    .map(item => ({
                        id: item.archive_id || item.summaryArchiveId, // DTO의 @JsonProperty("archive_id")
                        title: item.video_title || item.videoTitle || '제목 없음',
                        hashtags: item.tags || [],
                        date: new Date(item.last_viewed_at || item.lastViewedAt).toLocaleDateString('ko-KR'),
                        userNotes: item.user_notes || item.userNotes || '',
                        thumbnail: getYoutubeThumbnailUrl(getYoutubeIdFromUrl(item.original_url || item.originalUrl)),
                        summary: '상세 정보를 보려면 클릭하세요.',
                        original_url: item.original_url || item.originalUrl,
                    }));
                setSummaryArchives(sortedData);
                fetchTagStats();
            } catch (err) { 
                console.error('❌ 요약 저장소 조회 실패:', err);
                // 인증 오류 시 로그인 페이지로 리다이렉트
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    window.location.href = '/login';
                }
            }
            finally { setIsSearching(false); }
        };
        const handler = setTimeout(fetchArchives, 300);
        return () => clearTimeout(handler);
    }, [searchTerm, filterTag, fetchTagStats]);

    // --- 통계 데이터를 차트용 데이터로 가공 ---
    useEffect(() => {
        if (tagStatsData.length === 0) { setTagChartData([]); return; }
        const totalCount = tagStatsData.reduce((sum, tag) => sum + tag.value, 0);
        if (totalCount === 0) { setTagChartData([]); return; }
        
        // 값 기준으로 정렬
        const sortedData = [...tagStatsData].sort((a, b) => b.value - a.value);
        
        // 1% 미만인 태그들을 기타로 묶기
        const threshold = totalCount * 0.01; // 1%
        const mainTags = [];
        let otherCount = 0;
        
        sortedData.forEach(tag => {
            if (tag.value >= threshold) {
                mainTags.push(tag);
            } else {
                otherCount += tag.value;
            }
        });
        
        // 기타 항목이 있으면 추가
        if (otherCount > 0) {
            mainTags.push({ name: '기타', value: otherCount });
        }
        
        setTagChartData(mainTags);
    }, [tagStatsData]);

    // --- 선택된 ID를 기반으로 실제 아이템 객체를 찾는 파생 상태 ---
    const selectedArchive = useMemo(() => {
        if (!selectedItemId) return null;
        const item = summaryArchives.find(item => item.id === selectedItemId) || null;
        if (item) {
            console.log("Found selected item:", item);
        } else {
            console.warn(`Item with id ${selectedItemId} not found in summaryArchives.`);
        }
        return item;
    }, [selectedItemId, summaryArchives]);

    // --- 상세 정보 조회 로직 (무한 루프 방지) ---
    useEffect(() => {
        const fetchDetailIfNeeded = async () => {
            if (selectedItemId && selectedArchive && selectedArchive.summary === '상세 정보를 보려면 클릭하세요.') {
                console.log(`🔍 상세 조회 시작 - ID: ${selectedItemId}`);
                try {
                    const res = await summaryArchiveApi.getArchiveDetail(selectedItemId);
                    console.log('📋 상세 조회 응답:', res);
                    
                    const detailedData = res.data;
                    console.log('📄 상세 데이터:', detailedData);
                    
                    setSummaryArchives(prevItems =>
                        prevItems.map(item =>
                            item.id === selectedItemId
                                ? { ...item,
                                    summary: detailedData.summary_text || '요약 정보가 없습니다.',
                                    uploader: detailedData.uploader_name || '정보 없음',
                                    views: detailedData.view_count ? detailedData.view_count.toLocaleString() : '정보 없음',
                                    userNotes: detailedData.user_notes || item.userNotes || '',
                                }
                                : item
                        )
                    );
                    console.log('✅ 상세 조회 완료');
                } catch (err) {
                    console.error(`❌ 상세 조회 실패 (ID: ${selectedItemId}):`, err);
                    console.error('에러 상세:', err.response?.data || err.message);
                    
                    let errorMessage = '상세 정보 로딩에 실패했습니다.';
                    if (err.response?.status === 404) {
                        errorMessage = '요청한 요약 저장소를 찾을 수 없습니다.';
                    } else if (err.response?.status === 403) {
                        errorMessage = '해당 요약 저장소에 접근할 권한이 없습니다.';
                    } else if (err.response?.status === 401) {
                        errorMessage = '로그인이 필요합니다.';
                        // 로그인 페이지로 리다이렉트
                        window.location.href = '/login';
                        return;
                    }
                    
                    setMessageModalContent(errorMessage);
                    setShowMessageModal(true);
                    setSelectedItemId(null);
                }
            }
        };
        fetchDetailIfNeeded();
    }, [selectedItemId, selectedArchive]);

    const handleSaveUserNotes = async (itemId, notes) => {
        try {
            await summaryArchiveApi.updateUserNote(itemId, notes);
            setMessageModalContent('메모가 성공적으로 저장되었습니다!');
            setShowMessageModal(true);
            setSummaryArchives(prev => prev.map(item => item.id === itemId ? { ...item, userNotes: notes } : item));
        } catch (err) {
            setMessageModalContent('메모 저장에 실패했습니다.');
            setShowMessageModal(true);
        }
    };

    const handleDeleteArchive = async (itemId) => {
        if (!window.confirm('정말로 이 요약본을 삭제하시겠습니까?')) return;
        try {
            await summaryArchiveApi.deleteArchive(itemId);
            setMessageModalContent('요약본이 성공적으로 삭제되었습니다!');
            setShowMessageModal(true);
            setSummaryArchives(prev => prev.filter(item => item.id !== itemId));
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
            userId: userId, 
            summaryArchiveId: reminderItem.id, // `reminderItem` 객체의 `id`를 사용합니다.
            reminderType: reminderSettings.reminderType,
            reminderMessage: `리마인더: ${reminderItem.title}`,
            reminderTime: `${reminderSettings.date}T${reminderSettings.time}:00`,
            baseDatetimeForRecurrence: `${reminderSettings.date}T${reminderSettings.time}:00`,
            reminderNote: reminderSettings.note, 
            frequencyInterval: reminderSettings.frequencyInterval,
            dayOfWeek: reminderSettings.dayOfWeek, 
            dayOfMonth: reminderSettings.dayOfMonth, 
            isActive: true,
        };

        try {
            // api.jsx에 정의된 함수를 사용하여 일관성 유지
            await reminderApi.createReminder(payload);

            let recommendationMessage = "\n\n하지만 추천 영상 생성에는 실패했습니다.";
            try {
                console.log('🚀 추천 영상 생성 시작 - reminderItem.id:', reminderItem.id);
                
                // api.jsx에 정의된 함수를 사용하여 일관성 유지
                await recommendationApi.generateAiRecommendation(reminderItem.id);
                recommendationMessage = "\n\n또한, 추천 영상이 생성되었습니다.\n'추천 페이지'에서 확인하세요!";
                console.log('✅ 추천 영상 생성 성공');
            } catch (recError) { 
                console.error("❌ 추천 영상 생성 API 호출 실패:", recError);
                console.error("❌ 에러 상세 정보:", {
                    message: recError.message,
                    status: recError.response?.status,
                    statusText: recError.response?.statusText,
                    code: recError.code,
                    isAuthError: recError.isAuthError
                });
                
                // 에러 타입별 상세 처리
                if (recError.isAuthError) {
                    recommendationMessage = "\n\n추천 영상 생성을 위해서는 다시 로그인이 필요합니다.";
                } else if (recError.isNetworkError) {
                    recommendationMessage = "\n\n네트워크 오류로 추천 영상 생성에 실패했습니다.";
                } else if (recError.response?.status === 401) {
                    recommendationMessage = "\n\n인증이 만료되어 추천 영상 생성에 실패했습니다.";
                } else if (recError.response?.status === 403) {
                    recommendationMessage = "\n\n권한이 없어 추천 영상 생성에 실패했습니다.";
                } else if (recError.response?.status === 500) {
                    recommendationMessage = "\n\n서버 내부 오류로 추천 영상 생성에 실패했습니다.\n백엔드 서버 로그를 확인해주세요.";
                } else if (recError.code === 'ERR_NETWORK') {
                    recommendationMessage = "\n\n네트워크 오류로 추천 영상 생성에 실패했습니다.";
                } else if (recError.message && recError.message.includes('서버 내부 오류')) {
                    recommendationMessage = "\n\n서버 내부 오류로 추천 영상 생성에 실패했습니다.\nAI 서비스에 일시적인 문제가 있을 수 있습니다.";
                } else {
                    recommendationMessage = "\n\n추천 영상 생성 중 오류가 발생했습니다.\n나중에 다시 시도해주세요.";
                }
            }

            setMessageModalContent(`리마인더가 성공적으로 설정되었습니다!${recommendationMessage}`);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || '알 수 없는 오류';
            setMessageModalContent(`오류가 발생했습니다: ${errorMessage}`);
        } finally {
            // 로딩 종료 및 상태 초기화
            setIsGenerating(false);
            setReminderItem(null);
            setShowMessageModal(true);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <SummaryArchive
                summaryArchives={summaryArchives}
                selectedArchive={selectedArchive}
                setSelectedArchive={setSelectedItemId} // 목록에서는 ID를, 닫을때는 null을 설정
                handleSaveUserNotes={handleSaveUserNotes}
                handleDeleteArchive={handleDeleteArchive}
                handleSetReminder={handleSetReminder}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterTag={filterTag}
                setFilterTag={setFilterTag}
                isSearching={isSearching}
                tagChartData={tagChartData}
                showTagStats={showTagStats}
                setShowTagStats={setShowTagStats}
                COLORS={COLORS}
            />

            {isGenerating && <LoadingModal message="리마인더 생성 중..." />}

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

export default SummaryArchivePage;
