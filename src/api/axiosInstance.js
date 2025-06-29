import axios from "axios";

// API 기본 설정
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 - 토큰 만료 처리
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // 토큰 만료 시 처리
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // 로그인 페이지로 리다이렉트하거나 로그아웃 처리
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default api;
