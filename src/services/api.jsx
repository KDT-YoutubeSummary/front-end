// src/services/api.jsx
import axios from 'axios'; // App.jsx에서 인터셉터가 설정된 전역 axios 인스턴스를 가져옵니다.

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '/'; // 환경변수를 사용하여 기본 URL 설정

// API 클라이언트 생성 부분을 삭제하거나,
// api 변수를 전역 axios 인스턴스로 바로 사용합니다.
// const api = axios.create({ // 이 부분을 주석 처리하거나 삭제합니다.
//   baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// 이제 api 변수는 전역 axios 인스턴스를 가리키도록 합니다.
// 필요하다면 baseURL을 설정할 수 있지만, 인터셉터는 전역에 이미 설정되어 있습니다.
// 모든 API 호출이 이 'axios' 인스턴스를 사용하도록 합니다.

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://52.78.6.200';

// 인증 토큰 설정 함수는 그대로 유지하되, 이 함수가 전역 'axios'의 기본 헤더를 설정하도록 합니다.
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // 'api' 대신 'axios' 사용
  } else {
    delete axios.defaults.headers.common['Authorization']; // 'api' 대신 'axios' 사용
  }
};

// YouTube 메타데이터 관련 API 함수
export const youtubeApi = {
  // 영상 메타데이터 저장
  saveMetadata: async (url) => {
    try {
      const response = await axios.post(`/api/youtube/save`, { url }); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error('영상 메타데이터 저장 실패:', error);
      throw error;
    }
  },

  // 영상 메타데이터 조회
  getMetadata: async (url) => {
    try {
      const response = await axios.get(`/api/youtube/title`, { params: { url } }); // 'api' 대신 'axios' 사용
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
        videoUrl: videoUrl, // 명시적으로 videoUrl 필드 사용
        userPrompt: userPrompt,
        summaryType: summaryType
      };

      console.log('🚀 최종 API 요청 데이터:', requestData);

      const response = await axios.post(`/api/youtube/upload`, requestData, {
        timeout: 300000, // 5분 타임아웃
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ 유튜브 요약 API 응답:', {
        status: response.status,
        data: response.data
      });

      // 응답 데이터가 예상 구조인지 검증
      if (!response.data) {
        console.warn('⚠️ 응답 데이터가 없습니다');
        throw new Error('서버에서 응답 데이터를 받지 못했습니다');
      }

      return response.data;
    } catch (error) {
      console.error('❌ 유튜브 영상 업로드 실패:', error);
      
      // 자세한 에러 정보 로깅
      if (error.response) {
        console.error('에러 응답 데이터:', error.response.data);
        console.error('에러 상태 코드:', error.response.status);
      } else if (error.request) {
        console.error('요청이 전송되었지만 응답을 받지 못함:', error.request);
      } else {
        console.error('요청 설정 중 오류:', error.message);
      }
      
      throw error;
    }
  }
};

