import { useState, useEffect } from 'react';
import './App.css';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import StudentLogin from './components/StudentLogin';
import GameSelection from './components/GameSelection';
import Race100m from './components/Race100m';
import Race10s from './components/Race10s';
import Results from './components/Results';
import Settings from './components/Settings';
import { getCurrentUser } from './utils/sessionManager';

function App() {
  const [currentScreen, setCurrentScreen] = useState('role-select');
  const [userRole, setUserRole] = useState(null);
  const [sessionCode, setSessionCode] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const user = getCurrentUser();
    if (user) {
      setUserRole(user.role);
      setSessionCode(user.sessionCode);
      if (user.role === 'admin') {
        setCurrentScreen('admin-panel');
      } else if (user.role === 'student') {
        setCurrentScreen('game-selection');
      }
    }
  }, []);

  const handleRoleSelect = (role) => {
    setUserRole(role);
    if (role === 'admin') {
      setCurrentScreen('admin-login');
    } else {
      setCurrentScreen('student-login');
    }
  };

  const handleAdminLogin = (code) => {
    setSessionCode(code);
    setCurrentScreen('admin-panel');
  };

  const handleStudentLogin = (code, studentId, nickname) => {
    setSessionCode(code);
    setCurrentScreen('game-selection');
  };

  const handleGameSelect = (gameType) => {
    setCurrentGame(gameType);
    if (gameType === '100m') {
      setCurrentScreen('race-100m');
    } else if (gameType === '10s') {
      setCurrentScreen('race-10s');
    }
  };

  const handleGameComplete = (result) => {
    setGameResult(result);
    setCurrentScreen('results');
  };

  const handleRestart = () => {
    setGameResult(null);
    if (currentGame === '100m') {
      setCurrentScreen('race-100m');
    } else if (currentGame === '10s') {
      setCurrentScreen('race-10s');
    }
  };

  const handleOtherGame = () => {
    setGameResult(null);
    setCurrentGame(null);
    setCurrentScreen('game-selection');
  };

  const handleHome = () => {
    setGameResult(null);
    setCurrentGame(null);
    setSessionCode(null);
    setUserRole(null);
    setCurrentScreen('role-select');
  };

  const handleSettings = () => {
    setCurrentScreen('settings');
  };

  const handleBackFromSettings = () => {
    setCurrentScreen('game-selection');
  };

  return (
    <div className="app">
      {currentScreen === 'role-select' && (
        <div className="role-select-screen">
          <div className="container">
            <h1>🐰 속력 학습 앱 🐰</h1>
            <p className="subtitle">초등학교 5학년 과학 체험 학습</p>
            <div className="role-buttons">
              <button className="role-btn admin-btn" onClick={() => handleRoleSelect('admin')}>
                👨‍🏫 교사/관리자
              </button>
              <button className="role-btn student-btn" onClick={() => handleRoleSelect('student')}>
                👨‍🎓 학생
              </button>
            </div>
          </div>
        </div>
      )}

      {currentScreen === 'admin-login' && (
        <AdminLogin onLogin={handleAdminLogin} />
      )}

      {currentScreen === 'admin-panel' && (
        <AdminPanel sessionCode={sessionCode} onLogout={handleHome} />
      )}

      {currentScreen === 'student-login' && (
        <StudentLogin onLogin={handleStudentLogin} />
      )}

      {currentScreen === 'game-selection' && (
        <GameSelection
          sessionCode={sessionCode}
          onGameSelect={handleGameSelect}
          onSettings={handleSettings}
          onLogout={handleHome}
        />
      )}

      {currentScreen === 'race-100m' && (
        <Race100m
          sessionCode={sessionCode}
          onComplete={handleGameComplete}
        />
      )}

      {currentScreen === 'race-10s' && (
        <Race10s
          sessionCode={sessionCode}
          onComplete={handleGameComplete}
        />
      )}

      {currentScreen === 'results' && (
        <Results
          result={gameResult}
          gameType={currentGame}
          onRestart={handleRestart}
          onOtherGame={handleOtherGame}
          onHome={handleHome}
        />
      )}

      {currentScreen === 'settings' && (
        <Settings
          sessionCode={sessionCode}
          onBack={handleBackFromSettings}
        />
      )}
    </div>
  );
}

export default App;
