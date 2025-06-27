export const reminderApi = {
    getReminders: async (summaryId) => {
        try {
            const response = await axios.get(`/api/reminder`, { params: { summaryId } });
            return response.data;
        } catch (error) {
            console.error('리마인더 조회 실패:', error);
            throw error;
        }
    },
    createReminder: async (data) => {
        try {
            const response = await axios.post(`/api/reminder`, data);
            return response.data;
        } catch (error) {
            console.error('리마인더 생성 실패:', error);
            throw error;
        }
    }
};
