import { useState } from 'react';
import { generateSessionCode, SessionManager, saveCurrentUser } from '../utils/sessionManager';
import './AdminLogin.css';

function AdminLogin({ onLogin }) {
  const [accessCode, setAccessCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = () => {
    setIsCreating(true);
    const code = generateSessionCode();
    SessionManager.createSession(code);
    saveCurrentUser({ role: 'admin', sessionCode: code });
    setAccessCode(code);
    setIsCreating(false);
    setTimeout(() => {
      onLogin(code);
    }, 500);
  };

  const handleJoinSession = () => {
    const code = accessCode.trim().toUpperCase();
    if (!code || code.length !== 6) {
      alert('올바른 6자리 접속 코드를 입력해주세요');
      return;
    }

    const session = SessionManager.getSession(code);
    if (!session) {
      alert('세션을 찾을 수 없습니다. 접속 코드를 확인해주세요.');
      return;
    }

    saveCurrentUser({ role: 'admin', sessionCode: code });
    onLogin(code);
  };

  return (
    <div className="admin-login-screen">
      <div className="container">
        <h1>👨‍🏫 관리자 로그인</h1>
        <p className="subtitle">교사/관리자 접속</p>

        <div className="login-section">
          <h2>새 세션 만들기</h2>
          <button
            className="btn-primary create-btn"
            onClick={handleCreateSession}
            disabled={isCreating}
          >
            {isCreating ? '생성 중...' : '새 세션 만들기'}
          </button>
        </div>

        <div className="divider">또는</div>

        <div className="login-section">
          <h2>기존 세션 참여</h2>
          <div className="input-group">
            <label htmlFor="accessCode">접속 코드:</label>
            <input
              type="text"
              id="accessCode"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="6자리 코드 입력"
              maxLength={6}
              pattern="[A-Z0-9]+"
            />
            <button className="btn-primary" onClick={handleJoinSession}>
              세션 참여
            </button>
          </div>
        </div>

        <button className="btn-back" onClick={() => window.location.reload()}>
          ← 역할 선택으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;

