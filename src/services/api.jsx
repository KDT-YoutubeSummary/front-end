// src/services/api.jsx
import axios from 'axios';

// API 클라이언트 생성
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인증 토큰 설정 함수
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
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
  uploadVideo: async (originalUrl, userPrompt, summaryType) => {
    try {
      const response = await api.post('/api/youtube/upload', {
        originalUrl,
        userPrompt,
        summaryType
      });
      return response.data;
    } catch (error) {
      console.error('유튜브 영상 업로드 실패:', error);
      throw error;
    }
  }
};

// 인증 관련 API 함수
export const authApi = {
  // 일반 로그인
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
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
      const response = await api.post('/api/reminder', reminderData);
      return response.data;
    } catch (error) {
      console.error('리마인더 생성 실패:', error);
      throw error;
    }
  },

  // 리마인더 상세 조회
  getReminder: async (reminderId) => {
    try {
      const response = await api.get(`/api/reminder/${reminderId}`);
      return response.data;
    } catch (error) {
      console.error(`리마인더(ID: ${reminderId}) 조회 실패:`, error);
      throw error;
    }
  },

  // 사용자의 모든 리마인더 조회
  getUserReminders: async (userId) => {
    try {
      const response = await api.get(`/api/reminder/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`사용자(ID: ${userId})의 리마인더 목록 조회 실패:`, error);
      throw error;
    }
  },

  // 리마인더 수정
  updateReminder: async (reminderId, reminderData) => {
    try {
      const response = await api.put(`/api/reminder/${reminderId}`, reminderData);
      return response.data;
    } catch (error) {
      console.error(`리마인더(ID: ${reminderId}) 수정 실패:`, error);
      throw error;
    }
  },

  // 리마인더 삭제
  deleteReminder: async (reminderId) => {
    try {
      await api.delete(`/api/reminder/${reminderId}`);
      return true;
    } catch (error) {
      console.error(`리마인더(ID: ${reminderId}) 삭제 실패:`, error);
      throw error;
    }
  }
};

// 추천 관련 API 함수
export const recommendationApi = {
  // 추천 생성
  createRecommendation: async (recommendationData) => {
    try {
      const response = await api.post('/api/recommendation', recommendationData);
      return response.data;
    } catch (error) {
      console.error('추천 생성 실패:', error);
      throw error;
    }
  },

  // 사용자의 모든 추천 조회
  getUserRecommendations: async (userId) => {
    try {
      const response = await api.get(`/api/recommendation/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`사용자(ID: ${userId})의 추천 목록 조회 실패:`, error);
      throw error;
    }
  },

  // 추천 삭제
  deleteRecommendation: async (recommendationId) => {
    try {
      await api.delete(`/api/recommendation/${recommendationId}`);
      return true;
    } catch (error) {
      console.error(`추천(ID: ${recommendationId}) 삭제 실패:`, error);
      throw error;
    }
  },

  // AI 추천 생성
  generateAiRecommendation: async (userLibraryId) => {
    try {
      const response = await api.post(`/api/recommendation/ai/${userLibraryId}`);
      return response.data;
    } catch (error) {
      console.error(`라이브러리(ID: ${userLibraryId})에 대한 AI 추천 생성 실패:`, error);
      throw error;
    }
  }
};

export default api;
