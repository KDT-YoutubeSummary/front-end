// src/components/AuthModal.jsx

import React from 'react';
import AuthPage from '../pages/AuthPage.jsx'; // 기존 AuthPage 컴포넌트를 임포트합니다.
import { X } from 'lucide-react'; // 모달 닫기 버튼에 사용할 아이콘 임포트

/**
 * AuthPage를 감싸는 모달 컴포넌트입니다.
 * 배경 오버레이와 닫기 버튼을 포함합니다.
 *
 * @param {object} props - 컴포넌트 속성
 * @param {function} props.onLogin - 로그인 제출 시 호출되는 콜백 함수
 * @param {function} props.onSignup - 회원가입 제출 시 호출되는 콜백 함수
 * @param {function} props.onClose - 모달 닫기 버튼 클릭 시 호출되는 콜백 함수
 * @param {function} props.onMessage - 전역 메시지 모달을 띄우는 콜백 함수
 */
const AuthModal = ({ onLogin, onSignup, onClose, onMessage }) => {
    return (
        // 모달 오버레이: 전체 화면을 덮고 배경을 어둡게 만듭니다.
        // fixed inset-0: 화면에 고정되고 모든 방향으로 0px 떨어져 전체를 덮습니다.
        // bg-black bg-opacity-60: 검정색 배경에 60% 투명도를 줍니다.
        // flex items-center justify-center: 내부 요소를 중앙에 정렬합니다.
        // z-50: 다른 요소들 위에 오도록 z-index를 높게 설정합니다.
        // p-4: 모바일 화면을 위해 약간의 패딩을 줍니다.
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            {/* 모달 내용 컨테이너 */}
            {/* bg-white rounded-xl shadow-2xl: 흰색 배경, 둥근 모서리, 그림자 효과를 줍니다. */}
            {/* p-6 md:p-8: 반응형 패딩을 줍니다. */}
            {/* max-w-lg w-full mx-auto: 최대 너비를 제한하고 중앙에 배치하며, 모바일에서는 전체 너비를 사용합니다. */}
            {/* relative: 닫기 버튼의 absolute 포지셔닝을 위한 기준점입니다. */}
            {/* animate-fade-in-up: 모달이 부드럽게 나타나는 애니메이션 효과를 줍니다. (CSS에 해당 애니메이션이 정의되어 있어야 합니다.) */}
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-lg w-full mx-auto relative animate-fade-in-up">
                {/* 닫기 버튼 */}
                {/* absolute top-4 right-4: 상단 오른쪽 모서리에 고정합니다. */}
                {/* text-gray-500 hover:text-gray-700 transition-colors: 색상 변화 효과를 줍니다. */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="닫기" // 접근성을 위해 aria-label 추가
                >
                    <X className="h-6 w-6" /> {/* X 아이콘 */}
                </button>

                {/* 기존 AuthPage 컴포넌트를 여기에 렌더링합니다. */}
                {/* onLogin, onSignup, onMessage prop을 그대로 전달합니다. */}
                {/* AuthPage가 페이지 전환 로직을 가지고 있었다면, 모달 환경에 맞게 내부적으로 수정해야 할 수 있습니다. */}
                <AuthPage
                    onLogin={onLogin}
                    onSignup={onSignup}
                    onMessage={onMessage}
                    // AuthPage가 모달 닫기 로직을 필요로 한다면,
                    // 여기에 onAuthSuccess={onClose} 와 같은 prop을 추가하여
                    // AuthPage 내에서 로그인 성공 시 모달을 닫도록 할 수 있습니다.
                    // 현재 AuthPage에는 없으므로 추가하지 않습니다.
                />
            </div>
        </div>
    );
};

export default AuthModal;