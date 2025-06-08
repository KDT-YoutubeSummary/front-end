// src/pages/LibraryPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UserLibrary from '../../../WebstormProjects/untitled2/components/UserLibrary.jsx';

// --- 헬퍼 함수: 유튜브 썸네일 URL 생성 ---
const getYoutubeThumbnailUrl = (youtubeId) => {
    if (!youtubeId) return 'https://placehold.co/128x80/e2e8f0/64748b?text=No+Image';
    return `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`;
};

// 임시 MessageModal (App.jsx에 이미 정의되어 있다면 제거해도 됩니다)
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


const LibraryPage = () => {
    // --- Library Page States ---
    const [libraryItems, setLibraryItems] = useState([]);
    const [selectedLibraryItem, setSelectedLibraryItem] = useState(null);
    const [librarySearchTerm, setLibrarySearchTerm] = useState('');
    const [libraryFilterTag, setLibraryFilterTag] = useState('');
    const [showTagStats, setShowTagStats] = useState(false);
    const [isSearching, setIsSearching] = useState(false); // 검색 로딩 상태
    const [showMessageModal, setShowMessageModal] = useState(false); // 페이지 레벨 메시지 모달
    const [messageModalContent, setMessageModalContent] = useState('');
    const [tagStatsData, setTagStatsData] = useState([]); // 태그 통계 데이터를 저장할 상태

    // 태그 통계 계산은 이제 API에서 받아온 tagStatsData를 사용합니다.
    // 기존의 libraryItems 기반 통계 로직은 필요 없습니다.
    const tagChartData = tagStatsData.map(stat => ({
        name: stat.tag,
        value: stat.count
    }));

    const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98FB98', '#DA70D6', '#FFD700', '#ADD8E6'];


    // --- 라이브러리 아이템 조회 (검색 및 필터링 포함) useEffect ---
    useEffect(() => {
        const fetchLibraryItems = async () => {
            setIsSearching(true);
            try {
                let url = 'http://localhost:8080/api/library';

                if (librarySearchTerm || libraryFilterTag) {
                    url = 'http://localhost:8080/api/library/search';
                    const params = new URLSearchParams();
                    if (librarySearchTerm) {
                        params.append('title', librarySearchTerm);
                    }
                    if (libraryFilterTag) {
                        params.append('tags', libraryFilterTag);
                    }
                    url += `?${params.toString()}`;
                }

                const res = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });

                setLibraryItems(
                    res.data.data.map(item => ({
                        id: item.library_id,
                        title: item.video_title,
                        hashtags: item.tags,
                        date: new Date(item.saved_at).toLocaleDateString('ko-KR'),
                        userNotes: item.user_notes,
                        thumbnail: 'https://placehold.co/128x80/e2e8f0/64748b?text=No+Image', // 상세 조회 시 업데이트될 것
                        uploader: '알 수 없음',
                        views: 'N/A',
                        summary: '요약 내용을 불러오는 중...',
                        original_url: '',
                        youtube_id: '',
                    }))
                );
            } catch (err) {
                console.error('❌ 라이브러리 검색/조회 실패:', err);
                setLibraryItems([]);
            } finally {
                setIsSearching(false);
            }
        };

        const handler = setTimeout(() => {
            fetchLibraryItems();
        }, 300);

        return () => {
            clearTimeout(handler);
        };

    }, [librarySearchTerm, libraryFilterTag]);

    // --- 태그 통계 조회 useEffect ---
    useEffect(() => {
        const fetchTagStats = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/library/stat/tags', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
                console.log('📊 태그 통계 데이터:', res.data.data);
                setTagStatsData(res.data.data);
            } catch (err) {
                console.error('❌ 태그 통계 불러오기 실패:', err);
                setMessageModalContent('태그 통계를 불러오는 중 문제가 발생했습니다.');
                setShowMessageModal(true);
                setTagStatsData([]);
            }
        };

        // LibraryPage가 로드될 때 (또는 필요시 libraryItems가 변경될 때) 태그 통계 불러오기
        fetchTagStats();
    }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 실행 (혹은 라이브러리 목록 변경시 다시 불러올 수도 있습니다. [libraryItems])


    // --- 상세 라이브러리 아이템 조회 useEffect (클릭 시 상세 정보 로드) ---
    useEffect(() => {
        const fetchLibraryDetail = async () => {
            if (typeof selectedLibraryItem !== 'number') {
                return;
            }

            try {
                const res = await axios.get(`http://localhost:8080/api/library/${selectedLibraryItem}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });

                const detailedItem = res.data.data;
                console.log('🔍 상세 조회 응답 데이터:', detailedItem);

                setLibraryItems(prevItems =>
                    prevItems.map(item =>
                        item.id === detailedItem.library_id
                            ? {
                                ...item,
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
                            }
                            : item
                    )
                );

                setSelectedLibraryItem({
                    id: detailedItem.library_id,
                    title: detailedItem.video_title,
                    summary: detailedItem.summary_text,
                    hashtags: detailedItem.tags,
                    thumbnail: getYoutubeThumbnailUrl(detailedItem.youtube_id),
                    uploader: detailedItem.uploader_name,
                    views: detailedItem.view_count,
                    date: new Date(detailedItem.saved_at).toLocaleDateString('ko-KR'),
                    userNotes: detailedItem.user_notes,
                    original_url: detailedItem.original_url,
                    youtube_id: detailedItem.youtube_id,
                });

            } catch (err) {
                console.error(`❌ 라이브러리 상세 조회 실패 (ID: ${selectedLibraryItem}):`, err);
                setMessageModalContent('라이브러리 상세 정보를 불러오는 중 문제가 발생했습니다.');
                setShowMessageModal(true);
                setSelectedLibraryItem(null);
            }
        };

        if (typeof selectedLibraryItem === 'number') {
            fetchLibraryDetail();
        }
    }, [selectedLibraryItem, getYoutubeThumbnailUrl]);


    // --- 핸들러 함수들 (LibraryPage에서 직접 관리) ---

    // 사용자 메모 추가/수정
    // 사용자 메모 추가/수정
    const handleSaveUserNotes = async (itemId, notes) => {
        const userId = localStorage.getItem('userId') || 3; // 로그인된 사용자 ID를 사용해야 합니다.

        try {
            const res = await axios.patch('http://localhost:8080/api/library/note', {
                user_id: userId,
                user_library_id: itemId,
                user_notes: notes,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
            });

            // --- 이 부분을 수정합니다! ---
            // 백엔드가 성공 시 JSON 대신 문자열만 반환한다고 가정
            // HTTP 상태 코드만으로 성공 여부를 판단합니다.
            if (res.status === 200) { // HTTP 상태 코드가 200 (OK)인지 확인
                // 백엔드에서 반환하는 문자열 메시지를 직접 사용하거나, 고정 메시지를 사용합니다.
                // res.data는 "메모가 성공적으로 업데이트되었습니다." 와 같은 문자열일 것입니다.
                setMessageModalContent(res.data || '메모가 성공적으로 저장되었습니다!'); // res.data 사용 또는 고정 메시지
                setShowMessageModal(true);

                // 상태 업데이트 로직은 그대로 유지
                setLibraryItems(prevItems =>
                    prevItems.map(item => item.id === itemId ? { ...item, userNotes: notes } : item)
                );
                if (selectedLibraryItem && selectedLibraryItem.id === itemId) {
                    setSelectedLibraryItem(prev => ({ ...prev, userNotes: notes }));
                }
            } else {
                // 200 OK가 아닌 다른 HTTP 상태 코드를 받았을 때
                // 백엔드가 JSON을 보내지 않으므로, HTTP 상태 코드와 텍스트를 사용합니다.
                setMessageModalContent(`메모 저장 실패: ${res.status} ${res.statusText}`);
                setShowMessageModal(true);
            }
        } catch (err) {
            console.error('❌ 메모 저장 실패:', err);

            // 오류 메시지 처리 강화 (이전과 동일)
            let errorMessage = '알 수 없는 오류가 발생했습니다.';

            if (err.response) {
                if (err.response.data) { // err.response.data가 문자열일 수도 있으므로, 객체 여부 확인 없이 사용
                    // 백엔드가 오류 시에도 문자열 메시지만 보낼 수 있음
                    errorMessage = err.response.data; // 예: "인증 실패"
                } else if (err.response.status) {
                    errorMessage = `서버 응답 오류: ${err.response.status} (${err.response.statusText})`;
                }
            } else if (err.request) {
                errorMessage = '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.';
            } else {
                errorMessage = `요청 처리 중 오류 발생: ${err.message}`;
            }

            setMessageModalContent(`메모 저장 실패: ${errorMessage}`);
            setShowMessageModal(true);
        }
    };

    // 아이템 삭제
    const handleDeleteLibraryItem = async (itemId) => {
        if (!window.confirm('정말로 이 요약본을 삭제하시겠습니까?')) {
            return;
        }

        try {
            const res = await axios.delete(`http://localhost:8080/api/library/${itemId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (res.data.code === 200) {
                setMessageModalContent('요약본이 성공적으로 삭제되었습니다!');
                setShowMessageModal(true);
                // libraryItems에서 삭제된 아이템 제거
                setLibraryItems(prev => prev.filter(item => item.id !== itemId));
                setSelectedLibraryItem(null); // 삭제 후 상세 화면 닫기
            } else {
                setMessageModalContent(`삭제 실패: ${res.data.message}`);
                setShowMessageModal(true);
            }
        } catch (err) {
            console.error('❌ 요약본 삭제 실패:', err);
            setMessageModalContent(`요약본 삭제 중 오류가 발생했습니다: ${err.response?.data?.message || err.message}`);
            setShowMessageModal(true);
        }
    };

    const handleSetReminder = () => {
        setMessageModalContent('리마인더 설정 모달 (실제 구현 필요)');
        setShowMessageModal(true);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <UserLibrary
                libraryItems={libraryItems}
                selectedLibraryItem={
                    typeof selectedLibraryItem === 'object' && selectedLibraryItem !== null
                        ? selectedLibraryItem
                        : (typeof selectedLibraryItem === 'number'
                            ? libraryItems.find(item => item.id === selectedLibraryItem)
                            : null)
                }
                setSelectedLibraryItem={setSelectedLibraryItem}
                handleSaveUserNotes={handleSaveUserNotes}
                handleDeleteLibraryItem={handleDeleteLibraryItem}
                handleSetReminder={handleSetReminder}
                librarySearchTerm={librarySearchTerm}
                setLibrarySearchTerm={setLibrarySearchTerm}
                libraryFilterTag={libraryFilterTag}
                setLibraryFilterTag={setLibraryFilterTag}
                tagChartData={tagChartData} // 이제 API에서 가져온 tagStatsData를 기반으로 한 tagChartData 전달
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
        </div>
    );
};

export default LibraryPage;