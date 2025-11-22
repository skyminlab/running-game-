import { useState, useEffect } from 'react';
import { SessionManager, getCurrentUser, saveCurrentUser } from '../utils/sessionManager';
import './Settings.css';

function Settings({ sessionCode, onBack }) {
  const [nickname, setNickname] = useState('');
  const user = getCurrentUser();

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
    }
  }, [user]);

  const handleSave = () => {
    const newNickname = nickname.trim();
    if (!newNickname) {
      alert('닉네임을 입력해주세요');
      return;
    }

    if (user) {
      // Update in session
      SessionManager.addStudent(sessionCode, user.studentId, {
        name: newNickname,
        position: user.position
      });

      // Update in current user
      saveCurrentUser({
        ...user,
        nickname: newNickname
      });

      alert('닉네임이 업데이트되었습니다!');
      onBack();
    }
  };

  return (
    <div className="settings-screen">
      <div className="container">
        <h1>⚙️ 설정</h1>

        <div className="settings-form">
          <div className="input-group">
            <label htmlFor="nickname">닉네임:</label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              maxLength={15}
            />
          </div>

          <div className="settings-buttons">
            <button className="btn-primary" onClick={handleSave}>
              💾 저장
            </button>
            <button className="btn-secondary" onClick={onBack}>
              ← 뒤로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

