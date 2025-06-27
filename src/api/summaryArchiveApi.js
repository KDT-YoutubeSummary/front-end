export const summaryArchiveApi = {
    getAllSummaries: async () => {
        try {
            const response = await axios.get(`/api/summary/archive`);
            return response.data;
        } catch (error) {
            console.error('요약 아카이브 조회 실패:', error);
            throw error;
        }
    }
};
