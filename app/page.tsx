'use client';

import { useEffect, useMemo, useState } from 'react';

type Player = { id: number; name: string; chats: number; supports: number };
type ChasePlayer = { id: number; name: string; normalScore: number; boostScore: number; boostTool: string };
type TalentPlayer = { id: number; name: string; score: number };
type GameType = 'newcomer' | 'chase' | 'duo' | 'talent';

const defaultPlayers: Player[] = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1, name: '', chats: 0, supports: 0,
}));

const defaultChasePlayers: ChasePlayer[] = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1, name: '', normalScore: 0, boostScore: 0, boostTool: '',
}));

const defaultTalentPlayers: TalentPlayer[] = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1, name: '', score: 0,
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

function TalentCounter({ value, label, onChange }: { value: number; label: string; onChange: (next: number) => void }) {
  const setScore = (next: number) => onChange(Math.max(0, Math.min(999999, Number.isFinite(next) ? next : 0)));
  return <div className="talent-counter">
    <button type="button" aria-label={`${label}减1分`} onClick={() => setScore(value - 1)}>−1</button>
    <input aria-label={label} inputMode="numeric" min="0" max="999999" type="number" value={value} onChange={(event) => setScore(Number(event.target.value))} />
    <button type="button" aria-label={`${label}加1分`} onClick={() => setScore(value + 1)}>＋1</button>
  </div>;
}

