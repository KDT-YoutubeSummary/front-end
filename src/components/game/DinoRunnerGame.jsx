import React, { useState, useEffect, useRef, useCallback } from 'react';

const DinoRunnerGame = ({ onComplete, onBack, onSwitchGame, summaryComplete = false }) => {
  // 게임 상태
  const [gameState, setGameState] = useState('playing'); // 'playing', 'gameOver', 'summaryComplete'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('dinoHighScore')) || 0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  
  // 공룡 상태
  const [dinoPosition, setDinoPosition] = useState(0); // 0이 땅, 양수가 점프 높이
  const [isJumping, setIsJumping] = useState(false);
  const [velocityY, setVelocityY] = useState(0);
  
  // 장애물 상태
  const [obstacles, setObstacles] = useState([]);
  
  // 게임 설정
  const GRAVITY = 0.6; // 중력을 더 줄여서 더욱 부드럽게
  const JUMP_FORCE = -12; // 점프력을 조정하여 더 자연스러운 점프
  const GAME_SPEED = 3;
  const gameAreaWidth = 800;
  const gameAreaHeight = 200;
  const dinoWidth = 40;
  const dinoHeight = 40;
  const obstacleWidth = 20;
  const obstacleHeight = 40;
  const groundY = gameAreaHeight - 60;
  const jumpHeight = 120;
  
  // refs
  const gameLoopRef = useRef();
  const lastObstacleRef = useRef(0);
  const frameCountRef = useRef(0);

  // 점프 함수
  const jump = useCallback(() => {
    if (!isJumping && dinoPosition >= groundY) {
      setIsJumping(true);
      setVelocityY(JUMP_FORCE);
    }
  }, [isJumping, dinoPosition, groundY, JUMP_FORCE]);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'gameOver') {
          restartGame();
        } else {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump, gameState]);

  // 새로운 장애물 생성
  const spawnObstacle = useCallback(() => {
    const now = Date.now();
    // 장애물 생성 간격 (속도에 따라 조정)
    const spawnInterval = Math.max(1000 - (GAME_SPEED - 2) * 100, 400);
    
    if (now - lastObstacleRef.current > spawnInterval) {
      const newObstacle = {
        id: now,
        x: gameAreaWidth,
        y: groundY - obstacleHeight,
        width: obstacleWidth,
        height: obstacleHeight
      };
      
      setObstacles(prev => [...prev, newObstacle]);
      lastObstacleRef.current = now;
    }
  }, [GAME_SPEED, gameAreaWidth, groundY, obstacleWidth, obstacleHeight]);

  // 충돌 감지
  const checkCollisions = useCallback(() => {
    const dinoX = 100;
    const dinoY = groundY - dinoHeight - dinoPosition;
    
    for (let obstacle of obstacles) {
      // AABB 충돌 감지
      if (
        dinoX < obstacle.x + obstacle.width &&
        dinoX + dinoWidth > obstacle.x &&
        dinoY < obstacle.y + obstacle.height &&
        dinoY + dinoHeight > obstacle.y
      ) {
        return true;
      }
    }
    return false;
  }, [obstacles, dinoPosition, groundY, dinoHeight, dinoWidth, obstacleWidth, obstacleHeight]);

  // 게임 오버 처리
  const gameOver = useCallback(() => {
    setGameState('gameOver');
    
    // 최고 점수 확인
    if (score > highScore) {
      setHighScore(score);
      setIsNewRecord(true);
      localStorage.setItem('dinoHighScore', score.toString());
    }
    
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, [score, highScore]);

  // 게임 재시작
  const restartGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setDinoPosition(0);
    setIsJumping(false);
    setObstacles([]);
    setVelocityY(0);
    setIsNewRecord(false);
    frameCountRef.current = 0;
    lastObstacleRef.current = 0;
  }, []);

  // 요약 완료 확인
  useEffect(() => {
    if (summaryComplete && gameState === 'playing') {
      setGameState('summaryComplete');
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }
  }, [summaryComplete, gameState]);

  // 게임 리셋
  const resetGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setDinoPosition(groundY);
    setIsJumping(false);
    setObstacles([]);
    setVelocityY(0);
    setIsNewRecord(false);
    frameCountRef.current = 0;
    lastObstacleRef.current = 0;
  }, [groundY]);

  // 메인 게임 루프
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      frameCountRef.current++;
      
      // 장애물 이동
      setObstacles(prev => 
        prev
          .map(obstacle => ({ ...obstacle, x: obstacle.x - GAME_SPEED }))
          .filter(obstacle => obstacle.x + obstacle.width > 0)
      );
      
      // 새 장애물 생성
      spawnObstacle();
      
      // 점수 증가 (60프레임마다 1점)
      if (frameCountRef.current % 60 === 0) {
        setScore(prev => prev + 1);
      }
      
      // 게임 속도 증가 (300점마다)
      if (frameCountRef.current % 300 === 0) {
        setGameSpeed(prev => Math.min(prev + 0.2, 8));
      }
      
      // 충돌 감지
      if (checkCollisions()) {
        gameOver();
        return;
      }
      
      // 물리 업데이트
      setDinoPosition(prevY => {
        let newY = prevY + velocityY;
        let newVelocityY = velocityY;
        
        if (newY < groundY) {
          // 공중에 있을 때
          newVelocityY += GRAVITY;
        } else {
          // 지면에 닿았을 때
          newY = groundY;
          newVelocityY = 0;
          setIsJumping(false);
        }
        
        setVelocityY(newVelocityY);
        return newY;
      });
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, GAME_SPEED, spawnObstacle, checkCollisions, gameOver, velocityY, GRAVITY, groundY]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
        {/* 게임 정보 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-6">
            <div className="text-lg font-semibold">
              점수: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold">
              최고 점수: <span className="text-purple-600">{highScore}</span>
              {isNewRecord && <span className="text-red-500 ml-2">🎉 신기록!</span>}
            </div>
            <div className="text-sm text-gray-600">
              속도: {GAME_SPEED.toFixed(1)}x
            </div>
          </div>
          
          {gameState === 'summaryComplete' && (
            <div className="text-green-600 font-semibold">
              ✅ 요약 완료!
            </div>
          )}
        </div>

        {/* 게임 화면 */}
        <div 
          className="relative border-2 border-gray-300 mx-auto"
          style={{ 
            width: gameAreaWidth, 
            height: gameAreaHeight, 
            backgroundColor: '#f0f8ff',
            overflow: 'hidden'
          }}
        >
          {/* 배경 (움직이는 구름들) */}
          <div className="absolute inset-0">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl opacity-30"
                style={{
                  left: `${20 + i * 300 - (frameCountRef.current * 0.5) % 900}px`,
                  top: `${20 + i * 20}px`,
                  animation: 'none'
                }}
              >
                ☁️
              </div>
            ))}
          </div>

          {/* 땅 */}
          <div 
            className="absolute w-full bg-green-300 border-t-2 border-green-400"
            style={{ 
              bottom: 0, 
              height: 60,
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 11px)'
            }}
          />

          {/* 공룡 */}
          <div
            className="absolute transition-none"
            style={{
              left: 100,
              bottom: 60 + dinoPosition,
              width: dinoWidth,
              height: dinoHeight,
              fontSize: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: isJumping ? 'scaleX(-1) rotate(-10deg)' : 'scaleX(-1)',
              transition: isJumping ? 'transform 0.1s' : 'none'
            }}
          >
            🦕
          </div>

          {/* 장애물들 */}
          {obstacles.map(obstacle => (
            <div
              key={obstacle.id}
              className="absolute"
              style={{
                left: obstacle.x,
                bottom: 60,
                width: obstacle.width,
                height: obstacle.height,
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              🌵
            </div>
          ))}

          {/* 게임 오버 오버레이 */}
          {gameState === 'gameOver' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-2">게임 오버!</h2>
                <p className="text-lg mb-2">점수: {score}</p>
                {isNewRecord && (
                  <p className="text-purple-600 font-semibold mb-2">🎉 신기록 달성!</p>
                )}
                <p className="text-sm text-gray-600 mb-4">
                  스페이스바 또는 ↑ 키를 눌러 다시 시작
                </p>
                <button
                  onClick={restartGame}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  다시 시작
                </button>
              </div>
            </div>
          )}

          {/* 요약 완료 오버레이 */}
          {gameState === 'summaryComplete' && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 text-center">
                <h2 className="text-2xl font-bold text-green-600 mb-2">요약 완료!</h2>
                <p className="text-lg mb-2">최종 점수: {score}</p>
                <p className="text-sm text-gray-600 mb-4">
                  요약이 완료되어 게임이 종료되었습니다.
                </p>
                <button
                  onClick={() => onComplete && onComplete()}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  요약 보러 가기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 조작 안내 */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>🎮 스페이스바 또는 ↑ 키를 눌러 점프하세요!</p>
          <p>🌵 선인장을 피하며 최대한 오래 달려보세요!</p>
        </div>
        
        {/* 게임 전환 버튼 */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => onBack && onBack()}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-600 transition-colors"
          >
            뒤로가기
          </button>
          <button
            onClick={() => onSwitchGame && onSwitchGame('typing')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <span>⌨️</span>
            <span>타자 게임하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DinoRunnerGame; 