// 인증 관련 API 함수
export const authApi = {
  // 일반 로그인
  login: async (userName, password) => { // ✅ 수정: email -> userName으로 변경 (App.jsx와 일관성)
    try {
      // ✅ 수정: 'email' 대신 'userName' 사용
      const response = await axios.post(`/api/auth/login`, { userName, password }); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  },

  // 회원가입
  register: async (userName, email, password) => {
    try {
      const response = await axios.post(`/api/auth/register`, { userName, email, password }); // 'api' 대신 'axios' 사용
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
      const response = await axios.get(`/api/mypage`); // 'api' 대신 'axios' 사용
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
      const response = await axios.post(`/api/quizzes/generate`, { // 'api' 대신 'axios' 사용
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
      const response = await axios.post(`/api/quizzes/${quizId}/submit`, { answers }); // 'api' 대신 'axios' 사용
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
      const response = await axios.post(`/api/reminders`, reminderData); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error('리마인더 생성 실패:', error);
      throw error;
    }
  },

  // 리마인더 상세 조회
  getReminder: async (reminderId) => {
    try {
      const response = await axios.get(`/api/reminders/${reminderId}`); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error(`리마인더(ID: ${reminderId}) 조회 실패:`, error);
      throw error;
    }
  },

  // 사용자의 모든 리마인더 조회
  getUserReminders: async (userId) => {
    try {
      const response = await axios.get(`/api/reminders/user/${userId}`); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error(`사용자(ID: ${userId})의 리마인더 목록 조회 실패:`, error);
      throw error;
    }
  },

  // 리마인더 수정
  updateReminder: async (reminderId, reminderData) => {
    try {
      const response = await axios.put(`/api/reminders/${reminderId}`, reminderData); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error(`리마인더(ID: ${reminderId}) 수정 실패:`, error);
      throw error;
    }
  },

  // 리마인더 삭제
  deleteReminder: async (reminderId) => {
    try {
      await axios.delete(`/api/reminders/${reminderId}`); // 'api' 대신 'axios' 사용
      return true;
    } catch (error) {
      console.error(`리마인더(ID: ${reminderId}) 삭제 실패:`, error);
      throw error;
    }
  },

  // 요약 저장소 정보 조회 (리마인더에서 사용)
  getSummaryArchiveForReminder: async (summaryArchiveId) => {
    try {
      const response = await axios.get(`/api/summary-archives/${summaryArchiveId}`);
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
      const response = await axios.post(`/api/recommendations`, recommendationData); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error('추천 생성 실패:', error);
      throw error;
    }
  },

  // 사용자의 모든 추천 조회 (Entity 형식 - 메타데이터 포함)
  getUserRecommendations: async (userId) => {
    try {
      console.log('🔍 추천 목록 조회 요청 - userId:', userId);
      console.log('🔍 요청 URL:', `/api/recommendations/${userId}`);
      
      // Entity 형태의 일반 엔드포인트 사용 (메타데이터 포함)
      const response = await axios.get(`/api/recommendations/${userId}`);
      console.log('🔍 추천 목록 응답 상태:', response.status);
      console.log('🔍 추천 목록 응답 데이터:', response.data);
      console.log('🔍 응답 데이터 타입:', typeof response.data);
      console.log('🔍 응답 데이터가 배열인가?', Array.isArray(response.data));
      
      // 응답 데이터가 배열이고 비어있지 않은 경우 첫 번째 항목 상세 출력
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('🔍 첫 번째 추천 항목:', response.data[0]);
      } else if (Array.isArray(response.data) && response.data.length === 0) {
        console.log('⚠️ 추천 데이터가 빈 배열입니다. 사용자에게 추천 데이터가 없거나 userId가 잘못되었을 수 있습니다.');
      }
      
      return response.data;
    } catch (error) {
      console.error(`사용자(ID: ${userId})의 추천 목록 조회 실패:`, error);
      console.error('🔍 에러 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        code: error.code
      });
      
      // 네트워크 오류인지 확인
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.error('🔍 네트워크 오류 감지: 백엔드 서버가 실행 중인지 확인하세요.');
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
      await axios.delete(`/api/recommendations/${recommendationId}`); // 'api' 대신 'axios' 사용
      return true;
    } catch (error) {
      console.error(`추천(ID: ${recommendationId}) 삭제 실패:`, error);
      throw error;
    }
  },

  // AI 추천 생성
  generateAiRecommendation: async (archiveId) => {
    try {
      // 디버깅: 현재 토큰 상태 확인
      const token = localStorage.getItem('accessToken');
      console.log('🔍 AI 추천 생성 요청 - archiveId:', archiveId);
      console.log('🔍 현재 토큰 상태:', token ? '존재함' : '없음');
      console.log('🔍 토큰 값 (앞 10자):', token ? token.substring(0, 10) + '...' : 'null');
      
      // 요청 헤더 구성 (인증 토큰 포함)
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 Authorization 헤더 추가
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 Authorization 헤더 설정됨');
      } else {
        console.log('⚠️ 토큰이 없어서 Authorization 헤더가 설정되지 않음');
      }
      
      console.log('🔍 요청 헤더:', headers);
      
      // axios 요청 (인터셉터가 자동으로 Authorization 헤더를 추가하므로 중복 방지)
      const response = await axios.post(`/api/recommendations/ai/${archiveId}`, {}, {
        // 타임아웃 설정 (5분)
        timeout: 300000,
        // 리디렉션을 따르지 않도록 설정
        maxRedirects: 0,
        // 모든 상태 코드를 일단 허용 (에러 처리를 직접 수행)
        validateStatus: () => true
      });
      
      console.log('🔍 응답 상태:', response.status, response.statusText);
      console.log('🔍 응답 헤더:', response.headers);
      console.log('🔍 응답 데이터:', response.data);
      
      // 리디렉션 응답인 경우 (302, 301 등)
      if (response.status === 302 || response.status === 301) {
        console.log('🔍 리디렉션 응답 감지됨 - 인증 필요');
        console.log('🔍 Location 헤더:', response.headers.location);
        const authError = new Error('인증이 필요합니다. 다시 로그인해주세요.');
        authError.isAuthError = true;
        throw authError;
      }
      
      // 401 Unauthorized
      if (response.status === 401) {
        console.log('🔍 401 Unauthorized 응답');
        const authError = new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        authError.isAuthError = true;
        throw authError;
      }
      
      // 403 Forbidden
      if (response.status === 403) {
        console.log('🔍 403 Forbidden 응답');
        const authError = new Error('접근 권한이 없습니다.');
        authError.isAuthError = true;
        throw authError;
      }
      
      // 500 Internal Server Error
      if (response.status === 500) {
        console.log('🔍 500 Internal Server Error 응답');
        throw new Error('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      
      // 성공하지 않은 응답
      if (response.status < 200 || response.status >= 300) {
        console.log('🔍 비정상 응답 상태:', response.status);
        throw new Error(`HTTP ${response.status}: ${response.statusText || '서버 오류'}`);
      }
      
      console.log('✅ AI 추천 생성 성공:', response.data);
      return response.data;
      
    } catch (error) {
      console.error(`요약 저장소(ID: ${archiveId})에 대한 AI 추천 생성 실패:`, error);
      
      // 이미 처리된 인증 에러라면 그대로 전달
      if (error.isAuthError) {
        throw error;
      }
      
      // axios 에러인 경우
      if (error.response) {
        // 서버에서 응답이 왔지만 2xx 범위가 아닌 경우
        if (error.response.status === 401) {
          const authError = new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
          authError.isAuthError = true;
          throw authError;
        } else if (error.response.status === 403) {
          const authError = new Error('접근 권한이 없습니다.');
          authError.isAuthError = true;
          throw authError;
        }
      } else if (error.request) {
        // 요청이 만들어졌지만 응답을 받지 못한 경우
        const networkError = new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        networkError.isNetworkError = true;
        throw networkError;
      }
      
      // 네트워크 에러인 경우
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
      const response = await axios.post(`/api/summary-archives`, archiveData);
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
      console.log('🔗 요청 URL:', `/api/summary-archives`);
      
      // 인증 토큰 확인
      const token = localStorage.getItem('accessToken');
      console.log('🔐 토큰 상태:', token ? `존재함 (${token.substring(0, 20)}...)` : '없음');
      
      const response = await axios.get(`/api/summary-archives`, {
        timeout: 10000, // 10초 타임아웃
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ 요약 저장소 조회 성공:', {
        status: response.status,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'null',
        dataLength: Array.isArray(response.data?.data) ? response.data.data.length : 'not array'
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ 요약 저장소 조회 실패:', error);
      console.error('❌ 에러 상세:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      // 네트워크 에러인지 확인
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
      const response = await axios.get(`/api/summary-archives/${archiveId}`);
      return response.data;
    } catch (error) {
      console.error(`요약 저장소(ID: ${archiveId}) 상세 조회 실패:`, error);
      throw error;
    }
  },

  // 요약 저장소 삭제
  deleteArchive: async (archiveId) => {
    try {
      await axios.delete(`/api/summary-archives/${archiveId}`);
      return true;
    } catch (error) {
      console.error(`요약 저장소(ID: ${archiveId}) 삭제 실패:`, error);
      throw error;
    }
  },

  // 요약 저장소 검색
  searchArchives: async (title, tags) => {
    try {
      const params = new URLSearchParams();
      if (title) params.append('title', title);
      if (tags) params.append('tags', tags);
      
      const response = await axios.get(`/api/summary-archives/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('요약 저장소 검색 실패:', error);
      throw error;
    }
  },

  // 태그 통계 조회
  getTagStatistics: async () => {
    try {
      const response = await axios.get(`/api/summary-archives/stat/tags`);
      return response.data;
    } catch (error) {
      console.error('태그 통계 조회 실패:', error);
      throw error;
    }
  },

  // 사용자 메모 업데이트
  updateUserNote: async (archiveId, userNotes) => {
    try {
      console.log('🔍 메모 업데이트 API 호출:', {
        archiveId: archiveId,
        userNotes: userNotes,
        archiveIdType: typeof archiveId,
        userNotesType: typeof userNotes
      });
      
      // 백엔드 UserNoteUpdateRequestDTO에 맞는 필드명 사용
      const requestBody = {
        summary_archive_id: parseInt(archiveId), // @JsonProperty("summary_archive_id")
        user_notes: userNotes || '' // @JsonProperty("user_notes")
      };
      
      console.log('🔍 요청 본문:', requestBody);
      
      const response = await axios.patch(`/api/summary-archives/notes`, requestBody);
      
      console.log('✅ 메모 업데이트 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 사용자 메모 업데이트 실패:', error);
      console.error('❌ 에러 상세:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
};

// 기본 내보내기는 삭제하거나, 필요하다면 빈 객체 등을 내보낼 수 있습니다.
// export default api; // 이 줄을 삭제하거나, 필요한 경우 다른 값을 내보냅니다.