export default function Home() {
  const [activeGame, setActiveGame] = useState<GameType>('newcomer');
  const [players, setPlayers] = useState<Player[]>(defaultPlayers);
  const [chasePlayers, setChasePlayers] = useState<ChasePlayer[]>(defaultChasePlayers);
  const [talentPlayers, setTalentPlayers] = useState<TalentPlayer[]>(defaultTalentPlayers);
  const [loaded, setLoaded] = useState(false);
  const [gameMenuOpen, setGameMenuOpen] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);
  const [chaseVisibleCount, setChaseVisibleCount] = useState(3);
  const [talentVisibleCount, setTalentVisibleCount] = useState(3);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [adjustSeconds, setAdjustSeconds] = useState(10);

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
      const savedTalentPlayers = window.localStorage.getItem('talent-game-players');
      if (savedTalentPlayers) setTalentPlayers(JSON.parse(savedTalentPlayers));
      const savedTalentVisibleCount = Number(window.localStorage.getItem('talent-game-visible-count'));
      if (savedTalentVisibleCount >= 1 && savedTalentVisibleCount <= 8) setTalentVisibleCount(savedTalentVisibleCount);
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
    window.localStorage.setItem('talent-game-players', JSON.stringify(talentPlayers));
    window.localStorage.setItem('talent-game-visible-count', String(talentVisibleCount));
  }, [players, visibleCount, chasePlayers, chaseVisibleCount, talentPlayers, talentVisibleCount, loaded]);

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
  const visibleTalentPlayers = talentPlayers.slice(0, talentVisibleCount);
  const talentTop3 = useMemo(() => talentPlayers.slice(0, talentVisibleCount)
    .filter((player) => player.name.trim() || player.score > 0)
    .sort((a, b) => b.score - a.score || a.id - b.id)
    .slice(0, 3), [talentPlayers, talentVisibleCount]);

  function updatePlayer(id: number, patch: Partial<Player>) {
    setPlayers((current) => current.map((player) => player.id === id ? { ...player, ...patch } : player));
  }

  function updateChasePlayer(id: number, patch: Partial<ChasePlayer>) {
    setChasePlayers((current) => current.map((player) => player.id === id ? { ...player, ...patch } : player));
  }

  function updateTalentPlayer(id: number, patch: Partial<TalentPlayer>) {
    setTalentPlayers((current) => current.map((player) => player.id === id ? { ...player, ...patch } : player));
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
    else if (activeGame === 'talent') setTalentPlayers(defaultTalentPlayers);
    else setPlayers(defaultPlayers);
  }

  const currentVisibleCount = activeGame === 'talent' ? talentVisibleCount : activeGame === 'chase' ? chaseVisibleCount : visibleCount;
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

  function adjustTimer(direction: 1 | -1) {
    const amount = Math.max(1, Math.min(999, Number.isFinite(adjustSeconds) ? adjustSeconds : 10));
    setAdjustSeconds(amount);
    setRemainingSeconds((current) => Math.max(0, Math.min(5999, current + direction * amount)));
  }

  const gameEyebrow = activeGame === 'talent' ? 'TALENT · ASSESSMENT' : activeGame === 'duo' ? 'DUO · WORD CHALLENGE' : activeGame === 'chase' ? 'CHASE · INTERACTION' : 'NEWCOMER · INTERACTION';
  const gameTitle = activeGame === 'talent' ? '才艺考核' : activeGame === 'duo' ? '双人默契猜词挑战' : activeGame === 'chase' ? '追分互动小游戏' : '拉新互动小游戏';

  return (
    <main className={`app-shell ${gameMenuOpen ? 'menu-open' : 'menu-closed'} ${activeGame === 'duo' ? 'duo-theme' : ''} ${activeGame === 'talent' ? 'talent-theme' : ''}`}>
      <aside className="game-nav" aria-label="游戏选择" aria-hidden={!gameMenuOpen}>
        <div className="brand-mark">甜</div>
        <div className="nav-title">互动游戏</div>
        <button className={`game-item ${activeGame === 'newcomer' ? 'active' : ''}`} type="button" onClick={() => selectGame('newcomer')} tabIndex={gameMenuOpen ? 0 : -1}>
          <span className="game-icon">新</span><span>拉新互动</span>
        </button>
        <button className={`game-item ${activeGame === 'chase' ? 'active' : ''}`} type="button" onClick={() => selectGame('chase')} tabIndex={gameMenuOpen ? 0 : -1}>
          <span className="game-icon">追</span><span>追分互动</span>
        </button>
        <button className={`game-item ${activeGame === 'duo' ? 'active' : ''}`} type="button" onClick={() => selectGame('duo')} tabIndex={gameMenuOpen ? 0 : -1}>
          <span className="game-icon">契</span><span>双人默契猜词</span>
        </button>
        <button className={`game-item ${activeGame === 'talent' ? 'active' : ''}`} type="button" onClick={() => selectGame('talent')} tabIndex={gameMenuOpen ? 0 : -1}>
          <span className="game-icon">艺</span><span>才艺考核</span>
        </button>
        <div className="autosave"><span /> 本机自动保存</div>
      </aside>

      <section className="game-stage">
        <header className="topbar">
          <div className="title-group">
            {!gameMenuOpen && <button className="choose-game-button" type="button" onClick={() => setGameMenuOpen(true)} aria-label="打开游戏选择菜单">☰ <span>选择游戏</span></button>}
            <div><p className="eyebrow">{gameEyebrow}</p><h1>{gameTitle}</h1></div>
          </div>
          <div className="top-actions">
            {activeGame !== 'duo' && <div className="mic-controls" aria-label={activeGame === 'talent' ? '参赛人数控制' : '麦位数量控制'}>
              <button type="button" onClick={() => activeGame === 'talent' ? setTalentVisibleCount((count) => Math.max(1, count - 1)) : activeGame === 'chase' ? setChaseVisibleCount((count) => Math.max(1, count - 1)) : setVisibleCount((count) => Math.max(1, count - 1))} disabled={currentVisibleCount === 1} aria-label={activeGame === 'talent' ? '减少一位选手' : '减少一个麦位'}>−</button>
              <span><b>{currentVisibleCount}</b>/8{activeGame === 'talent' ? '人' : '麦'}</span>
              <button type="button" onClick={() => activeGame === 'talent' ? setTalentVisibleCount((count) => Math.min(8, count + 1)) : activeGame === 'chase' ? setChaseVisibleCount((count) => Math.min(8, count + 1)) : setVisibleCount((count) => Math.min(8, count + 1))} disabled={currentVisibleCount === 8}>＋ 添加{activeGame === 'talent' ? '选手' : '麦位'}</button>
            </div>}
            {activeGame === 'talent' ? <>
              <div className="rule-chip talent-skill-chip"><b>功底</b> 四级定级</div>
              <div className="rule-chip talent-pop-chip"><b>人气</b> TOP3</div>
              <button className="reset-button" type="button" onClick={resetGame}>重开一轮</button>
            </> : activeGame === 'duo' ? <>
              <div className="rule-chip duo-support-chip"><b>＋10s</b> 支持</div>
              <div className="rule-chip duo-stomp-chip"><b>−10s</b> 猛踩</div>
            </> : activeGame === 'chase' ? <>
              <div className="rule-chip"><b>×1</b> 普通</div>
              <div className="rule-chip support"><b>×2</b> 加速</div>
            </> : <>
              <div className="rule-chip"><b>＋2</b> 交流</div>
              <div className="rule-chip support"><b>＋10</b> 支持</div>
            </>}
            {activeGame !== 'duo' && <button className="reset-button" type="button" onClick={resetGame}>重开一局</button>}
          </div>
        </header>

        {activeGame === 'talent' ? <div className="talent-board">
          <section className="talent-ranking" aria-label="才艺考核人气统计">
            <div className="talent-table-head"><span>序号</span><span>主播名</span><span>人气进度</span><span>人气分</span></div>
            <div className="talent-player-list" style={{ gridTemplateRows: `repeat(${talentVisibleCount}, minmax(52px, 1fr))` }}>
              {visibleTalentPlayers.map((player) => {
                const progress = Math.min(100, player.score / 10);
                const rank = talentTop3.findIndex((item) => item.id === player.id) + 1;
                return <div className={`talent-player-row ${rank > 0 ? `talent-rank-${rank}` : ''}`} key={player.id}>
                  <div className="talent-seat"><span>{player.id}</span>号</div>
                  <input className="talent-name-input" aria-label={`${player.id}号主播名`} maxLength={12} placeholder="填写主播名" value={player.name} onChange={(event) => updateTalentPlayer(player.id, { name: event.target.value })} />
                  <div className="talent-progress-wrap">
                    <div className="talent-progress-track"><i style={{ width: `${progress}%` }} /></div>
                    <small>{player.score >= 1000 ? '满人气' : `距满条 ${1000 - player.score} 分`}</small>
                  </div>
                  <TalentCounter label={`${player.id}号主播人气分`} value={player.score} onChange={(score) => updateTalentPlayer(player.id, { score })} />
                </div>;
              })}
            </div>
          </section>

          <aside className="talent-side-panel">
            <section className="talent-top-card">
              <div className="talent-card-title"><span>人气才艺 TOP3</span><em>POPULARITY</em></div>
              <div className="talent-podium">
                {[0, 1, 2].map((index) => {
                  const player = talentTop3[index];
                  return <div className={`talent-top-item top-${index + 1}`} key={index}>
                    <strong>{index + 1}</strong>
                    <div><b>{player ? player.name.trim() || `${player.id}号主播` : '待上榜'}</b><span>{player ? `${player.score} 分` : '—'}</span></div>
                    <em>{index === 0 ? '冠军' : index === 1 ? '亚军' : '季军'}</em>
                  </div>;
                })}
              </div>
              <p>1000分为满条，分数可继续累计</p>
            </section>

            <section className="talent-rules-card">
              <div className="talent-card-title"><span>考核路线</span><em>RULES</em></div>
              <div className="talent-route skill-route"><h2>功底路线</h2><p>夯，人上人，NPC，拉。（后台评审公布）。</p><strong>人上人+夯 上大头。</strong></div>
              <div className="talent-route popularity-route"><h2>人气路线</h2><p>1.0 人气才艺主播，音浪TOP1 人气才艺冠军，TOP2 人气才艺亚军，TOP3人气才艺季军 （人气才艺主播中选择）。</p><strong>给个人做作品。</strong></div>
            </section>
          </aside>
        </div> : activeGame === 'duo' ? <div className="duo-board">
          <section className="duo-hero">
            <p>双向默契 · 趣味对局 · 全民可互动</p>
            <div className={`duo-timer ${remainingSeconds === 0 ? 'timer-done' : ''}`}>
              <div className="duo-timer-status">{remainingSeconds === 0 ? '时间到' : isTimerRunning ? '挑战进行中' : '准备挑战'}</div>
              <div className="duo-timer-display">{timerDisplayMinutes}<i>:</i>{timerDisplaySeconds}</div>
              <div className="duo-timer-settings">
                <label><span>分钟</span><input aria-label="倒计时分钟" type="number" min="0" max="99" value={timerMinutes} disabled={isTimerRunning} onChange={(event) => updateTimer(Number(event.target.value), timerSeconds)} /></label>
                <label><span>秒钟</span><input aria-label="倒计时秒钟" type="number" min="0" max="59" value={timerSeconds} disabled={isTimerRunning} onChange={(event) => updateTimer(timerMinutes, Number(event.target.value))} /></label>
              </div>
              <div className="duo-timer-actions">
                <button className="duo-start" type="button" onClick={toggleTimer} disabled={configuredTimerSeconds === 0}>{isTimerRunning ? '暂停' : remainingSeconds > 0 && remainingSeconds < configuredTimerSeconds ? '继续' : '开始挑战'}</button>
                <button type="button" onClick={resetTimer}>重置</button>
              </div>
            </div>
          </section>

          <section className="duo-adjust-card">
            <div><span>实时加减时长</span><em>计时中也可操作</em></div>
            <label><input aria-label="每次调整秒数" type="number" min="1" max="999" value={adjustSeconds} onChange={(event) => setAdjustSeconds(Math.max(1, Math.min(999, Number(event.target.value) || 1)))} /><span>秒／次</span></label>
            <div className="duo-adjust-buttons">
              <button className="subtract" type="button" onClick={() => adjustTimer(-1)}>− {adjustSeconds}s</button>
              <button className="add" type="button" onClick={() => adjustTimer(1)}>＋ {adjustSeconds}s</button>
            </div>
          </section>

          <section className="duo-rule-card support-side">
            <div className="duo-rule-heading"><span>SUPPORT</span><h2>支持类</h2></div>
            <ul>
              <li><b>加油鸭</b><strong>＋10s</strong></li>
              <li><b>全麦爱有呦</b><strong>换回词库</strong></li>
              <li><b>礼花筒</b><strong>免惩</strong></li>
            </ul>
          </section>

          <section className="duo-rule-card stomp-side">
            <div className="duo-rule-heading"><span>STOMP</span><h2>猛踩类</h2></div>
            <ul>
              <li><b>送你花花</b><strong>−10s</strong></li>
              <li><b>全麦棒棒糖</b><strong>换词库</strong></li>
              <li><b>星星点灯</b><strong>替换高阶惩罚</strong></li>
            </ul>
          </section>

          <div className="duo-footer-note">轻互动造氛围　｜　无压力娱乐对局</div>
        </div> : <div className="content-grid">
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
        </div>}
      </section>

    </main>
  );
}

