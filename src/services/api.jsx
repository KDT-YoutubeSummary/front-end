import api from '../api/axiosInstance';

// 인증 토큰 설정 함수
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// YouTube 메타데이터 관련 API 함수
export const youtubeApi = {
  // 영상 메타데이터 저장
  saveMetadata: async (url) => {
    try {
      const response = await api.post('/api/youtube/save', { url });
      return response.data;
    } catch (error) {
      console.error('영상 메타데이터 저장 실패:', error);
      throw error;
    }
  },

  // 영상 메타데이터 조회
  getMetadata: async (url) => {
    try {
      const response = await api.get('/api/youtube/title', { params: { url } });
      return response.data;
    } catch (error) {
      console.error('영상 메타데이터 조회 실패:', error);
      throw error;
    }
  },

  // 유튜브 영상 업로드 및 요약 요청
  uploadVideo: async (videoUrl, userPrompt, summaryType) => {
    try {
      const requestData = {
        videoUrl: videoUrl,
        userPrompt: userPrompt,
        summaryType: summaryType
      };

      console.log('🚀 최종 API 요청 데이터:', requestData);

      const response = await api.post('/api/youtube/upload', requestData, {
        timeout: 300000, // 5분 타임아웃
      });

      console.log('✅ 유튜브 요약 API 응답:', {
        status: response.status,
        data: response.data
      });

      return response.data;
    } catch (error) {
      console.error('❌ 유튜브 영상 업로드 실패:', error);
      throw error;
    }
  }
};

