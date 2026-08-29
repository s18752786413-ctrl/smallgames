'use client';

import { PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';

type Player = { id: number; name: string; chats: number; supports: number };
type ChasePlayer = { id: number; name: string; normalScore: number; boostScore: number; boostTool: string };
type TalentPlayer = { id: number; name: string; score: number };
type GameType = 'newcomer' | 'chase' | 'duo' | 'talent' | 'scratch';
type ScratchTheme = 'pink' | 'purple-pink' | 'purple' | 'blue' | 'green';

const previousScratchDefaultsV1 = [
  '指定歌单', '撒娇八连', '换头像1h', '学猫叫三声', '咬舌头说话1分钟', '说三个土味情话',
  '给厅里每个人道歉包括主持', '原地转十圈', '做五个深蹲', '夸主持三分钟', '用气泡音说话1分钟',
  '用夹子音说话1分钟', '学三声猪叫', '指定卖汤圆', '模仿唐老鸭说话', '学三种动物叫', '指定报菜名', '谢谢惠顾',
];

const previousScratchDefaultsV2 = [
  '指定歌单', '撒娇八连', '夸你的第一句话', '奖励你来一个最得意的才艺', '咬舌头说话1分钟', '说三个土味情话',
  '给厅里每个人道歉包括主持', '捏紧鼻子然后歌到3口', '做五个深蹲', '夸主持一分钟', '用气泡音说话1分钟',
  '用夹子音说话1分钟', '学三声猪叫', '唱狗叫版《拔萝卜》', '模仿唐老鸭说话（2分钟）', '学三种动物叫', '指定报菜名', '谢谢惠顾',
];

const scratchDefaults = [
  '指定歌单', '撒娇八连', '夸你的榜一10句话', '奖励你来一个最得意的才艺', '咬舌头说话1分钟', '说三个土味情话',
  '给厅里每个人道歉包括主持', '捏紧鼻子然后歌到3口', '做五个深蹲', '夸主持一分钟', '用气泡音说话1分钟',
  '用夹子音说话1分钟', '学三声猪叫', '唱狗叫版《拔萝卜》', '模仿唐老鸭说话（2分钟）', '学三种动物叫', '指定报菜名', '谢谢惠顾',
];

const scratchImages = scratchDefaults.map((_, index) => `kuromi-scratch/card-${String(index === 17 ? 1 : index + 1).padStart(2, '0')}-web.png`);

function ScratchCard({ index, text, image, resetKey, forceRevealed, onReveal }: {
  index: number; text: string; image: string; resetKey: number; forceRevealed: boolean; onReveal: (index: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(ratio, ratio);
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#d0c8cc');
    gradient.addColorStop(.3, '#f0e8ec');
    gradient.addColorStop(.5, '#c0b8bc');
    gradient.addColorStop(.7, '#e8e0e4');
    gradient.addColorStop(1, '#b8b0b4');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.globalAlpha = .15;
    context.strokeStyle = '#fff';
    context.lineWidth = 1;
    for (let y = 0; y < height; y += 4) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y + 2);
      context.stroke();
    }
    context.globalAlpha = 1;
    context.strokeStyle = '#ff8ec4';
    context.lineWidth = 3;
    context.strokeRect(2, 2, width - 4, height - 4);

    context.globalAlpha = .2;
    context.fillStyle = '#ff6b9d';
    context.font = `${Math.min(width, height) * .35}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('💀', width / 2, height / 2 - height * .05);
    context.globalAlpha = .35;
    context.fillStyle = '#ff6b9d';
    context.font = `bold ${Math.min(width, height) * .12}px "ZCOOL KuaiLe", sans-serif`;
    context.fillText('刮我', width / 2, height / 2 + height * .25);
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'destination-out';
  }, [resetKey]);

  useEffect(() => {
    if (forceRevealed && !revealed) {
      setRevealed(true);
      onReveal(index);
    }
  }, [forceRevealed, index, onReveal, revealed]);

  function point(event: ReactPointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function scratch(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || revealed) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    event.preventDefault();
    const next = point(event);
    context.beginPath();
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    context.lineTo(next.x, next.y);
    context.strokeStyle = 'rgba(0,0,0,1)';
    context.lineWidth = Math.max(canvas.offsetWidth * .08, 18);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
    lastPointRef.current = next;
  }

  function finishScratch() {
    if (!drawingRef.current || revealed) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    let total = 0;
    for (let pixel = 3; pixel < pixels.length; pixel += 32) {
      total += 1;
      if (pixels[pixel] < 128) transparent += 1;
    }
    if (transparent / total >= .5) {
      setRevealed(true);
      onReveal(index);
    }
  }

  return <div className={`scratch-card ${revealed || forceRevealed ? 'revealed' : ''}`}>
    <div className="card-content"><img className="card-kuromi" src={image} alt="库洛米" /><div className="card-text">{text}</div></div>
    <canvas ref={canvasRef} className={`scratch-canvas ${revealed || forceRevealed ? 'fade-out' : ''}`} aria-label={`刮开第${index + 1}张卡片`}
      onPointerDown={(event) => { if (revealed || forceRevealed) return; drawingRef.current = true; lastPointRef.current = point(event); event.currentTarget.setPointerCapture(event.pointerId); scratch(event); }}
      onPointerMove={scratch} onPointerUp={finishScratch} onPointerLeave={finishScratch} onPointerCancel={finishScratch} />
  </div>;
}

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
  const [scratchTexts, setScratchTexts] = useState(scratchDefaults);
  const [scratchRule, setScratchRule] = useState('全麦棒棒糖刮一次 // 指定主持第一次99星辰 · 第二次199比心');
  const [scratchTheme, setScratchTheme] = useState<ScratchTheme>('pink');
  const [scratchThemeOpen, setScratchThemeOpen] = useState(false);
  const [scratchEditing, setScratchEditing] = useState(false);
  const [scratchResetKey, setScratchResetKey] = useState(0);
  const [scratchRevealAll, setScratchRevealAll] = useState(false);
  const [scratchRevealed, setScratchRevealed] = useState<number[]>([]);

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
      const savedScratchTexts = window.localStorage.getItem('scratch-game-texts');
      if (savedScratchTexts) {
        const parsedScratchTexts = JSON.parse(savedScratchTexts);
        const isPreviousDefault = [previousScratchDefaultsV1, previousScratchDefaultsV2]
          .some((defaults) => JSON.stringify(parsedScratchTexts) === JSON.stringify(defaults));
        setScratchTexts(isPreviousDefault ? scratchDefaults : parsedScratchTexts);
      }
      const savedScratchRule = window.localStorage.getItem('scratch-game-rule');
      if (savedScratchRule) setScratchRule(savedScratchRule);
      const savedScratchTheme = window.localStorage.getItem('scratch-game-theme') as ScratchTheme | null;
      if (savedScratchTheme && ['pink', 'purple-pink', 'purple', 'blue', 'green'].includes(savedScratchTheme)) setScratchTheme(savedScratchTheme);
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
    window.localStorage.setItem('scratch-game-texts', JSON.stringify(scratchTexts));
    window.localStorage.setItem('scratch-game-rule', scratchRule);
    window.localStorage.setItem('scratch-game-theme', scratchTheme);
  }, [players, visibleCount, chasePlayers, chaseVisibleCount, talentPlayers, talentVisibleCount, scratchTexts, scratchRule, scratchTheme, loaded]);

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

  useEffect(() => {
    document.body.classList.toggle('scratch-page', activeGame === 'scratch');
    return () => document.body.classList.remove('scratch-page');
  }, [activeGame]);

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
    .filter((player) => player.score >= 1000)
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

  function recordScratchReveal(index: number) {
    setScratchRevealed((current) => current.includes(index) ? current : [...current, index]);
  }

  function restartScratchGame() {
    if (!window.confirm('确认覆盖刮层并重新开始吗？已刮开的结果将被隐藏。')) return;
    setScratchRevealAll(false);
    setScratchRevealed([]);
    setScratchResetKey((current) => current + 1);
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
    else if (activeGame === 'scratch') restartScratchGame();
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

  const gameEyebrow = activeGame === 'scratch' ? 'KUROMI · SCRATCH CARD' : activeGame === 'talent' ? 'TALENT · ASSESSMENT' : activeGame === 'duo' ? 'DUO · WORD CHALLENGE' : activeGame === 'chase' ? 'CHASE · INTERACTION' : 'NEWCOMER · INTERACTION';
  const gameTitle = activeGame === 'scratch' ? '库洛米刮刮乐' : activeGame === 'talent' ? '才艺考核' : activeGame === 'duo' ? '双人默契猜词挑战' : activeGame === 'chase' ? '追分互动小游戏' : '拉新互动小游戏';

  return (
    <main data-display-mode="projector-large" className={`app-shell ${gameMenuOpen ? 'menu-open' : 'menu-closed'} ${activeGame === 'duo' ? 'duo-theme' : ''} ${activeGame === 'talent' ? 'talent-theme' : ''} ${activeGame === 'scratch' ? `scratch-theme scratch-theme-${scratchTheme}` : ''}`}>
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
        <button className={`game-item ${activeGame === 'scratch' ? 'active' : ''}`} type="button" onClick={() => selectGame('scratch')} tabIndex={gameMenuOpen ? 0 : -1}>
          <span className="game-icon">刮</span><span>库洛米刮刮乐</span>
        </button>
        <div className="autosave"><span /> 本机自动保存</div>
      </aside>

      <section className="game-stage">
        {activeGame !== 'scratch' ? <header className="topbar">
          <div className="title-group">
            {!gameMenuOpen && <button className="choose-game-button" type="button" onClick={() => setGameMenuOpen(true)} aria-label="打开游戏选择菜单">☰ <span>选择游戏</span></button>}
            <div><p className="eyebrow">{gameEyebrow}</p><h1>{gameTitle}</h1></div>
          </div>
          <div className="top-actions">
            {activeGame !== 'duo' && activeGame !== 'scratch' && <div className="mic-controls" aria-label={activeGame === 'talent' ? '参赛人数控制' : '麦位数量控制'}>
              <button type="button" onClick={() => activeGame === 'talent' ? setTalentVisibleCount((count) => Math.max(1, count - 1)) : activeGame === 'chase' ? setChaseVisibleCount((count) => Math.max(1, count - 1)) : setVisibleCount((count) => Math.max(1, count - 1))} disabled={currentVisibleCount === 1} aria-label={activeGame === 'talent' ? '减少一位选手' : '减少一个麦位'}>−</button>
              <span><b>{currentVisibleCount}</b>/8{activeGame === 'talent' ? '人' : '麦'}</span>
              <button type="button" onClick={() => activeGame === 'talent' ? setTalentVisibleCount((count) => Math.min(8, count + 1)) : activeGame === 'chase' ? setChaseVisibleCount((count) => Math.min(8, count + 1)) : setVisibleCount((count) => Math.min(8, count + 1))} disabled={currentVisibleCount === 8}>＋ 添加{activeGame === 'talent' ? '选手' : '麦位'}</button>
            </div>}
            {activeGame === 'scratch' ? <>
              <button className="scratch-action" type="button" onClick={() => setScratchThemeOpen((open) => !open)}>⚙ 主题设置</button>
              <button className={`scratch-action ${scratchEditing ? 'active' : ''}`} type="button" onClick={() => setScratchEditing((editing) => !editing)}>{scratchEditing ? '✓ 完成编辑' : '✎ 编辑'}</button>
              <button className="scratch-action" type="button" onClick={() => { setScratchRevealAll(true); setScratchRevealed(scratchDefaults.map((_, index) => index)); }}>全部刮开</button>
              <button className="scratch-action restart" type="button" onClick={restartScratchGame}>重新开始</button>
            </> : activeGame === 'talent' ? <>
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
            {activeGame !== 'duo' && activeGame !== 'scratch' && <button className="reset-button" type="button" onClick={resetGame}>重开一局</button>}
          </div>
        </header> : !gameMenuOpen ? <button className="scratch-menu-button" type="button" onClick={() => setGameMenuOpen(true)} aria-label="打开游戏选择菜单">☰</button> : null}

        {activeGame === 'scratch' ? <div className="scratch-board">
          <div className="scratch-frame">
            <div className="scratch-bg-deco" style={{ top: '10%', left: '5%', fontSize: 55 }}>♡</div>
            <div className="scratch-bg-deco" style={{ top: '30%', right: '8%', fontSize: 40 }}>✦</div>
            <div className="scratch-bg-deco" style={{ top: '60%', left: '12%', fontSize: 45 }}>🎀</div>
            <div className="scratch-bg-deco" style={{ top: '80%', right: '15%', fontSize: 50 }}>♡</div>
            <div className="scratch-bg-deco" style={{ top: '20%', left: '40%', fontSize: 28 }}>✧</div>
            <div className="scratch-bg-deco" style={{ top: '50%', right: '40%', fontSize: 35 }}>🎀</div>
            <div className="scratch-bg-deco" style={{ top: '75%', left: '35%', fontSize: 24 }}>✦</div>
            <div className="scratch-bg-deco" style={{ top: '35%', left: '70%', fontSize: 30 }}>✧</div>
            <div className="scratch-inner">
              <section className="scratch-hero-title-section"><h1 className="scratch-hero-title">库洛米刮刮乐</h1><div className="scratch-hero-subtitle">KUROMI SCRATCH CARD</div></section>
              <header className="scratch-title-bar"><div className="scratch-title-inner"><span>{scratchRule}</span></div></header>
              <div className="scratch-controls-row">
                <div className="scratch-progress-group"><span>已刮开</span><div className="scratch-progress"><i style={{ width: `${scratchRevealed.length / scratchDefaults.length * 100}%` }} /></div><strong>{scratchRevealed.length} / {scratchDefaults.length}</strong></div>
                <div className="scratch-buttons">
                  <button className="scratch-source-button dark" type="button" onClick={() => setScratchThemeOpen((open) => !open)}>⚙ 主题设置</button>
                  <button className={`scratch-source-button edit ${scratchEditing ? 'active' : ''}`} type="button" onClick={() => setScratchEditing((editing) => !editing)}>{scratchEditing ? '✓ 完成编辑' : '✎ 编辑'}</button>
                  <button className="scratch-source-button dark" type="button" onClick={() => { setScratchRevealAll(true); setScratchRevealed(scratchDefaults.map((_, index) => index)); }}>全部刮开</button>
                  <button className="scratch-source-button" type="button" onClick={restartScratchGame}>重新开始</button>
                </div>
              </div>
              <section className="scratch-grid" aria-label="库洛米刮刮乐卡片区">
                {scratchTexts.map((text, index) => <ScratchCard key={`${index}-${scratchResetKey}`} index={index} text={text} image={scratchImages[index]}
                  resetKey={scratchResetKey} forceRevealed={scratchRevealAll} onReveal={recordScratchReveal} />)}
              </section>
            </div>
          </div>

          <svg className="scratch-skull skull-tl" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="scratchSkull1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="var(--accent-light)"/><stop offset="100%" stopColor="var(--accent-strong)"/></linearGradient></defs><path d="M50 8 C25 8 8 26 8 48 C8 63 16 76 28 83 L28 90 C28 93 31 96 34 96 L40 96 C43 96 46 93 46 90 L46 86 L54 86 L54 90 C54 93 57 96 60 96 L66 96 C69 96 72 93 72 90 L72 83 C84 76 92 63 92 48 C92 26 75 8 50 8 Z" fill="url(#scratchSkull1)"/><ellipse cx="34" cy="46" rx="11" ry="12" fill="var(--bg-card)"/><ellipse cx="66" cy="46" rx="11" ry="12" fill="var(--bg-card)"/><path d="M50 56 L45 66 L55 66 Z" fill="var(--bg-card)"/><rect x="30" y="74" width="5" height="8" rx="2" fill="var(--bg-card)"/><rect x="40" y="74" width="5" height="8" rx="2" fill="var(--bg-card)"/><rect x="50" y="74" width="5" height="8" rx="2" fill="var(--bg-card)"/><rect x="60" y="74" width="5" height="8" rx="2" fill="var(--bg-card)"/></svg>
          <svg className="scratch-skull skull-br" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="scratchSkull2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="var(--accent-light)"/><stop offset="100%" stopColor="var(--accent-strong)"/></linearGradient></defs><path d="M50 8 C25 8 8 26 8 48 C8 63 16 76 28 83 L28 90 C28 93 31 96 34 96 L40 96 C43 96 46 93 46 90 L46 86 L54 86 L54 90 C54 93 57 96 60 96 L66 96 C69 96 72 93 72 90 L72 83 C84 76 92 63 92 48 C92 26 75 8 50 8 Z" fill="url(#scratchSkull2)"/><ellipse cx="34" cy="46" rx="11" ry="12" fill="var(--bg-card)"/><ellipse cx="66" cy="46" rx="11" ry="12" fill="var(--bg-card)"/><path d="M50 56 L45 66 L55 66 Z" fill="var(--bg-card)"/><rect x="30" y="74" width="5" height="8" rx="2" fill="var(--bg-card)"/><rect x="40" y="74" width="5" height="8" rx="2" fill="var(--bg-card)"/><rect x="50" y="74" width="5" height="8" rx="2" fill="var(--bg-card)"/><rect x="60" y="74" width="5" height="8" rx="2" fill="var(--bg-card)"/></svg>

          {scratchThemeOpen && <aside className="scratch-settings-panel">
            <div className="scratch-panel-title"><strong>🎨 主题设置</strong><button type="button" onClick={() => setScratchThemeOpen(false)}>×</button></div>
            <p>预设主题</p>
            <div className="scratch-theme-options">
              {([['pink', '粉色'], ['purple-pink', '紫粉'], ['purple', '紫色'], ['blue', '蓝白'], ['green', '绿白']] as [ScratchTheme, string][]).map(([value, label]) =>
                <button className={scratchTheme === value ? 'selected' : ''} type="button" key={value} onClick={() => setScratchTheme(value)}><i />{label}</button>)}
            </div>
            <p className="scratch-panel-tip">主题会自动保存到本机，下次打开继续使用。</p>
          </aside>}

          {scratchEditing && <aside className="scratch-edit-panel">
            <div className="scratch-panel-title"><strong>✎ 编辑刮卡内容</strong><button type="button" onClick={() => setScratchEditing(false)}>×</button></div>
            <label>顶部规则<input value={scratchRule} maxLength={80} onChange={(event) => setScratchRule(event.target.value)} /></label>
            <div className="scratch-edit-grid">
              {scratchTexts.map((text, index) => <label key={index}><span>{index + 1}</span><input value={text} maxLength={24}
                onChange={(event) => setScratchTexts((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /></label>)}
            </div>
            <button className="scratch-restore" type="button" onClick={() => { setScratchTexts(scratchDefaults); setScratchRule('全麦棒棒糖刮一次 // 指定主持第一次99星辰 · 第二次199比心'); }}>恢复原始内容</button>
          </aside>}
        </div> : activeGame === 'talent' ? <div className="talent-board">
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
              <p>达到1000分后进入TOP3，分数可继续累计</p>
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

