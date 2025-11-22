import { useState, useEffect, useRef } from 'react';
import { KeyHandler } from '../utils/keyHandler';
import { SessionManager, getCurrentUser } from '../utils/sessionManager';
import { PLAYER_KEYS, MAX_PLAYERS, getKeyForPosition } from '../utils/keyMapping';
import './Race10s.css';

const ANIMALS = ['🐰', '🐱', '🐶', '🐹', '🐼', '🐨', '🐸', '🐯', '🦊', '🐻', 
                 '🐷', '🐮', '🐴', '🐭', '🐹', '🐨', '🐯', '🦁', '🐼', '🐻',
                 '🐰', '🐱', '🐶', '🐹', '🐼', '🐨', '🐸', '🐯', '🦊', '🐻'];

function Race10s({ sessionCode, onComplete }) {
  const [allStudents, setAllStudents] = useState([]);
  const [distances, setDistances] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [startTime, setStartTime] = useState(null);
  const [playerPosition, setPlayerPosition] = useState(null);
  const keyHandlerRef = useRef(null);
  const timerRef = useRef(null);
  const isRunningRef = useRef(false);
  const user = getCurrentUser();

  // Load all students and set up player position
  useEffect(() => {
    const session = SessionManager.getSession(sessionCode);
    if (session && user) {
      const students = session.students || [];
      setAllStudents(students);
      
      // Initialize distances for all students
      const initialDistances = {};
      students.forEach((student, idx) => {
        const pos = student.position !== null && student.position !== undefined 
          ? student.position 
          : idx;
        initialDistances[pos] = 0;
      });
      setDistances(initialDistances);
      
      // Find current user's position
      const student = students.find(s => s.id === user.studentId);
      if (student) {
        const pos = student.position !== null && student.position !== undefined 
          ? student.position 
          : students.indexOf(student);
        setPlayerPosition(pos);
        
        // Assign position if not set
        if (student.position === null || student.position === undefined) {
          let availablePos = 0;
          while (students.some(s => s.position === availablePos)) {
            availablePos++;
          }
          if (availablePos < MAX_PLAYERS) {
            SessionManager.addStudent(sessionCode, user.studentId, {
              name: user.nickname,
              position: availablePos
            });
            setPlayerPosition(availablePos);
          }
        }
      }
    }
  }, [sessionCode, user]);

  // Set up key handler and start countdown
  useEffect(() => {
    if (playerPosition === null || playerPosition === undefined) return;

    keyHandlerRef.current = new KeyHandler();
    const handler = keyHandlerRef.current;
    handler.start();

    const playerKey = getKeyForPosition(playerPosition);
    if (!playerKey) return;
    
    let currentStartTime = null;
    
    handler.onKey(playerKey, () => {
      if (!isRunningRef.current) return;
      
      setDistances(prev => {
        const newDistances = { ...prev };
        const pos = playerPosition;
        // Random distance between 0.8m and 1.2m
        const randomDistance = 0.8 + Math.random() * 0.4;
        newDistances[pos] = (newDistances[pos] || 0) + randomDistance;
        return newDistances;
      });
    });

    // Start countdown
    let count = 3;
    setCountdown(count);

    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else if (count === 0) {
        setCountdown('GO!');
        setTimeout(() => {
          setCountdown(null);
          isRunningRef.current = true;
          setIsRunning(true);
          currentStartTime = Date.now();
          setStartTime(currentStartTime);
          const endTime = currentStartTime + 10000; // 10 seconds

          timerRef.current = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
            setTimeRemaining(remaining);

            if (remaining === 0) {
              clearInterval(timerRef.current);
              isRunningRef.current = false;
              setIsRunning(false);
              
              // Get final distance and save result
              setDistances(prev => {
                const playerDistance = prev[playerPosition] || 0;
                
                if (user) {
                  SessionManager.saveStudentResult(sessionCode, user.studentId, '10s', {
                    distance: playerDistance,
                    time: 10
                  });
                }

                setTimeout(() => {
                  onComplete({
                    gameType: '10s',
                    playerDistance: playerDistance,
                    playerTime: 10,
                    finished: true,
                    position: playerPosition
                  });
                }, 2000);
                
                return prev;
              });
            }
          }, 100);
          
          clearInterval(countdownInterval);
        }, 500);
      }
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      handler.stop();
    };
  }, [playerPosition, sessionCode, user, onComplete]);


  const getAnimal = (index) => {
    return ANIMALS[index % ANIMALS.length];
  };

  return (
    <div className="race-10s-screen">
      <div className="container">
        <h1>10초 달리기</h1>
        
        {countdown && (
          <div className="countdown">{countdown === 'GO!' ? '시작!' : countdown}</div>
        )}

        {isRunning && (
          <div className="game-timer">
            <div className="timer-label">남은 시간</div>
            <div className="timer-value">{timeRemaining}초</div>
            {startTime && (
              <div className="elapsed-time">
                경과: {((Date.now() - startTime) / 1000).toFixed(2)}초
              </div>
            )}
          </div>
        )}

        <div className="race-track">
          <div className="track-line"></div>
          <div className="runners-grid">
            {allStudents.map((student, idx) => {
              const pos = student.position !== null && student.position !== undefined 
                ? student.position 
                : idx;
              const distance = distances[pos] || 0;
              const isPlayer = pos === playerPosition;
              
              return (
                <div
                  key={student.id}
                  className={`runner ${isPlayer ? 'player' : 'other'} ${isRunning ? 'running' : ''}`}
                  style={{ left: `${Math.min(100, (distance / 150) * 100)}%` }}
                >
                  <div className="animal">{getAnimal(pos)}</div>
                  <div className="runner-info">
                    <div className="runner-name">
                      {isPlayer ? user?.nickname || '나' : student.name || `플레이어 ${pos + 1}`}
                    </div>
                    <div className="distance">{distance.toFixed(1)}m</div>
                    <div className="player-key">키: <kbd>{getKeyForPosition(pos)}</kbd></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="controls">
          <div className="control-info">
            {playerPosition !== null && (
              <p>
                <strong>내 키:</strong> <kbd>{getKeyForPosition(playerPosition)}</kbd> - 연타하여 달리세요!
              </p>
            )}
            <p className="hint">한 번 누를 때마다 랜덤한 거리(0.8m - 1.2m)만큼 이동합니다</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Race10s;

