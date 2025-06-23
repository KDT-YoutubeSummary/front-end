// src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://43.203.114.254:8080/api',
    auth: {
        username: 'root',
        password: '1234'
    }
});
export default api;
