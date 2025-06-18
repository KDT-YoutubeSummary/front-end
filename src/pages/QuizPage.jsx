import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function QuizPage() {
    const [numQuestions, setNumQuestions] = useState(3);
    const [quizzes, setQuizzes] = useState([]);
    const [error, setError] = useState('');
    const [summaries, setSummaries] = useState([]);
    const [selectedSummaryId, setSelectedSummaryId] = useState('');
    const navigate = useNavigate();

    const fetchQuizzes = async () => {
        try {
            const response = await axios.get('/api/quiz');
            setQuizzes(response.data);
        } catch (e) {
            console.error('퀴즈 목록 불러오기 실패:', e);
            setError('퀴즈 목록을 불러오는 데 실패했습니다.');
        }
    };

    const fetchSummaries = async () => {
        try {
            const response = await axios.get('/api/summary/list');
            setSummaries(response.data);
            if (response.data.length > 0) {
                setSelectedSummaryId(response.data[0].summaryId);
            }
        } catch (e) {
            console.error('요약 목록 불러오기 실패:', e);
            setError('요약 목록을 불러오는 데 실패했습니다.');
        }
    };

    useEffect(() => {
        fetchQuizzes();
        fetchSummaries();
    }, []);

    const handleGenerate = async () => {
        setError('');
        if (!selectedSummaryId) {
            setError('퀴즈를 생성할 요약을 선택해주세요.');
            return;
        }

        const selected = summaries.find(s => s.summaryId === selectedSummaryId);
        if (!selected) {
            setError('선택한 요약 정보를 찾을 수 없습니다.');
            return;
        }

        try {
            const payload = {
                summaryId: selected.summaryId,
                transcriptId: selected.transcriptId,
                summaryText: selected.summaryText,
                numberOfQuestions: numQuestions,
            };
            await axios.post('/api/quiz/generate', payload);
            fetchQuizzes();
        } catch (e) {
            console.error(e);
            setError(e.response?.data?.message || '문제 생성 실패');
        }
    };

    const handleRunQuiz = (quizId) => {
        console.log(`퀴즈 실행: ${quizId}`);
        navigate(`/quiz/${quizId}`);
    };

    const handleDeleteQuiz = async (quizId) => {
        if (window.confirm('정말로 이 퀴즈를 삭제하시겠습니까?')) {
            try {
                alert('퀴즈 삭제 기능은 백엔드 구현이 필요합니다.');
            } catch (e) {
                console.error('퀴즈 삭제 실패:', e);
                setError('퀴즈 삭제에 실패했습니다.');
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">퀴즈 페이지</h1>

            <div className="bg-white rounded-xl shadow-lg border p-6 space-y-4 mb-8">
                <h2 className="text-2xl font-semibold mb-4">새 퀴즈 생성</h2>
                <div className="flex items-center space-x-4">
                    <input
                        type="number"
                        value={numQuestions}
                        onChange={e => setNumQuestions(+e.target.value)}
                        className="w-24 bg-gray-100 border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        min="1"
                        max="10"
                    />
                    <button
                        onClick={handleGenerate}
                        className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition duration-300"
                    >문제 생성</button>
                </div>
                {error && <p className="text-red-500 mt-2">에러: {error}</p>}
            </div>

            <div className="bg-white rounded-xl shadow-lg border p-6 space-y-4 mb-8">
                <h2 className="text-2xl font-semibold mb-4">요약 선택 (퀴즈 생성용)</h2>
                {summaries.length === 0 ? (
                    <p className="text-gray-600">생성된 요약이 없습니다. 먼저 메인 페이지에서 요약을 생성해주세요.</p>
                ) : (
                    <div className="flex items-center space-x-4">
                        <select
                            value={selectedSummaryId}
                            onChange={e => setSelectedSummaryId(parseInt(e.target.value))}
                            className="flex-grow bg-gray-100 border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            {summaries.map(summary => (
                                <option key={summary.summaryId} value={summary.summaryId}>
                                    요약 ID: {summary.summaryId} - {summary.summaryText.substring(0, 50)}...
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-lg border p-6 space-y-4">
                <h2 className="text-2xl font-semibold mb-4">생성된 퀴즈 목록</h2>
                {quizzes.length === 0 ? (
                    <p className="text-gray-600">아직 생성된 퀴즈가 없습니다.</p>
                ) : (
                    <div className="space-y-4">
                        {quizzes.map(quiz => (
                            <div key={quiz.quizId} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-200">
                                <div className="flex-grow">
                                    <p className="font-semibold text-lg">{quiz.title || `AI 자동 생성 퀴즈 (ID: ${quiz.quizId})`}</p>
                                    <p className="text-sm text-gray-500">생성일: {new Date(quiz.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleRunQuiz(quiz.quizId)}
                                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition duration-300 flex items-center justify-center"
                                        title="퀴즈 실행"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.985V5.653Z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuiz(quiz.quizId)}
                                        className="bg-gray-300 text-gray-700 p-2 rounded-full hover:bg-gray-400 transition duration-300 flex items-center justify-center"
                                        title="퀴즈 삭제"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.924a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m-1.022.165 1.12 12.18A2.25 2.25 0 0 0 5.683 19.674l.056.448m-.546.448c.552.053 1.107.085 1.66.089m-1.66-.089 12.18 1.12c.119.01.237.017.356.023m-12.18-1.12.356-.023c.119-.006.237-.013.356-.023M15 9.75a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75Zm-3 0a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75Zm-3 0a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75Z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
