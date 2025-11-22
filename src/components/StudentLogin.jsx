import { useState } from 'react';
import { SessionManager, generateStudentId, saveCurrentUser } from '../utils/sessionManager';
import './StudentLogin.css';

function StudentLogin({ onLogin }) {
  const [accessCode, setAccessCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    const code = accessCode.trim().toUpperCase();
    if (!code || code.length !== 6) {
      alert('올바른 6자리 접속 코드를 입력해주세요');
      return;
    }

    // Check if session exists, if not wait a bit and retry (for timing issues)
    let session = SessionManager.getSession(code);
    if (!session) {
      // Wait a bit and retry once
      setTimeout(() => {
        session = SessionManager.getSession(code);
        if (!session) {
          alert('세션을 찾을 수 없습니다. 접속 코드를 확인해주세요. 교사가 세션을 생성했는지 확인해주세요.');
          setIsConnecting(false);
          return;
        }
        proceedWithLogin(code);
      }, 200);
      return;
    }

    proceedWithLogin(code);
  };

  const proceedWithLogin = (code) => {
    setIsConnecting(true);

    // Generate student ID and add to session
    const studentId = generateStudentId();
    const studentName = nickname.trim() || `학생 ${studentId.slice(-4)}`;

    SessionManager.addStudent(code, studentId, {
      name: studentName,
      position: null
    });

    saveCurrentUser({
      role: 'student',
      sessionCode: code,
      studentId: studentId,
      nickname: studentName
    });

    // Force sync
    SessionManager.syncSession(code);

    setTimeout(() => {
      setIsConnecting(false);
      onLogin(code, studentId, studentName);
    }, 300);
  };

  return (
    <div className="student-login-screen">
      <div className="container">
        <h1>🐰 속력 학습 앱 🐰</h1>
        <p className="subtitle">접속 코드를 입력하여 참여하세요</p>

        <div className="login-form">
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
          </div>

          <div className="input-group">
            <label htmlFor="nickname">닉네임 (선택사항):</label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="이름을 입력하세요"
              maxLength={15}
            />
            <p className="hint">비워두면 기본 이름이 할당됩니다</p>
          </div>

          <button
            className="btn-primary"
            onClick={handleConnect}
            disabled={isConnecting || !accessCode}
          >
            {isConnecting ? '접속 중...' : '세션 참여'}
          </button>
        </div>

        <button className="btn-back" onClick={() => window.location.reload()}>
          ← 역할 선택으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default StudentLogin;

