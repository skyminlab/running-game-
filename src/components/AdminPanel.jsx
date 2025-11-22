import { useState, useEffect } from 'react';
import { SessionManager, pollSession } from '../utils/sessionManager';
import './AdminPanel.css';

function AdminPanel({ sessionCode, onLogout }) {
  const [students, setStudents] = useState([]);
  const [broadcastText, setBroadcastText] = useState('');
  const [allResults, setAllResults] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);

  useEffect(() => {
    updateData();

    const poll = pollSession(sessionCode, updateData, 500);
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
      setAllResults(SessionManager.getAllResults(sessionCode));
    }
  };

  const handleBroadcast = () => {
    if (broadcastText.trim()) {
      SessionManager.broadcastMessage(sessionCode, broadcastText);
      setBroadcastText('');
    }
  };

  const handleStartGame = (gameType) => {
    SessionManager.setGameState(sessionCode, {
      type: gameType,
      status: 'started',
      startTime: Date.now()
    });
    SessionManager.broadcastMessage(sessionCode, `게임 시작: ${gameType === '100m' ? '100m 달리기' : '10초 달리기'}!`);
    setCurrentGame(gameType);
  };

  const handleResetGame = () => {
    SessionManager.setGameState(sessionCode, null);
    SessionManager.broadcastMessage(sessionCode, '게임이 리셋되었습니다. 게임 선택 화면으로 돌아가주세요.');
    setCurrentGame(null);
  };

  const handleResetStudents = () => {
    if (confirm('모든 학생의 진행 상황을 초기화하시겠습니까?')) {
      students.forEach(student => {
        SessionManager.removeStudent(sessionCode, student.id);
      });
      SessionManager.createSession(sessionCode);
      updateData();
    }
  };

  return (
    <div className="admin-panel-screen">
      <div className="container">
        <div className="header-section">
          <h1>👨‍🏫 관리자 패널</h1>
          <div className="session-info">
            <div className="code-display">
              <label>접속 코드:</label>
              <div className="code-value">{sessionCode}</div>
              <button
                className="btn-copy"
                onClick={() => {
                  navigator.clipboard.writeText(sessionCode);
                  alert('코드가 클립보드에 복사되었습니다!');
                }}
              >
                📋 복사
              </button>
            </div>
          </div>
        </div>

        <div className="admin-section">
          <h2>📢 공지 메시지</h2>
          <div className="broadcast-controls">
            <input
              type="text"
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="모든 학생에게 보낼 메시지를 입력하세요..."
              onKeyPress={(e) => e.key === 'Enter' && handleBroadcast()}
            />
            <button className="btn-primary" onClick={handleBroadcast}>
              메시지 보내기
            </button>
          </div>
        </div>

        <div className="admin-section">
          <h2>🎮 게임 시작</h2>
          <div className="game-controls">
            <button
              className="btn-game-start"
              onClick={() => handleStartGame('100m')}
            >
              🏃 100m 달리기 시작
            </button>
            <button
              className="btn-game-start"
              onClick={() => handleStartGame('10s')}
            >
              ⏱️ 10초 달리기 시작
            </button>
            {currentGame && (
              <button className="btn-reset" onClick={handleResetGame}>
                게임 리셋
              </button>
            )}
          </div>
        </div>

        <div className="admin-section">
          <h2>👥 접속한 학생 ({students.length}명)</h2>
          <div className="student-list">
            {students.length === 0 ? (
              <p className="empty">아직 접속한 학생이 없습니다</p>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>상태</th>
                    <th>결과</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>접속 중</td>
                      <td>
                        {student.results ? (
                          <div className="results-summary">
                            {student.results['100m'] && (
                              <span>100m: {student.results['100m'].time?.toFixed(2)}초</span>
                            )}
                            {student.results['10s'] && (
                              <span>10초: {student.results['10s'].distance?.toFixed(1)}m</span>
                            )}
                          </div>
                        ) : (
                          <span className="no-results">결과 없음</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <button className="btn-reset" onClick={handleResetStudents}>
            모든 학생 초기화
          </button>
        </div>

        <div className="admin-section">
          <h2>📊 전체 결과</h2>
          {allResults.length === 0 ? (
            <p className="empty">아직 결과가 없습니다</p>
          ) : (
            <div className="results-grid">
              {allResults.map((result) => (
                <div key={result.id} className="result-card">
                  <h3>{result.name}</h3>
                  {result.results['100m'] && (
                    <div className="result-item">
                      <strong>100m 달리기:</strong> {result.results['100m'].time?.toFixed(2)}초
                    </div>
                  )}
                  {result.results['10s'] && (
                    <div className="result-item">
                      <strong>10초 달리기:</strong> {result.results['10s'].distance?.toFixed(1)}m
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn-logout" onClick={onLogout}>
          🏠 로그아웃
        </button>
      </div>
    </div>
  );
}

export default AdminPanel;

