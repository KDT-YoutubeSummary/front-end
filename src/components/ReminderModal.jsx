import React, { useState } from 'react';

// 리마인드 알림 설정 모달 컴포넌트입니다.
const ReminderModal = ({ onClose, onSave, defaultDateTime }) => {
    const [reminderDateTime, setReminderDateTime] = useState(defaultDateTime || '');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-auto text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">리마인드 알림 설정</h3>
                <input
                    type="datetime-local"
                    value={reminderDateTime}
                    onChange={e => setReminderDateTime(e.target.value)}
                    className="border rounded p-2 w-full mb-6"
                />
                <div className="flex gap-2">
                    <button
                        onClick={() => onSave(reminderDateTime)}
                        className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        저장
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReminderModal;