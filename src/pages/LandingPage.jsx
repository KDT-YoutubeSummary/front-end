import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Sparkles, TrendingUp, Archive, Zap, Users, Award, CheckCircle, Clock, Bell, FileText, Lightbulb, BookOpen, Brain, Target, Star } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isStarting, setIsStarting] = useState(false);

    const handleStart = () => {
        setIsStarting(true);
        
        // 애니메이션 시간 후 페이지 이동
        setTimeout(() => {
            navigate('/summary');
        }, 1200);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-yellow-100 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob animation-delay-6000"></div>
            </div>

            {/* Navigation Bar */}
            <nav className="relative z-10 flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="h-5 w-5 text-white fill-current" />
                    </div>
                    <span className="text-xl font-bold text-gray-800">YouSum</span>
                </div>
                <div className="hidden md:flex items-center space-x-8">
                    <a href="#features" className="text-gray-600 hover:text-red-500 transition-colors font-medium">기능</a>
                    <a href="#target-users" className="text-gray-600 hover:text-red-500 transition-colors font-medium">사용자</a>
                    <a href="#stats" className="text-gray-600 hover:text-red-500 transition-colors font-medium">통계</a>
                    <button 
                        onClick={handleStart}
                        className="bg-red-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-600 transition-colors shadow-lg"
                    >
                        시작하기
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
                {/* Main Logo and Title */}
                <div 
                    className={`flex flex-col items-center transition-all duration-1200 ease-in-out ${
                        isStarting 
                            ? 'opacity-0 transform scale-75 -translate-y-32' 
                            : 'opacity-100 transform scale-100 translate-y-0'
                    }`}
                >
                    <div className="relative mb-10">
                        {/* Main Logo */}
                        <div className="w-32 h-32 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl hover:shadow-red-300 transition-all duration-500 transform hover:scale-105">
                            <Play className="h-16 w-16 text-white fill-current" />
                        </div>
                        
                        {/* Animated Rings */}
                        <div className="absolute inset-0 w-32 h-32 border-4 border-red-200 rounded-full animate-ping"></div>
                        <div className="absolute -inset-2 w-36 h-36 border-2 border-red-100 rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* Title and Subtitle - 간격 확대 */}
                    <div className="space-y-8">
                        <h1 className="text-7xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-red-600 to-gray-900 tracking-tight">
                            You<span className="text-red-500">Sum</span>
                        </h1>
                        
                        <div className="space-y-6">
                            <p className="text-2xl md:text-3xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
                                AI가 만드는 <span className="text-red-500 font-semibold">스마트한 학습</span>,<br />
                                유튜브 영상을 한 번에 요약하세요
                            </p>
                            

                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-3 mt-10">
                            <span className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium">
                                <Sparkles className="w-4 h-4 mr-2" />
                                AI 요약
                            </span>
                            <span className="inline-flex items-center px-4 py-2 bg-yellow-50 text-yellow-600 rounded-full text-sm font-medium">
                                <Archive className="w-4 h-4 mr-2" />
                                요약 저장소
                            </span>
                            <span className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                                <Clock className="w-4 h-4 mr-2" />
                                스마트 알림
                            </span>
                            <span className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                개인화 추천
                            </span>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <div 
                    className={`mt-16 transition-all duration-1200 delay-200 ease-in-out ${
                        isStarting ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'
                    }`}
                >
                    <button
                        onClick={handleStart}
                        disabled={isStarting}
                        className="group relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white px-16 py-5 rounded-full text-xl font-bold shadow-2xl hover:shadow-red-200 hover:from-red-600 hover:to-red-800 transform hover:scale-105 transition-all duration-300 flex items-center space-x-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <Zap className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                        <span>지금 시작하기</span>
                        <ChevronRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </button>
                    <p className="text-gray-500 text-sm mt-6">무료로 시작하세요 • 로그인 필요</p>
                </div>
            </section>

            {/* Features Section */}
            <section 
                id="features"
                className={`relative z-10 py-20 px-6 mt-20 transition-all duration-800 delay-100 ease-in-out ${
                    isStarting ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'
                }`}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            AI가 제공하는 <span className="text-red-500">스마트한 기능</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            복잡한 유튜브 영상도 몇 초 만에 핵심만 골라 요약합니다
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* AI 자동 요약 */}
                        <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Sparkles className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">AI 자동 요약</h3>
                            <p className="text-gray-600 text-center leading-relaxed mb-4 text-sm">
                                Whisper와 GPT-4를 활용해<br />
                                영상의 핵심 내용을<br />
                                <span className="text-red-600 font-semibold">4가지 스타일로 요약</span>
                            </p>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>기본 요약 • 3줄 요약</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>키워드 • 타임라인 요약</span>
                                </div>
                            </div>
                        </div>

                        {/* 요약 저장소 */}
                        <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Archive className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">요약 저장소</h3>
                            <p className="text-gray-600 text-center leading-relaxed mb-4 text-sm">
                                요약한 모든 영상을<br />
                                체계적으로 저장하고 관리하여<br />
                                <span className="text-yellow-600 font-semibold">나만의 지식 창고</span> 구축
                            </p>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>카테고리별 분류 저장</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>검색 및 필터링 기능</span>
                                </div>
                            </div>
                        </div>

                        {/* 리마인더 */}
                        <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Bell className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">스마트 알림</h3>
                            <p className="text-gray-600 text-center leading-relaxed mb-4 text-sm">
                                개인 학습 일정에 맞춰<br />
                                복습 시기를 알려주는<br />
                                <span className="text-blue-600 font-semibold">지능형 리마인더</span>
                            </p>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>맞춤형 복습 알림</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>학습 스케줄 관리</span>
                                </div>
                            </div>
                        </div>

                        {/* 개인화 추천 */}
                        <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">개인화 추천</h3>
                            <p className="text-gray-600 text-center leading-relaxed mb-4 text-sm">
                                학습 패턴을 분석해<br />
                                맞춤형 영상을 추천하고<br />
                                <span className="text-purple-600 font-semibold">학습 효율을 극대화</span>
                            </p>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>AI 기반 개인화 추천</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>학습 성향 분석</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Target Users Section - 타겟 사용자층 섹션 추가 */}
            <section 
                id="target-users"
                className={`relative z-10 py-20 px-6 bg-gradient-to-r from-blue-50 via-white to-purple-50 transition-all duration-800 delay-200 ease-in-out ${
                    isStarting ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'
                }`}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            <span className="text-blue-500">누구를 위한</span> 서비스일까요?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            능동적 학습자를 위한 AI 기반 유튜브 영상 요약 및 학습 지원 플랫폼
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* 대학생 및 대학원생 */}
                        <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">대학생 및 대학원생</h3>
                            <p className="text-gray-600 text-center leading-relaxed mb-6">
                                온라인 강의와 학술 영상이 많아<br />
                                <span className="text-blue-600 font-semibold">효율적인 학습 방법</span>이 필요한 분들
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span>온라인 강의 내용 정리</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span>연구 자료 효율적 분석</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span>시험 준비 시간 단축</span>
                                </div>
                            </div>
                        </div>

                        {/* 직장인 */}
                        <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Target className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">직장인</h3>
                            <p className="text-gray-600 text-center leading-relaxed mb-6">
                                업무 관련 학습과 자기계발을 위해<br />
                                <span className="text-green-600 font-semibold">시간 효율성</span>을 중시하는 분들
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span>업무 스킬 향상 영상 요약</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span>트렌드 정보 빠른 파악</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span>점심시간 자기계발</span>
                                </div>
                            </div>
                        </div>

                        {/* 평생학습자 */}
                        <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Brain className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">평생학습자</h3>
                            <p className="text-gray-600 text-center leading-relaxed mb-6">
                                새로운 분야에 대한 호기심이 많고<br />
                                <span className="text-purple-600 font-semibold">체계적인 학습 관리</span>를 원하는 분들
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span>취미 분야 깊이있는 학습</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span>학습 진도 체계적 관리</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span>개인 맞춤형 학습 경험</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 추가 특징 */}
                    <div className="mt-16 text-center">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                <span className="text-red-500">능동적 학습자</span>를 위한 특별한 경험
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col items-center">
                                    <Star className="h-8 w-8 text-yellow-500 mb-3" />
                                    <p className="text-sm text-gray-600 text-center">
                                        단순 시청이 아닌<br />
                                        <span className="font-semibold">능동적 학습 참여</span>
                                    </p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Brain className="h-8 w-8 text-blue-500 mb-3" />
                                    <p className="text-sm text-gray-600 text-center">
                                        AI 기반<br />
                                        <span className="font-semibold">개인화된 학습 지원</span>
                                    </p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Target className="h-8 w-8 text-green-500 mb-3" />
                                    <p className="text-sm text-gray-600 text-center">
                                        체계적인<br />
                                        <span className="font-semibold">학습 목표 달성</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section 
                id="stats"
                className={`relative z-10 py-20 px-6 bg-gradient-to-r from-red-50 via-white to-blue-50 transition-all duration-800 delay-200 ease-in-out ${
                    isStarting ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'
                }`}
            >
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        학습 혁신의 <span className="text-red-500">숫자로 보는 성과</span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
                        AI 기술로 더 효율적이고 스마트한 학습을 경험하세요
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-4xl font-bold text-red-500 mb-2">95%</div>
                            <div className="text-gray-600 font-medium">시간 절약</div>
                            <div className="text-sm text-gray-500 mt-2">기존 대비</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-4xl font-bold text-blue-500 mb-2">4가지</div>
                            <div className="text-gray-600 font-medium">요약 타입</div>
                            <div className="text-sm text-gray-500 mt-2">맞춤형 선택</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-4xl font-bold text-green-500 mb-2">24/7</div>
                            <div className="text-gray-600 font-medium">언제든지</div>
                            <div className="text-sm text-gray-500 mt-2">즉시 사용</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-4xl font-bold text-purple-500 mb-2">∞</div>
                            <div className="text-gray-600 font-medium">무제한</div>
                            <div className="text-sm text-gray-500 mt-2">요약 저장</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section 
                className={`relative z-10 py-20 px-6 bg-gradient-to-r from-red-500 via-red-600 to-red-700 transition-all duration-800 delay-300 ease-in-out ${
                    isStarting ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'
                }`}
            >
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        지금 바로 시작하세요!
                    </h2>
                    <p className="text-xl mb-10 opacity-90">
                        복잡한 유튜브 영상, 이제 AI가 깔끔하게 정리해드립니다
                    </p>
                    <button
                        onClick={handleStart}
                        disabled={isStarting}
                        className="group bg-white text-red-600 px-12 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 mx-auto disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <Users className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                        <span>무료로 시작하기</span>
                        <Award className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer 
                className={`relative z-10 bg-gray-900 text-gray-400 py-12 px-6 transition-all duration-800 delay-400 ease-in-out ${
                    isStarting ? 'opacity-0' : 'opacity-100'
                }`}
            >
                <div className="max-w-6xl mx-auto text-center">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                            <Play className="h-4 w-4 text-white fill-current" />
                        </div>
                        <span className="text-2xl font-bold text-white">YouSum</span>
                    </div>
                    <p className="text-gray-500 mb-4">
                        AI 기반 유튜브 영상 요약 및 학습 지원 플랫폼
                    </p>
                    <p className="text-sm text-gray-600">
                        © 2024 YouSum. All rights reserved. Made with ❤️ by YouSum Team
                    </p>
                </div>
            </footer>

            {/* Loading Overlay - 새로운 애니메이션 */}
            {isStarting && (
                <div className="fixed inset-0 bg-gradient-to-br from-red-500/20 via-white/95 to-blue-500/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-sm w-full mx-4 text-center transform scale-110 animate-pulse">
                        <div className="relative mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
                                <Play className="h-10 w-10 text-white fill-current" />
                            </div>
                            <div className="absolute inset-0 w-20 h-20 border-4 border-red-200 rounded-full animate-ping mx-auto"></div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">YouSum 시작하는 중...</h3>
                        <p className="text-gray-600 mb-4">AI가 당신의 학습을 준비하고 있어요</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animation-delay-6000 {
                    animation-delay: 6s;
                }
            `}</style>
        </div>
    );
} 