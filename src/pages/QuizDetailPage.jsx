import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function QuizDetailPage() {
    const { quizId } = useParams();
    const [quizDetails, setQuizDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userAnswers, setUserAnswers] = useState({});
    const [reviewResult, setReviewResult] = useState(null);

    const token = localStorage.getItem("token"); // 로그인 토큰 저장 방식에 맞게 수정 가능

    useEffect(() => {
        const fetchQuizDetails = async () => {
            try {
                const response = await axios.get(`/api/quiz/${quizId}`);
                setQuizDetails(response.data);
                setLoading(false);
            } catch (e) {
                console.error('퀴즈 상세 정보 불러오기 실패:', e);
                setError('퀴즈 상세 정보를 불러오는 데 실패했습니다.');
                setLoading(false);
            }
        };

        fetchQuizDetails();
    }, [quizId]);

    const handleOptionChange = (questionId, answerOptionId) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: answerOptionId }));
    };

    const handleSubmitQuiz = async () => {
        const answers = Object.entries(userAnswers).map(([questionId, answerOptionId]) => ({
            questionId: parseInt(questionId),
            answerOptionId
        }));

        try {
            const response = await axios.post(
                `/api/quiz/${quizId}/review`,
                { answers },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            setReviewResult(response.data);
        } catch (err) {
            console.error("퀴즈 복습 오류:", err);
            alert("퀴즈 결과를 가져오는 데 실패했습니다.");
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-600">퀴즈를 불러오는 중...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">에러: {error}</div>;
    }

    if (!quizDetails) {
        return <div className="p-4 text-center text-gray-600">퀴즈를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">
                퀴즈 상세 보기: {quizDetails.title || `퀴즈 ID: ${quizDetails.quizId}`}
            </h1>
            <p className="text-gray-500 mb-6">생성일: {new Date(quizDetails.createdAt).toLocaleString()}</p>

            <div className="space-y-8">
                {quizDetails.questions.map((q, qIndex) => (
                    <div key={q.questionId} className="border rounded-xl p-6 shadow-sm bg-white">
                        <p className="text-xl font-semibold mb-4">Q{qIndex + 1}. {q.questionText}</p>
                        <div className="space-y-3">
                            {q.options.map(opt => (
                                <div
                                    key={opt.answerOptionId}
                                    className="flex items-center bg-gray-100 p-3 rounded-md border"
                                >
                                    <input
                                        type="radio"
                                        id={`opt-${opt.answerOptionId}`}
                                        name={`question-${q.questionId}`}
                                        value={opt.answerOptionId}
                                        onChange={() => handleOptionChange(q.questionId, opt.answerOptionId)}
                                        checked={userAnswers[q.questionId] === opt.answerOptionId}
                                        className="form-radio h-5 w-5 text-blue-600"
                                    />
                                    <label htmlFor={`opt-${opt.answerOptionId}`} className="ml-3 text-gray-800">
                                        {opt.optionText}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-10">
                <button
                    onClick={handleSubmitQuiz}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    퀴즈 제출
                </button>
            </div>

            {reviewResult && (
                <div className="mt-12 p-6 border border-green-300 bg-green-50 rounded-xl">
                    <h2 className="text-2xl font-bold mb-4 text-green-800">복습 결과</h2>
                    {reviewResult.map((q, idx) => (
                        <div key={q.questionId} className="mb-6">
                            <p className="font-semibold">Q{idx + 1}. {q.questionText}</p>
                            <ul className="list-disc ml-6 mt-2">
                                {q.options.map(opt => (
                                    <li
                                        key={opt.answerOptionId}
                                        className={opt.isCorrect ? "text-green-700 font-bold" : "text-gray-800"}
                                    >
                                        {opt.optionText}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
