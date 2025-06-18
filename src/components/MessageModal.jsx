import React, { useEffect } from 'react';

export default function MessageModal({ message, onClose }) {

    // ESC 키로 닫기
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            onClick={onClose} // 배경 클릭 시 닫기
        >
            <div
                className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center animate-scale-in"
                onClick={(e) => e.stopPropagation()} // 내부 클릭은 이벤트 전파 막기
            >
                <h3 className="text-xl font-bold mb-4">알림</h3>
                <p className="text-gray-700 mb-6 whitespace-pre-line">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                    확인
                </button>
            </div>
        </div>
    );
}

