import axios from "axios";

export const recommendationApi = {
    getRecommendations: async (userId) => {
        try {
            const response = await axios.get(`/api/recommend`, { params: { userId } });
            return response.data;
        } catch (error) {
            console.error('추천 영상 조회 실패:', error);
            throw error;
        }
    }
};
