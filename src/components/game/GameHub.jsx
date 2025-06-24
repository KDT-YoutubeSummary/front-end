import React, { useState } from 'react';
import SummaryTypingGame from './SummaryTypingGame';
import DinoRunnerGame from './DinoRunnerGame';
import { Keyboard, Play, Trophy, Clock, Zap } from 'lucide-react';

const GameHub = ({ summaryComplete, onComplete }) => {
    const [selectedGame, setSelectedGame] = useState(null);

    if (selectedGame === 'typing') {
        return <SummaryTypingGame 
            summaryComplete={summaryComplete} 
            onComplete={onComplete} 
            onBack={() => setSelectedGame(null)}
            onSwitchGame={setSelectedGame}
        />;
    }

    if (selectedGame === 'dino') {
        return <DinoRunnerGame 
            summaryComplete={summaryComplete} 
            onComplete={onComplete} 
            onBack={() => setSelectedGame(null)}
            onSwitchGame={setSelectedGame}
        />;
    }

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl">
            {/* 헤더 */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">요약 처리 중...</h2>
                <p className="text-gray-600">AI가 영상을 분석하는 동안 미니게임을 즐겨보세요!</p>
            </div>

            {/* 게임 선택 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* 타자 게임 카드 */}
                <div 
                    onClick={() => setSelectedGame('typing')}
                    className="group cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Keyboard className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-blue-900">타자 게임</h3>
                        <p className="text-sm text-blue-700">타자 실력을 향상시키며 시간을 보내세요</p>
                        <div className="flex items-center space-x-4 text-xs text-blue-600">
                            <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>집중력</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Zap className="h-3 w-3" />
                                <span>반응속도</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 공룡 게임 카드 */}
                <div 
                    onClick={() => setSelectedGame('dino')}
                    className="group cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 hover:border-green-400 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <div className="text-white text-lg font-bold"></div>
                        </div>
                        <h3 className="text-lg font-bold text-green-900">공룡 게임</h3>
                        <p className="text-sm text-green-700">장애물을 피하며 최고 기록에 도전하세요</p>
                        <div className="flex items-center space-x-4 text-xs text-green-600">
                            <div className="flex items-center space-x-1">
                                <Trophy className="h-3 w-3" />
                                <span>순발력</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Zap className="h-3 w-3" />
                                <span>집중력</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 팁 섹션 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-yellow-900 text-sm font-bold"></span>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-yellow-900 mb-1">게임 플레이 팁</h4>
                        <p className="text-xs text-yellow-800 text-center">
                             타자 게임: 정확도를 우선으로 하되 속도를 점차 높여보세요<br />
                             공룡 게임: 스페이스바로 점프하며 장애물을 피하세요
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameHub;
