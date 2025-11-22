import { useState, useEffect } from 'react';
import { SessionManager, getCurrentUser } from '../utils/sessionManager';
import './Results.css';

function Results({ result, gameType, onRestart, onOtherGame, onHome }) {
  const [allResults, setAllResults] = useState([]);
  const user = getCurrentUser();

  useEffect(() => {
    // Get all results from session
    if (user?.sessionCode) {
      const results = SessionManager.getAllResults(user.sessionCode);
      setAllResults(results);
    }
  }, [user]);

  const calculateSpeed = (distance, time) => {
    if (time === 0) return 0;
    return (distance / time).toFixed(2);
  };

  const getRanking = () => {
    if (gameType === '100m') {
      // Rank by time (lower is better)
      return allResults
        .filter(r => r.results['100m'])
        .sort((a, b) => a.results['100m'].time - b.results['100m'].time)
        .map((r, idx) => ({ ...r, rank: idx + 1 }));
    } else {
      // Rank by distance (higher is better)
      return allResults
        .filter(r => r.results['10s'])
        .sort((a, b) => b.results['10s'].distance - a.results['10s'].distance)
        .map((r, idx) => ({ ...r, rank: idx + 1 }));
    }
  };

  const rankings = getRanking();
  const playerRank = rankings.findIndex(r => r.id === user?.studentId) + 1;

  const topThree = rankings.slice(0, 3);
  const playerRanking = rankings.find(r => r.id === user?.studentId);

  return (
    <div className="results-screen">
      <div className="container">
        <h1>🏆 시상식 🏆</h1>

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="podium-section">
            <h2>🏅 상위 3명 🏅</h2>
            <div className="podium">
              {topThree.map((ranking, idx) => {
                const rank = ranking.rank;
                const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
                const height = rank === 1 ? '100%' : rank === 2 ? '80%' : '60%';
                
                return (
                  <div key={ranking.id} className={`podium-item rank-${rank}`}>
                    <div className="podium-stand" style={{ height: height }}>
                      <div className="podium-rank">{rankEmoji}</div>
                      <div className="podium-name">{ranking.name}</div>
                      <div className="podium-result">
                        {gameType === '100m' ? (
                          <>{ranking.results['100m'].time.toFixed(2)}초</>
                        ) : (
                          <>{ranking.results['10s'].distance.toFixed(1)}m</>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* My Result */}
        {playerRanking && (
          <div className="result-summary">
            <h2>내 기록</h2>
            <div className="result-card player-result">
              <div className="result-value">
                <span className="label">순위:</span>
                <span className="value">
                  {playerRanking.rank === 1 ? '🥇 1등' : 
                   playerRanking.rank === 2 ? '🥈 2등' : 
                   playerRanking.rank === 3 ? '🥉 3등' : 
                   `${playerRanking.rank}등`}
                </span>
              </div>
              {gameType === '100m' ? (
                <>
                  <div className="result-value">
                    <span className="label">거리:</span>
                    <span className="value">{result.playerDistance}m</span>
                  </div>
                  <div className="result-value">
                    <span className="label">시간:</span>
                    <span className="value">{result.playerTime.toFixed(2)}초</span>
                  </div>
                  <div className="result-value">
                    <span className="label">속력:</span>
                    <span className="value">
                      {calculateSpeed(result.playerDistance, result.playerTime)} m/s
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="result-value">
                    <span className="label">거리:</span>
                    <span className="value">{result.playerDistance.toFixed(1)}m</span>
                  </div>
                  <div className="result-value">
                    <span className="label">시간:</span>
                    <span className="value">{result.playerTime}초</span>
                  </div>
                  <div className="result-value">
                    <span className="label">속력:</span>
                    <span className="value">
                      {calculateSpeed(result.playerDistance, result.playerTime)} m/s
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* All Rankings */}
        {rankings.length > 3 && (
          <div className="all-rankings">
            <h2>전체 순위</h2>
            <div className="rankings-list">
              {rankings.map((ranking) => {
                const isPlayer = ranking.id === user?.studentId;
                const rankEmoji = ranking.rank === 1 ? '🥇' : ranking.rank === 2 ? '🥈' : ranking.rank === 3 ? '🥉' : '';
                
                return (
                  <div key={ranking.id} className={`ranking-item ${isPlayer ? 'player' : ''}`}>
                    <div className="rank-number">
                      {rankEmoji} {ranking.rank}
                    </div>
                    <div className="rank-name">{ranking.name}</div>
                    <div className="rank-result">
                      {gameType === '100m' ? (
                        <>
                          {ranking.results['100m'].time.toFixed(2)}초
                          <span className="speed">
                            ({calculateSpeed(100, ranking.results['100m'].time)} m/s)
                          </span>
                        </>
                      ) : (
                        <>
                          {ranking.results['10s'].distance.toFixed(1)}m
                          <span className="speed">
                            ({calculateSpeed(ranking.results['10s'].distance, 10)} m/s)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="learning-section">
          <h2>📚 학습: 속력 계산</h2>
          <div className="formula-box">
            <p className="formula">
              <strong>속력 = 거리 ÷ 시간</strong>
            </p>
            {gameType === '100m' ? (
              <p className="example">
                예시: 100m를 {result.playerTime.toFixed(2)}초에 달렸다면,<br />
                속력 = 100m ÷ {result.playerTime.toFixed(2)}초 = {calculateSpeed(result.playerDistance, result.playerTime)} m/s
              </p>
            ) : (
              <p className="example">
                예시: 10초 동안 {result.playerDistance.toFixed(1)}m를 달렸다면,<br />
                속력 = {result.playerDistance.toFixed(1)}m ÷ 10초 = {calculateSpeed(result.playerDistance, result.playerTime)} m/s
              </p>
            )}
          </div>
        </div>

        <div className="result-buttons">
          <button className="btn-restart" onClick={onRestart}>
            🔄 다시 시작
          </button>
          <button className="btn-other" onClick={onOtherGame}>
            🎮 다른 게임
          </button>
          <button className="btn-home" onClick={onHome}>
            🏠 홈
          </button>
        </div>
      </div>
    </div>
  );
}

export default Results;

