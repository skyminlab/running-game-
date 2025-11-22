import { useState, useEffect, useRef } from 'react';
import { KeyHandler } from '../utils/keyHandler';
import { SessionManager, getCurrentUser } from '../utils/sessionManager';
import { PLAYER_KEYS, MAX_PLAYERS, getKeyForPosition } from '../utils/keyMapping';
import './Race100m.css';

const ANIMALS = ['🐰', '🐱', '🐶', '🐹', '🐼', '🐨', '🐸', '🐯', '🦊', '🐻', 
                 '🐷', '🐮', '🐴', '🐭', '🐹', '🐨', '🐯', '🦁', '🐼', '🐻',
                 '🐰', '🐱', '🐶', '🐹', '🐼', '🐨', '🐸', '🐯', '🦊', '🐻'];

function Race100m({ sessionCode, onComplete }) {
  const [allStudents, setAllStudents] = useState([]);
  const [distances, setDistances] = useState({});
  const [finished, setFinished] = useState({});
  const [finishTimes, setFinishTimes] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [playerPosition, setPlayerPosition] = useState(null);
  const keyHandlerRef = useRef(null);
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
      const initialFinished = {};
      const initialFinishTimes = {};
      
      students.forEach((student, idx) => {
        const pos = student.position !== null && student.position !== undefined 
          ? student.position 
          : idx;
        initialDistances[pos] = 0;
        initialFinished[pos] = false;
        initialFinishTimes[pos] = null;
      });
      
      setDistances(initialDistances);
      setFinished(initialFinished);
      setFinishTimes(initialFinishTimes);
      
      // Find current user's position
      const student = students.find(s => s.id === user.studentId);
      if (student) {
        const pos = student.position !== null && student.position !== undefined 
          ? student.position 
          : students.indexOf(student);
        setPlayerPosition(pos);
        
        // Assign position if not set
        if (student.position === null || student.position === undefined) {
          // Find first available position
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
        newDistances[pos] = (newDistances[pos] || 0) + 1;

        // Check if finished
        if (newDistances[pos] >= 100) {
          setFinished(prevFinished => {
            if (prevFinished[pos]) return prevFinished;
            return { ...prevFinished, [pos]: true };
          });
          
          setFinishTimes(prevTimes => {
            if (prevTimes[pos]) return prevTimes;
            const finishTime = Date.now() - currentStartTime;
            
            // Save result
            if (user) {
              SessionManager.saveStudentResult(sessionCode, user.studentId, '100m', {
                time: finishTime / 1000,
                distance: 100
              });
            }

            // Complete game for this player - auto move to results
            setTimeout(() => {
              isRunningRef.current = false;
              setIsRunning(false);
              onComplete({
                gameType: '100m',
                playerDistance: newDistances[pos],
                playerTime: finishTime / 1000,
                finished: true,
                position: pos
              });
            }, 2000);
            
            return { ...prevTimes, [pos]: finishTime };
          });
        }

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
          clearInterval(countdownInterval);
        }, 500);
      }
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      handler.stop();
    };
  }, [playerPosition, sessionCode, user, onComplete]);



  const getAnimal = (index) => {
    return ANIMALS[index % ANIMALS.length];
  };

  const getStudentByPosition = (pos) => {
    return allStudents.find(s => s.position === pos);
  };

  return (
    <div className="race-100m-screen">
      <div className="container">
        <h1>100m 달리기</h1>
        
        {countdown && (
          <div className="countdown">{countdown === 'GO!' ? '시작!' : countdown}</div>
        )}

        {isRunning && startTime && (
          <div className="game-timer">
            <div className="timer-label">경과 시간</div>
            <div className="timer-value">
              {((Date.now() - startTime) / 1000).toFixed(2)}초
            </div>
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
              const isFinished = finished[pos] || false;
              
              return (
                <div
                  key={student.id}
                  className={`runner ${isPlayer ? 'player' : 'other'} ${isRunning && !isFinished && distance < 100 ? 'running' : ''}`}
                  style={{ left: `${Math.min(100, (distance / 100) * 100)}%` }}
                >
                  <div className="animal">{getAnimal(pos)}</div>
                  <div className="runner-info">
                    <div className="runner-name">
                      {isPlayer ? user?.nickname || '나' : student.name || `플레이어 ${pos + 1}`}
                    </div>
                    <div className="distance">{distance}m</div>
                    <div className="player-key">키: <kbd>{getKeyForPosition(pos)}</kbd></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="finish-line">결승선 (100m)</div>
        </div>

        <div className="controls">
          <div className="control-info">
            {playerPosition !== null && (
              <p>
                <strong>내 키:</strong> <kbd>{getKeyForPosition(playerPosition)}</kbd> - 연타하여 달리세요!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Race100m;

