import React from 'react';
import Reminder from '../components/Reminder';
import ReminderEditModal from '../components/ReminderEditModal';

/**
 * Reminder Page Component
 * Displays a list of all set reminders with expand, edit, and delete functionalities.
 * @param {object} props - Component props.
 * @param {Array<object>} props.reminders - List of reminder items.
 * @param {function} props.handleDeleteReminder - Function to delete a reminder.
 * @param {function} props.setShowReminderEditModal - Function to show the reminder edit modal.
 * @param {function} props.setEditingReminder - Function to set the reminder being edited.
 */
const ReminderPage = ({ reminders, handleDeleteReminder, setShowReminderEditModal, setEditingReminder }) => {
    const handleEditReminder = (reminder) => {
        setEditingReminder(reminder);
        setShowReminderEditModal(true);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {reminders.length === 0 ? (
                <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                    <p className="text-lg font-medium">설정된 리마인더가 없습니다.</p>
                    <p className="text-sm">라이브러리에서 요약본에 대한 리마인더를 설정해보세요.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    {reminders.map((reminder) => (
                        <Reminder
                            key={reminder.id}
                            reminder={reminder}
                            onDelete={handleDeleteReminder}
                            onEdit={handleEditReminder}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export { ReminderPage, ReminderEditModal };
