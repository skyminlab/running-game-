import { useState, useEffect } from 'react';
import { SessionManager, getCurrentUser, pollSession } from '../utils/sessionManager';
import './GameSelection.css';

function GameSelection({ sessionCode, onGameSelect, onSettings, onLogout }) {
  const [students, setStudents] = useState([]);
  const [broadcastMessage, setBroadcastMessage] = useState(null);
  const [gameState, setGameState] = useState(null);
  const user = getCurrentUser();

  useEffect(() => {
    // Load initial data
    updateData();

    // Poll for updates
    const poll = pollSession(sessionCode, updateData, 500);

    // Listen for storage events (cross-tab communication)
    const handleStorage = (e) => {
      if (e.key && e.key.includes(sessionCode)) {
        updateData();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(poll);
      window.removeEventListener('storage', handleStorage);
    };
  }, [sessionCode]);

  const updateData = () => {
    const session = SessionManager.getSession(sessionCode);
    if (session) {
      setStudents(session.students || []);
      setBroadcastMessage(session.broadcastMessage);
      setGameState(session.gameState);
    }
  };

  const handleGameClick = (gameType) => {
    // Check if teacher has started this game
    if (gameState && gameState.type === gameType && gameState.status === 'started') {
      onGameSelect(gameType);
    } else {
      // Show waiting message
      alert('교사님이 게임을 시작할 때까지 기다려주세요!');
    }
  };

  return (
    <div className="game-selection-screen">
      <div className="container">
        <div className="header-section">
          <h1>게임 선택</h1>
          <div className="user-info">
            <span>👤 {user?.nickname || '학생'}</span>
            <button className="btn-settings" onClick={onSettings}>
              ⚙️ 설정
            </button>
          </div>
        </div>

        {broadcastMessage && (
          <div className="broadcast-message">
            <p>📢 {broadcastMessage.text}</p>
          </div>
        )}

        {gameState && gameState.status === 'waiting' && (
          <div className="waiting-message">
            <p>⏳ 교사님이 게임을 시작할 때까지 기다려주세요...</p>
            <p className="game-info">게임: {gameState.type === '100m' ? '100m 달리기' : '10초 달리기'}</p>
          </div>
        )}

        <div className="game-cards">
          <div
            className={`game-card ${gameState?.type === '100m' && gameState?.status === 'started' ? 'active' : ''}`}
            onClick={() => handleGameClick('100m')}
          >
            <div className="animal-icon">🏃</div>
            <h2>100m 달리기</h2>
            <p>일정한 거리(100m)를 이동하는 시간으로 빠르기를 비교합니다</p>
            <p className="game-info">100m를 누가 가장 빨리 달릴까요?</p>
            {gameState?.type === '100m' && gameState?.status === 'started' && (
              <div className="game-status">게임 시작! 클릭하여 참여하세요</div>
            )}
          </div>

          <div
            className={`game-card ${gameState?.type === '10s' && gameState?.status === 'started' ? 'active' : ''}`}
            onClick={() => handleGameClick('10s')}
          >
            <div className="animal-icon">⏱️</div>
            <h2>10초 달리기</h2>
            <p>정해진 시간(10초) 동안 이동한 거리로 빠르기를 비교합니다</p>
            <p className="game-info">10초 동안 누가 가장 멀리 갈까요?</p>
            {gameState?.type === '10s' && gameState?.status === 'started' && (
              <div className="game-status">게임 시작! 클릭하여 참여하세요</div>
            )}
          </div>
        </div>

        <div className="connected-students">
          <h3>접속한 학생 ({students.length}명)</h3>
          <div className="student-list">
            {students.length === 0 ? (
              <p className="empty">아직 접속한 학생이 없습니다</p>
            ) : (
              students.map((student) => (
                <span key={student.id} className="student-badge">
                  {student.name}
                </span>
              ))
            )}
          </div>
        </div>

        <button className="btn-logout" onClick={onLogout}>
          🏠 홈
        </button>
      </div>
    </div>
  );
}

export default GameSelection;

