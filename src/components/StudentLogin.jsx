import { useState, useEffect } from 'react';
import { SessionManager, generateStudentId, saveCurrentUser } from '../utils/sessionManager';
import './StudentLogin.css';

function StudentLogin({ onLogin }) {
  const [accessCode, setAccessCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 실시간으로 세션 생성 감지 (오류 메시지가 있을 때만)
  useEffect(() => {
    if (!accessCode || accessCode.length !== 6 || !errorMessage) return;

    const checkSession = () => {
      const code = accessCode.trim().toUpperCase();
      // Try direct lookup first
      let session = SessionManager.getSession(code);
      
      // If not found, try searching all sessions
      if (!session) {
        session = SessionManager.findSessionByCode(code);
      }
      
      if (session && !isConnecting) {
        setErrorMessage('');
        // 세션이 발견되면 자동으로 접속 시도
        proceedWithLogin(code);
      }
    };

    // 세션 감지를 위한 polling
    const interval = setInterval(checkSession, 500);
    
    // storage 이벤트 리스너 (다른 탭에서 세션 생성 시)
    const handleStorage = (e) => {
      if (e.key && e.key.includes(accessCode.trim().toUpperCase())) {
        checkSession();
      }
    };
    
    // 커스텀 이벤트 리스너 (같은 탭에서 세션 생성 시)
    const handleSessionUpdate = (e) => {
      if (e.detail && e.detail.accessCode === accessCode.trim().toUpperCase()) {
        checkSession();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('sessionUpdate', handleSessionUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sessionUpdate', handleSessionUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessCode, errorMessage]);

  const handleConnect = () => {
    const code = accessCode.trim().toUpperCase();
    if (!code || code.length !== 6) {
      setErrorMessage('올바른 6자리 접속 코드를 입력해주세요');
      return;
    }

    setIsConnecting(true);
    setErrorMessage('');

    // 여러 번 재시도하는 로직
    let attempts = 0;
    const maxAttempts = 10; // 5초 동안 시도 (500ms * 10)
    
    const tryConnect = () => {
      // Try direct lookup first
      let session = SessionManager.getSession(code);
      
      // If not found, try searching all sessions
      if (!session) {
        console.log('Direct lookup failed, trying search...');
        session = SessionManager.findSessionByCode(code);
      }
      
      if (session) {
        console.log('✅ Session found, proceeding with login');
        proceedWithLogin(code);
      } else {
        attempts++;
        console.log(`Attempt ${attempts}/${maxAttempts} - Session not found for code: ${code}`);
        if (attempts < maxAttempts) {
          setTimeout(tryConnect, 500);
        } else {
          setIsConnecting(false);
          const debugInfo = SessionManager.debugListAllSessions();
          setErrorMessage(`세션을 찾을 수 없습니다. 접속 코드를 확인해주세요.\n코드: ${code}\n교사가 세션을 생성했는지 확인해주세요.\n\n브라우저 콘솔(F12)에서 자세한 정보를 확인할 수 있습니다.`);
        }
      }
    };

    // 즉시 한 번 시도
    tryConnect();
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
              onChange={(e) => {
                setAccessCode(e.target.value.toUpperCase());
                setErrorMessage(''); // 입력 시 오류 메시지 초기화
              }}
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

          {errorMessage && (
            <div className="error-message">
              <p>{errorMessage}</p>
              <button 
                className="btn-retry" 
                onClick={handleConnect}
                disabled={isConnecting}
              >
                다시 시도
              </button>
            </div>
          )}

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

