// src/components/Recommendation.jsx
import React from 'react';
import { Lightbulb, Play } from 'lucide-react';

/**
 * Recommendation Component
 * Displays a single recommendation item.
 * @param {object} props - Component props.
 * @param {object} props.recommendation - The recommendation object data.
 */
const Recommendation = ({ recommendation }) => {
    return (
        <div className="mt-8 p-6 border-t-2 border-purple-200 bg-purple-50 rounded-lg text-left shadow-inner">
            <h4 className="text-xl font-semibold text-purple-800 mb-3 flex items-center space-x-2">
                <Lightbulb className="h-6 w-6" />
                <span>추천 영상</span>
            </h4>
            <h5 className="text-lg font-bold text-gray-800 mb-2">{recommendation.title}</h5>
            <p className="text-gray-700 mb-3 leading-relaxed">{recommendation.reason}</p>
            {recommendation.youtubeUrl && (
                <a
                    href={recommendation.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                    <Play className="h-4 w-4 mr-1" />
                    영상 보기 (목업 URL)
                </a>
            )}
        </div>
    );
};

export default Recommendation;
