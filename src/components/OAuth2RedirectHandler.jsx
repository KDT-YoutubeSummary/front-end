import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// OAuth2 리다이렉트 핸들러 컴포넌트입니다.
const OAuth2RedirectHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const userId = searchParams.get('userId');
        const userName = searchParams.get('userName');

        if (accessToken && userId) {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('userId', userId);
            if(userName) localStorage.setItem('userName', userName);

            navigate('/', { state: { loginSuccess: true }, replace: true });
            // 로그인 성공 후 모달이 떠있던 이전 페이지가 아닌,
            // 앱의 메인 페이지로 완전히 새로 이동합니다.
            window.location.replace('/');
        } else {
            console.error("소셜 로그인 중 토큰 또는 사용자 정보를 받지 못했습니다.");
            navigate('/login', { state: { error: "로그인에 실패했습니다." } });
        }
    }, [navigate, searchParams]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
                <p className="text-xl font-semibold text-gray-700">로그인 처리 중입니다.</p>
                console.error("소셜 로그인 중 토큰 또는 사용자 정보를 받지 못했습니다.");
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;
