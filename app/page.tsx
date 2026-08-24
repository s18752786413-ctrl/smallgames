'use client';

import { useEffect, useMemo, useState } from 'react';

type Player = { id: number; name: string; chats: number; supports: number };
type ChasePlayer = { id: number; name: string; normalScore: number; boostScore: number; boostTool: string };
type GameType = 'newcomer' | 'chase';

const defaultPlayers: Player[] = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1, name: '', chats: 0, supports: 0,
}));

const defaultChasePlayers: ChasePlayer[] = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1, name: '', normalScore: 0, boostScore: 0, boostTool: '',
}));

function clamp(value: number) {
  return Math.max(0, Math.min(999, Number.isFinite(value) ? value : 0));
}

function Counter({ value, label, onChange }: { value: number; label: string; onChange: (next: number) => void }) {
  return (
    <div className="counter">
      <button type="button" aria-label={`${label}减一`} onClick={() => onChange(clamp(value - 1))}>−</button>
      <input aria-label={label} inputMode="numeric" min="0" max="999" type="number" value={value}
        onChange={(event) => onChange(clamp(Number(event.target.value)))} />
      <button type="button" aria-label={`${label}加一`} onClick={() => onChange(clamp(value + 1))}>＋</button>
    </div>
  );
}

export default function Home() {
  const [activeGame, setActiveGame] = useState<GameType>('newcomer');
  const [players, setPlayers] = useState<Player[]>(defaultPlayers);
  const [chasePlayers, setChasePlayers] = useState<ChasePlayer[]>(defaultChasePlayers);
  const [loaded, setLoaded] = useState(false);
  const [gameMenuOpen, setGameMenuOpen] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);
  const [chaseVisibleCount, setChaseVisibleCount] = useState(3);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('newcomer-game-players');
      if (saved) setPlayers(JSON.parse(saved));
      const savedVisibleCount = Number(window.localStorage.getItem('newcomer-game-visible-count'));
      if (savedVisibleCount >= 1 && savedVisibleCount <= 8) setVisibleCount(savedVisibleCount);
      const savedChasePlayers = window.localStorage.getItem('chase-game-players');
      if (savedChasePlayers) setChasePlayers(JSON.parse(savedChasePlayers));
      const savedChaseVisibleCount = Number(window.localStorage.getItem('chase-game-visible-count'));
      if (savedChaseVisibleCount >= 1 && savedChaseVisibleCount <= 8) setChaseVisibleCount(savedChaseVisibleCount);
    } catch {
      // 本地记录不可用时继续使用空白表，不影响现场计分。
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem('newcomer-game-players', JSON.stringify(players));
    window.localStorage.setItem('newcomer-game-visible-count', String(visibleCount));
    window.localStorage.setItem('chase-game-players', JSON.stringify(chasePlayers));
    window.localStorage.setItem('chase-game-visible-count', String(chaseVisibleCount));
  }, [players, visibleCount, chasePlayers, chaseVisibleCount, loaded]);

  useEffect(() => {
    if (!isTimerRunning) return;
    const timerId = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timerId);
          setIsTimerRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [isTimerRunning]);

  const scores = useMemo(() => players.map((player) => player.chats * 2 + player.supports * 10), [players]);
  const visiblePlayers = players.slice(0, visibleCount);
  const activeIndexes = visiblePlayers.map((player, index) => player.name.trim() ? index : -1).filter((index) => index >= 0);
  const lowestScore = activeIndexes.length ? Math.min(...activeIndexes.map((index) => scores[index])) : null;
  const lowestNames = activeIndexes.filter((index) => scores[index] === lowestScore).map((index) => players[index].name.trim());
  const chaseScores = useMemo(() => chasePlayers.map((player) => player.normalScore + player.boostScore * 2), [chasePlayers]);
  const visibleChasePlayers = chasePlayers.slice(0, chaseVisibleCount);
  const activeChaseIndexes = visibleChasePlayers.map((player, index) => player.name.trim() ? index : -1).filter((index) => index >= 0);
  const lowestChaseScore = activeChaseIndexes.length ? Math.min(...activeChaseIndexes.map((index) => chaseScores[index])) : null;
  const lowestChaseNames = activeChaseIndexes.filter((index) => chaseScores[index] === lowestChaseScore).map((index) => chasePlayers[index].name.trim());

  function updatePlayer(id: number, patch: Partial<Player>) {
    setPlayers((current) => current.map((player) => player.id === id ? { ...player, ...patch } : player));
  }

  function updateChasePlayer(id: number, patch: Partial<ChasePlayer>) {
    setChasePlayers((current) => current.map((player) => player.id === id ? { ...player, ...patch } : player));
  }

  function selectGame(game: GameType) {
    setActiveGame(game);
    setGameMenuOpen(false);
    setIsTimerRunning(false);
    const suggestedMinutes = game === 'chase' ? 50 : 5;
    setTimerMinutes(suggestedMinutes);
    setTimerSeconds(0);
    setRemainingSeconds(suggestedMinutes * 60);
  }

  function resetGame() {
    if (!window.confirm('确认清空本轮全部拍档名和积分吗？')) return;
    if (activeGame === 'chase') setChasePlayers(defaultChasePlayers);
    else setPlayers(defaultPlayers);
  }

  const currentVisibleCount = activeGame === 'chase' ? chaseVisibleCount : visibleCount;
  const currentLowestScore = activeGame === 'chase' ? lowestChaseScore : lowestScore;
  const currentLowestNames = activeGame === 'chase' ? lowestChaseNames : lowestNames;

  const configuredTimerSeconds = timerMinutes * 60 + timerSeconds;
  const timerDisplayMinutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
  const timerDisplaySeconds = (remainingSeconds % 60).toString().padStart(2, '0');

  function updateTimer(minutes: number, seconds: number) {
    const nextMinutes = Math.max(0, Math.min(99, Number.isFinite(minutes) ? minutes : 0));
    const nextSeconds = Math.max(0, Math.min(59, Number.isFinite(seconds) ? seconds : 0));
    setTimerMinutes(nextMinutes);
    setTimerSeconds(nextSeconds);
    if (!isTimerRunning) setRemainingSeconds(nextMinutes * 60 + nextSeconds);
  }

  function toggleTimer() {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      return;
    }
    if (remainingSeconds === 0) setRemainingSeconds(configuredTimerSeconds);
    if (configuredTimerSeconds > 0) setIsTimerRunning(true);
  }

  function resetTimer() {
    setIsTimerRunning(false);
    setRemainingSeconds(configuredTimerSeconds);
  }

  return (
    <main className={`app-shell ${gameMenuOpen ? 'menu-open' : 'menu-closed'}`}>
      <aside className="game-nav" aria-label="游戏选择" aria-hidden={!gameMenuOpen}>
        <div className="brand-mark">甜</div>
        <div className="nav-title">互动游戏</div>
        <button className={`game-item ${activeGame === 'newcomer' ? 'active' : ''}`} type="button" onClick={() => selectGame('newcomer')} tabIndex={gameMenuOpen ? 0 : -1}>
          <span className="game-icon">新</span><span>拉新互动</span>
        </button>
        <button className={`game-item ${activeGame === 'chase' ? 'active' : ''}`} type="button" onClick={() => selectGame('chase')} tabIndex={gameMenuOpen ? 0 : -1}>
          <span className="game-icon">追</span><span>追分互动</span>
        </button>
        <div className="autosave"><span /> 本机自动保存</div>
      </aside>

      <section className="game-stage">
        <header className="topbar">
          <div className="title-group">
            {!gameMenuOpen && <button className="choose-game-button" type="button" onClick={() => setGameMenuOpen(true)} aria-label="打开游戏选择菜单">☰ <span>选择游戏</span></button>}
            <div><p className="eyebrow">{activeGame === 'chase' ? 'CHASE · INTERACTION' : 'NEWCOMER · INTERACTION'}</p><h1>{activeGame === 'chase' ? '追分互动小游戏' : '拉新互动小游戏'}</h1></div>
          </div>
          <div className="top-actions">
            <div className="mic-controls" aria-label="麦位数量控制">
              <button type="button" onClick={() => activeGame === 'chase' ? setChaseVisibleCount((count) => Math.max(1, count - 1)) : setVisibleCount((count) => Math.max(1, count - 1))} disabled={currentVisibleCount === 1} aria-label="减少一个麦位">−</button>
              <span><b>{currentVisibleCount}</b>/8麦</span>
              <button type="button" onClick={() => activeGame === 'chase' ? setChaseVisibleCount((count) => Math.min(8, count + 1)) : setVisibleCount((count) => Math.min(8, count + 1))} disabled={currentVisibleCount === 8}>＋ 添加麦位</button>
            </div>
            {activeGame === 'chase' ? <>
              <div className="rule-chip"><b>×1</b> 普通</div>
              <div className="rule-chip support"><b>×2</b> 加速</div>
            </> : <>
              <div className="rule-chip"><b>＋2</b> 交流</div>
              <div className="rule-chip support"><b>＋10</b> 支持</div>
            </>}
            <button className="reset-button" type="button" onClick={resetGame}>重开一局</button>
          </div>
        </header>

        <div className="content-grid">
          <section className={`scoreboard ${activeGame === 'chase' ? 'chase-scoreboard' : ''}`} aria-label="拍档积分榜">
            {activeGame === 'chase' ? <>
              <div className="table-head chase-grid"><span>麦位</span><span>拍档名</span><span>总分</span><span>普通分数</span><span>加速分数</span><span>加速工具</span></div>
              <div className="player-list" style={{ gridTemplateRows: `repeat(${chaseVisibleCount}, minmax(48px, 1fr))` }}>
                {visibleChasePlayers.map((player, index) => {
                  const isLowest = Boolean(player.name.trim()) && chaseScores[index] === lowestChaseScore;
                  return <div className={`player-row chase-grid ${isLowest ? 'lowest' : ''}`} key={player.id}>
                    <div className="mic-seat"><span>{player.id}</span>麦</div>
                    <input className="name-input" aria-label={`${player.id}麦拍档名`} maxLength={12} placeholder="填写拍档名" value={player.name} onChange={(event) => updateChasePlayer(player.id, { name: event.target.value })} />
                    <div className="score"><strong>{chaseScores[index]}</strong><small>分</small></div>
                    <Counter label={`${player.id}麦普通分数`} value={player.normalScore} onChange={(normalScore) => updateChasePlayer(player.id, { normalScore })} />
                    <Counter label={`${player.id}麦加速分数`} value={player.boostScore} onChange={(boostScore) => updateChasePlayer(player.id, { boostScore })} />
                    <input className="tool-input" aria-label={`${player.id}麦加速工具`} maxLength={16} placeholder="填写加速工具" value={player.boostTool} onChange={(event) => updateChasePlayer(player.id, { boostTool: event.target.value })} />
                  </div>;
                })}
              </div>
            </> : <>
              <div className="table-head"><span>麦位</span><span>拍档名</span><span>总积分</span><span>交流人数</span><span>支持人数</span></div>
              <div className="player-list" style={{ gridTemplateRows: `repeat(${visibleCount}, minmax(48px, 1fr))` }}>
                {visiblePlayers.map((player, index) => {
                const isLowest = Boolean(player.name.trim()) && scores[index] === lowestScore;
                return (
                  <div className={`player-row ${isLowest ? 'lowest' : ''}`} key={player.id}>
                    <div className="mic-seat"><span>{player.id}</span>麦</div>
                    <input className="name-input" aria-label={`${player.id}麦拍档名`} maxLength={12} placeholder="填写拍档名"
                      value={player.name} onChange={(event) => updatePlayer(player.id, { name: event.target.value })} />
                    <div className="score"><strong>{scores[index]}</strong><small>分</small></div>
                    <Counter label={`${player.id}麦交流人数`} value={player.chats} onChange={(chats) => updatePlayer(player.id, { chats })} />
                    <Counter label={`${player.id}麦支持人数`} value={player.supports} onChange={(supports) => updatePlayer(player.id, { supports })} />
                  </div>
                );
              })}
              </div>
            </>}
          </section>

          <aside className="side-panel">
            <section className={`result-card ${currentLowestNames.length ? 'has-result' : ''}`}>
              <div className="result-label">{activeGame === 'chase' ? '跑得最慢' : '本轮最低分'}</div>
              {currentLowestNames.length ? <>
                <div className="result-score">{currentLowestScore}<small>分</small></div>
                <div className="result-name">{currentLowestNames.join('、')}</div>
                <p>{currentLowestNames.length > 1 ? '并列最低，一起接受惩罚' : '请这位宝子接受惩罚'}</p>
              </> : <div className="empty-result"><span>?</span><p>填写拍档名后<br />自动显示最低分</p></div>}
            </section>

            <section className={`timer-card ${remainingSeconds === 0 ? 'timer-done' : ''}`}>
              <div className="timer-heading"><span>倒计时</span><em>{remainingSeconds === 0 ? '时间到' : isTimerRunning ? '进行中' : '可自定义'}</em></div>
              <div className="timer-display">{timerDisplayMinutes}<i>:</i>{timerDisplaySeconds}</div>
              <div className="timer-settings">
                <label><input type="number" min="0" max="99" value={timerMinutes} disabled={isTimerRunning}
                  onChange={(event) => updateTimer(Number(event.target.value), timerSeconds)} /><span>分</span></label>
                <label><input type="number" min="0" max="59" value={timerSeconds} disabled={isTimerRunning}
                  onChange={(event) => updateTimer(timerMinutes, Number(event.target.value))} /><span>秒</span></label>
              </div>
              <div className="timer-actions">
                <button className="timer-primary" type="button" onClick={toggleTimer} disabled={configuredTimerSeconds === 0}>
                  {isTimerRunning ? '暂停' : remainingSeconds > 0 && remainingSeconds < configuredTimerSeconds ? '继续' : '开始'}
                </button>
                <button type="button" onClick={resetTimer}>重置</button>
              </div>
            </section>

            <section className="rules-card">
              <div className="card-title"><span>玩法规则</span><em>RULES</em></div>
              {activeGame === 'chase' ? <>
                <div className="boost-notice"><span>交通工具加速：分值翻倍</span><strong>×2</strong></div>
                <ol><li><b>普通分数</b><span>×1</span></li><li><b>加速分数</b><span>×2</span></li><li><b>跑得最慢</b><span>接受惩罚</span></li></ol>
                <div className="formula">总分 = 普通分数 + 加速分数 × 2<br />建议互动时长：50分钟</div>
              </> : <>
                <ol><li><b>交流 1 人</b><span>＋2 分</span></li><li><b>支持 1 人</b><span>＋10 分</span></li><li><b>本轮最低分</b><span>接受惩罚</span></li></ol>
                <div className="formula">总积分 = 2 × 交流人数 + 10 × 支持人数</div>
              </>}
            </section>

          </aside>
        </div>
      </section>

    </main>
  );
}

