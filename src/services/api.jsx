// src/services/api.jsx
import axios from 'axios'; // App.jsx에서 인터셉터가 설정된 전역 axios 인스턴스를 가져옵니다.

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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
      const response = await axios.post(`${API_BASE_URL}/api/youtube/save`, { url }); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error('영상 메타데이터 저장 실패:', error);
      throw error;
    }
  },

  // 영상 메타데이터 조회
  getMetadata: async (url) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/youtube/title`, { params: { url } }); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error('영상 메타데이터 조회 실패:', error);
      throw error;
    }
  },

  // 유튜브 영상 업로드 및 요약 요청
  uploadVideo: async (originalUrl, userPrompt, summaryType) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/youtube/upload`, { // 'api' 대신 'axios' 사용
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
  login: async (userName, password) => { // ✅ 수정: email -> userName으로 변경 (App.jsx와 일관성)
    try {
      // ✅ 수정: 'email' 대신 'userName' 사용
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { userName, password }); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  },

  // 회원가입
  register: async (userName, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, { userName, email, password }); // 'api' 대신 'axios' 사용
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
      const response = await axios.get(`${API_BASE_URL}/api/mypage`); // 'api' 대신 'axios' 사용
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
      const response = await axios.post(`${API_BASE_URL}/api/quizzes/generate`, { // 'api' 대신 'axios' 사용
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
      const response = await axios.post(`${API_BASE_URL}/api/quizzes/${quizId}/submit`, { answers }); // 'api' 대신 'axios' 사용
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
      const response = await axios.post(`${API_BASE_URL}/api/reminders`, reminderData); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error('리마인더 생성 실패:', error);
      throw error;
    }
  },

  // 리마인더 상세 조회
  getReminder: async (reminderId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reminders/${reminderId}`); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error(`리마인더(ID: ${reminderId}) 조회 실패:`, error);
      throw error;
    }
  },

  // 사용자의 모든 리마인더 조회
  getUserReminders: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reminders/user/${userId}`); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error(`사용자(ID: ${userId})의 리마인더 목록 조회 실패:`, error);
      throw error;
    }
  },

  // 리마인더 수정
  updateReminder: async (reminderId, reminderData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/reminders/${reminderId}`, reminderData); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error(`리마인더(ID: ${reminderId}) 수정 실패:`, error);
      throw error;
    }
  },

  // 리마인더 삭제
  deleteReminder: async (reminderId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/reminders/${reminderId}`); // 'api' 대신 'axios' 사용
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
      const response = await axios.post(`${API_BASE_URL}/api/recommendations`, recommendationData); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error('추천 생성 실패:', error);
      throw error;
    }
  },

  // 사용자의 모든 추천 조회
  getUserRecommendations: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/recommendations/${userId}`); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error(`사용자(ID: ${userId})의 추천 목록 조회 실패:`, error);
      throw error;
    }
  },

  // 추천 삭제
  deleteRecommendation: async (recommendationId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/recommendations/${recommendationId}`); // 'api' 대신 'axios' 사용
      return true;
    } catch (error) {
      console.error(`추천(ID: ${recommendationId}) 삭제 실패:`, error);
      throw error;
    }
  },

  // AI 추천 생성
  generateAiRecommendation: async (userLibraryId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/recommendations/ai/${userLibraryId}`); // 'api' 대신 'axios' 사용
      return response.data;
    } catch (error) {
      console.error(`라이브러리(ID: ${userLibraryId})에 대한 AI 추천 생성 실패:`, error);
      throw error;
    }
  }
};

// 기본 내보내기는 삭제하거나, 필요하다면 빈 객체 등을 내보낼 수 있습니다.
// export default api; // 이 줄을 삭제하거나, 필요한 경우 다른 값을 내보냅니다.


// // src/services/api.jsx
// import axios from 'axios';
//
// // API 클라이언트 생성
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
//
// // 인증 토큰 설정 함수
// export const setAuthToken = (token) => {
//   if (token) {
//     api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   } else {
//     delete api.defaults.headers.common['Authorization'];
//   }
// };
//
// // YouTube 메타데이터 관련 API 함수
// export const youtubeApi = {
//   // 영상 메타데이터 저장
//   saveMetadata: async (url) => {
//     try {
//       const response = await api.post('/api/youtube/save', { url });
//       return response.data;
//     } catch (error) {
//       console.error('영상 메타데이터 저장 실패:', error);
//       throw error;
//     }
//   },
//
//   // 영상 메타데이터 조회
//   getMetadata: async (url) => {
//     try {
//       const response = await api.get('/api/youtube/title', { params: { url } });
//       return response.data;
//     } catch (error) {
//       console.error('영상 메타데이터 조회 실패:', error);
//       throw error;
//     }
//   },
//
//   // 유튜브 영상 업로드 및 요약 요청
//   uploadVideo: async (originalUrl, userPrompt, summaryType) => {
//     try {
//       const response = await api.post('/api/youtube/upload', {
//         originalUrl,
//         userPrompt,
//         summaryType
//       });
//       return response.data;
//     } catch (error) {
//       console.error('유튜브 영상 업로드 실패:', error);
//       throw error;
//     }
//   }
// };
//
// // 인증 관련 API 함수
// export const authApi = {
//   // 일반 로그인
//   login: async (email, password) => {
//     try {
//       const response = await api.post('/api/auth/login', { email, password });
//       return response.data;
//     } catch (error) {
//       console.error('로그인 실패:', error);
//       throw error;
//     }
//   },
//
//   // 회원가입
//   register: async (userName, email, password) => {
//     try {
//       const response = await api.post('/api/auth/register', { userName, email, password });
//       return response.data;
//     } catch (error) {
//       console.error('회원가입 실패:', error);
//       throw error;
//     }
//   }
// };
//
// // 마이페이지 관련 API 함수
// export const myPageApi = {
//   // 마이페이지 정보 조회
//   getMyPageInfo: async () => {
//     try {
//       const response = await api.get('/api/mypage');
//       return response.data;
//     } catch (error) {
//       console.error('마이페이지 정보 조회 실패:', error);
//       throw error;
//     }
//   }
// };
//
// // 퀴즈 관련 API 함수
// export const quizApi = {
//   // 퀴즈 생성
//   generateQuiz: async (summaryId, count, difficulty) => {
//     try {
//       const response = await api.post('/api/quizzes/generate', {
//         summaryId,
//         count,
//         difficulty
//       });
//       return response.data;
//     } catch (error) {
//       console.error('퀴즈 생성 실패:', error);
//       throw error;
//     }
//   },
//
//   // 퀴즈 제출
//   submitQuiz: async (quizId, answers) => {
//     try {
//       const response = await api.post(`/api/quizzes/${quizId}/submit`, { answers });
//       return response.data;
//     } catch (error) {
//       console.error(`퀴즈(ID: ${quizId}) 제출 실패:`, error);
//       throw error;
//     }
//   }
// };
//
// // 리마인더 관련 API 함수
// export const reminderApi = {
//   // 리마인더 생성
//   createReminder: async (reminderData) => {
//     try {
//       const response = await api.post('/api/reminders', reminderData);
//       return response.data;
//     } catch (error) {
//       console.error('리마인더 생성 실패:', error);
//       throw error;
//     }
//   },
//
//   // 리마인더 상세 조회
//   getReminder: async (reminderId) => {
//     try {
//       const response = await api.get(`/api/reminders/${reminderId}`);
//       return response.data;
//     } catch (error) {
//       console.error(`리마인더(ID: ${reminderId}) 조회 실패:`, error);
//       throw error;
//     }
//   },
//
//   // 사용자의 모든 리마인더 조회
//   getUserReminders: async (userId) => {
//     try {
//       const response = await api.get(`/api/reminders/user/${userId}`);
//       return response.data;
//     } catch (error) {
//       console.error(`사용자(ID: ${userId})의 리마인더 목록 조회 실패:`, error);
//       throw error;
//     }
//   },
//
//   // 리마인더 수정
//   updateReminder: async (reminderId, reminderData) => {
//     try {
//       const response = await api.put(`/api/reminders/${reminderId}`, reminderData);
//       return response.data;
//     } catch (error) {
//       console.error(`리마인더(ID: ${reminderId}) 수정 실패:`, error);
//       throw error;
//     }
//   },
//
//   // 리마인더 삭제
//   deleteReminder: async (reminderId) => {
//     try {
//       await api.delete(`/api/reminder/${reminderId}`);
//       return true;
//     } catch (error) {
//       console.error(`리마인더(ID: ${reminderId}) 삭제 실패:`, error);
//       throw error;
//     }
//   }
// };
//
// // 추천 관련 API 함수
// export const recommendationApi = {
//   // 추천 생성
//   createRecommendation: async (recommendationData) => {
//     try {
//       const response = await api.post('/api/recommendations', recommendationData);
//       return response.data;
//     } catch (error) {
//       console.error('추천 생성 실패:', error);
//       throw error;
//     }
//   },
//
//   // 사용자의 모든 추천 조회
//   getUserRecommendations: async (userId) => {
//     try {
//       const response = await api.get(`/api/recommendations/${userId}`);
//       return response.data;
//     } catch (error) {
//       console.error(`사용자(ID: ${userId})의 추천 목록 조회 실패:`, error);
//       throw error;
//     }
//   },
//
//   // 추천 삭제
//   deleteRecommendation: async (recommendationId) => {
//     try {
//       await api.delete(`/api/recommendation/${recommendationId}`);
//       return true;
//     } catch (error) {
//       console.error(`추천(ID: ${recommendationId}) 삭제 실패:`, error);
//       throw error;
//     }
//   },
//
//   // AI 추천 생성
//   generateAiRecommendation: async (userLibraryId) => {
//     try {
//       const response = await api.post(`/api/recommendations/ai/${userLibraryId}`);
//       return response.data;
//     } catch (error) {
//       console.error(`라이브러리(ID: ${userLibraryId})에 대한 AI 추천 생성 실패:`, error);
//       throw error;
//     }
//   }
// };
//
// export default api;