// 인증 관련 API 함수
export const authApi = {
  // 일반 로그인
  login: async (userName, password) => {
    try {
      const response = await api.post('/api/auth/login', { userName, password });
      return response.data;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  },

  // 회원가입
  register: async (userName, email, password) => {
    try {
      const response = await api.post('/api/auth/register', { userName, email, password });
      return response.data;
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    }
  }
};

// 마이페이지 관련 API 함수
export const myPageApi = {
  // 마이페이지 정보 조회
  getMyPageInfo: async () => {
    try {
      const response = await api.get('/api/mypage');
      return response.data;
    } catch (error) {
      console.error('마이페이지 정보 조회 실패:', error);
      throw error;
    }
  }
};

// 퀴즈 관련 API 함수
export const quizApi = {
  // 퀴즈 생성
  generateQuiz: async (summaryId, count, difficulty) => {
    try {
      const response = await api.post('/api/quizzes/generate', {
        summaryId,
        count,
        difficulty
      });
      return response.data;
    } catch (error) {
      console.error('퀴즈 생성 실패:', error);
      throw error;
    }
  },

  // 퀴즈 제출
  submitQuiz: async (quizId, answers) => {
    try {
      const response = await api.post(`/api/quizzes/${quizId}/submit`, { answers });
      return response.data;
    } catch (error) {
      console.error(`퀴즈(ID: ${quizId}) 제출 실패:`, error);
      throw error;
    }
  }
};

// 리마인더 관련 API 함수
export const reminderApi = {
  // 리마인더 생성
  createReminder: async (reminderData) => {
    try {
      const response = await api.post('/api/reminders', reminderData);
      return response.data;
    } catch (error) {
      console.error('리마인더 생성 실패:', error);
      throw error;
    }
  },

  // 리마인더 상세 조회
  getReminder: async (reminderId) => {
    try {
      const response = await api.get(`/api/reminders/${reminderId}`);
      return response.data;
    } catch (error) {
      console.error(`리마인더(ID: ${reminderId}) 조회 실패:`, error);
      throw error;
    }
  },

  // 사용자의 모든 리마인더 조회
  getUserReminders: async (userId) => {
    try {
      const response = await api.get(`/api/reminders/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`사용자(ID: ${userId})의 리마인더 목록 조회 실패:`, error);
      throw error;
    }
  },

  // 리마인더 수정
  updateReminder: async (reminderId, reminderData) => {
    try {
      const response = await api.put(`/api/reminders/${reminderId}`, reminderData);
      return response.data;
    } catch (error) {
      console.error(`리마인더(ID: ${reminderId}) 수정 실패:`, error);
      throw error;
    }
  },

  // 리마인더 삭제
  deleteReminder: async (reminderId) => {
    try {
      await api.delete(`/api/reminders/${reminderId}`);
      return true;
    } catch (error) {
      console.error(`리마인더(ID: ${reminderId}) 삭제 실패:`, error);
      throw error;
    }
  },

  // 요약 저장소 정보 조회 (리마인더에서 사용)
  getSummaryArchiveForReminder: async (summaryArchiveId) => {
    try {
      const response = await api.get(`/api/summary-archives/${summaryArchiveId}`);
      return response.data;
    } catch (error) {
      console.error(`요약 저장소(ID: ${summaryArchiveId}) 조회 실패:`, error);
      throw error;
    }
  }
};

// 추천 관련 API 함수
export const recommendationApi = {
  // 추천 생성
  createRecommendation: async (recommendationData) => {
    try {
      const response = await api.post('/api/recommendations', recommendationData);
      return response.data;
    } catch (error) {
      console.error('추천 생성 실패:', error);
      throw error;
    }
  },

  // 사용자의 모든 추천 조회
  getUserRecommendations: async (userId) => {
    try {
      console.log('🔍 추천 목록 조회 요청 - userId:', userId);
      console.log('🔍 요청 URL:', `/api/recommendations/${userId}`);
      
      const response = await api.get(`/api/recommendations/${userId}`);
      console.log('🔍 추천 목록 응답 상태:', response.status);
      console.log('🔍 추천 목록 응답 데이터:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`사용자(ID: ${userId})의 추천 목록 조회 실패:`, error);
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        const networkError = new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        networkError.isNetworkError = true;
        throw networkError;
      }
      
      throw error;
    }
  },

  // 추천 삭제
  deleteRecommendation: async (recommendationId) => {
    try {
      await api.delete(`/api/recommendations/${recommendationId}`);
      return true;
    } catch (error) {
      console.error(`추천(ID: ${recommendationId}) 삭제 실패:`, error);
      throw error;
    }
  },

  // AI 추천 생성
  generateAiRecommendation: async (archiveId) => {
    try {
      console.log('🔍 AI 추천 생성 요청 - archiveId:', archiveId);
      
      const response = await api.post(`/api/recommendations/ai/${archiveId}`, {}, {
        timeout: 300000, // 5분 타임아웃
      });
      
      console.log('✅ AI 추천 생성 성공:', response.data);
      return response.data;
      
    } catch (error) {
      console.error(`요약 저장소(ID: ${archiveId})에 대한 AI 추천 생성 실패:`, error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        const authError = new Error('인증이 필요합니다. 다시 로그인해주세요.');
          authError.isAuthError = true;
          throw authError;
      }
      
      if (error.code === 'ERR_NETWORK' || error.name === 'TypeError') {
        const networkError = new Error('네트워크 연결을 확인해주세요.');
        networkError.isNetworkError = true;
        throw networkError;
      }
      
      throw error;
    }
  }
};

// 요약 저장소 관련 API 함수
export const summaryArchiveApi = {
  // 요약 저장소 등록
  saveArchive: async (archiveData) => {
    try {
      const response = await api.post('/api/summary-archives', archiveData);
      return response.data;
    } catch (error) {
      console.error('요약 저장소 등록 실패:', error);
      throw error;
    }
  },

  // 요약 저장소 전체 조회
  getArchives: async () => {
    try {
      console.log('🚀 요약 저장소 전체 조회 API 시작');
      
      const response = await api.get('/api/summary-archives', {
        timeout: 10000, // 10초 타임아웃
      });
      
      console.log('✅ 요약 저장소 조회 성공:', {
        status: response.status,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'null',
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ 요약 저장소 조회 실패:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        const networkError = new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        networkError.isNetworkError = true;
        throw networkError;
      }
      
      throw error;
    }
  },

  // 요약 저장소 상세 조회
  getArchiveDetail: async (archiveId) => {
    try {
      const response = await api.get(`/api/summary-archives/${archiveId}`);
      return response.data;
    } catch (error) {
      console.error(`요약 저장소(ID: ${archiveId}) 상세 조회 실패:`, error);
      throw error;
    }
  },

  // 요약 저장소 삭제
  deleteArchive: async (archiveId) => {
    try {
      await api.delete(`/api/summary-archives/${archiveId}`);
      return true;
    } catch (error) {
      console.error(`요약 저장소(ID: ${archiveId}) 삭제 실패:`, error);
      throw error;
    }
  },

  // 요약 저장소 검색
  searchArchives: async (keyword) => {
    try {
      const response = await api.get('/api/summary-archives/search', { 
        params: { keyword } 
      });
      return response.data;
    } catch (error) {
      console.error('요약 저장소 검색 실패:', error);
      throw error;
    }
  },

  // 태그 통계 조회
  getTagStatistics: async () => {
    try {
      const response = await api.get('/api/summary-archives/stat/tags');
      return response.data;
    } catch (error) {
      console.error('태그 통계 조회 실패:', error);
      throw error;
    }
  },

  // 사용자 메모 업데이트
  updateUserNote: async (summaryArchiveId, note) => {
    try {
      const response = await api.patch('/api/summary-archives/notes', {
        summaryArchiveId,
        note
      });
      return response.data;
    } catch (error) {
      console.error('사용자 메모 업데이트 실패:', error);
      throw error;
    }
  }
};