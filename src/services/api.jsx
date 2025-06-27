// src/services/api.jsx
import axios from 'axios';

axios.defaults.baseURL = '/';

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// 유튜브 ID 추출 함수
const extractYoutubeId = (url) => {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : null;
};

export const youtubeApi = {
  saveMetadata: async (url) => {
    try {
      const response = await axios.post(`/api/youtube/save`, { url });
      return response.data;
    } catch (error) {
      console.error('영상 메타데이터 저장 실패:', error);
      throw error;
    }
  },
  getMetadata: async (url) => {
    try {
      const response = await axios.get(`/api/youtube/title`, { params: { url } });
      return response.data;
    } catch (error) {
      console.error('영상 메타데이터 조회 실패:', error);
      throw error;
    }
  },
  uploadVideo: async (originalUrl, userPrompt, summaryType) => {
    try {
      const videoUrl = originalUrl;
      const youtubeId = extractYoutubeId(originalUrl);
      if (!youtubeId) throw new Error('유효한 YouTube ID를 추출할 수 없습니다.');

      const requestData = { originalUrl, videoUrl, youtubeId, userPrompt, summaryType };
      const response = await axios.post(`/api/youtube/upload`, requestData, {
        timeout: 300000,
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('유튜브 영상 업로드 실패:', error);
      throw error;
    }
  }
};

export const authApi = {
  login: async (userName, password) => {
    try {
      const response = await axios.post(`/api/auth/login`, { userName, password });
      return response.data;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  },
  register: async (userName, email, password) => {
    try {
      const response = await axios.post(`/api/auth/register`, { userName, email, password });
      return response.data;
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    }
  }
};

export const myPageApi = {
  getMyPageInfo: async () => {
    try {
      const response = await axios.get(`/api/mypage`);
      return response.data;
    } catch (error) {
      console.error('마이페이지 정보 조회 실패:', error);
      throw error;
    }
  }
};

export const quizApi = {
  generateQuiz: async (summaryId, count, difficulty) => {
    try {
      const response = await axios.post(`/api/quizzes/generate`, { summaryId, count, difficulty });
      return response.data;
    } catch (error) {
      console.error('퀴즈 생성 실패:', error);
      throw error;
    }
  },
  submitQuiz: async (quizId, answers) => {
    try {
      const response = await axios.post(`/api/quizzes/${quizId}/submit`, { answers });
      return response.data;
    } catch (error) {
      console.error(`퀴즈(ID: ${quizId}) 제출 실패:`, error);
      throw error;
    }
  }
};
