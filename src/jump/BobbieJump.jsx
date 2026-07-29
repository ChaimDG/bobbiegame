import { useEffect, useRef, useState } from 'react';
import { GameButton } from '../components/GameButton.jsx';
import { createJumpState, getJumpBest, resizeJumpState, updateJump } from './engine.js';
import { drawBobbieJump } from './render.js';
import { jumpAssetUrls } from './assets.js';

const fixedStep = 1 / 120;

export function BobbieJump({ onBackToModes, onMainMenu }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const inputRef = useRef({ left: false, right: false });
  const rafRef = useRef(0);
  const [runKey, setRunKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [controls, setControls] = useState({ left: false, right: false });
  const [snapshot, setSnapshot] = useState(() => makeSnapshot(createJumpState(getJumpBest())));

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const state = createJumpState(getJumpBest());
    let accumulator = 0;
    let previousTime = performance.now();
    let snapshotTimer = 0;
    let lastStatus = state.status;
    let mounted = true;
    stateRef.current = state;

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      resizeJumpState(state, rect.width, rect.height);
    }

    function frame(now) {
      if (!mounted) {
        return;
      }
      const dt = Math.min(0.05, (now - previousTime) / 1000);
      previousTime = now;
      if (state.status === 'playing' && !state.paused) {
        accumulator += dt;
        while (accumulator >= fixedStep) {
          updateJump(state, inputRef.current, fixedStep);
          accumulator -= fixedStep;
        }
      }
      drawBobbieJump(context, state);
      snapshotTimer += dt;
      if (snapshotTimer > 0.1 || state.status !== lastStatus) {
        snapshotTimer = 0;
        lastStatus = state.status;
        setSnapshot(makeSnapshot(state));
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    function handleKeyDown(event) {
      const key = event.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') {
        event.preventDefault();
        setDirection('left', true);
      }
      if (key === 'arrowright' || key === 'd') {
        event.preventDefault();
        setDirection('right', true);
      }
    }

    function handleKeyUp(event) {
      const key = event.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') {
        setDirection('left', false);
      }
      if (key === 'arrowright' || key === 'd') {
        setDirection('right', false);
      }
    }

    function setDirection(direction, active) {
      inputRef.current[direction] = active;
      setControls((current) => (current[direction] === active ? current : { ...current, [direction]: active }));
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [runKey]);

  function setDirection(direction, active) {
    inputRef.current[direction] = active;
    setControls((current) => (current[direction] === active ? current : { ...current, [direction]: active }));
  }

  function handleCanvasPointerDown(event) {
    if (snapshot.status !== 'playing' || paused) {
      return;
    }
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    setDirection(event.clientX - rect.left < rect.width * 0.5 ? 'left' : 'right', true);
  }

  function clearControls() {
    inputRef.current.left = false;
    inputRef.current.right = false;
    setControls({ left: false, right: false });
  }

  function handlePause() {
    const state = stateRef.current;
    if (!state || state.status !== 'playing') {
      return;
    }
    state.paused = !state.paused;
    clearControls();
    setPaused(state.paused);
  }

  function tryAgain() {
    clearControls();
    setPaused(false);
    setRunKey((current) => current + 1);
  }

  return (
    <main
      className="jump-shell"
      style={{
        '--jump-sky': `url(${jumpAssetUrls.skyPark})`,
        '--jump-bone-icon': `url(${jumpAssetUrls.goldBone})`,
      }}
    >
      <canvas
        ref={canvasRef}
        className="jump-canvas"
        aria-label="Bobbie Jump speelveld"
        onPointerDown={handleCanvasPointerDown}
        onPointerUp={clearControls}
        onPointerCancel={clearControls}
        onPointerLeave={clearControls}
      />
      <header className="jump-hud">
        <button className="jump-back-button" type="button" onClick={onBackToModes}>Modes</button>
        <div className="jump-title-lockup">
          <span>Sky playground</span>
          <strong>Bobbie Jump</strong>
        </div>
        <button className="jump-pause-button" type="button" onClick={handlePause} aria-label={paused ? 'Resume game' : 'Pause game'}>
          {paused ? 'Play' : 'Pause'}
        </button>
      </header>
      <section className="jump-stats" aria-label="Bobbie Jump score">
        <JumpMetric label="Height" value={`${Math.floor(snapshot.height)} m`} />
        <JumpMetric label="Bones" value={snapshot.bones} bone />
        <JumpMetric label="Best" value={`${Math.floor(snapshot.bestHeight)} m`} />
      </section>
      <div className="jump-tip">Auto-bounce. Hold left or right to steer.</div>
      <div className="jump-controls" aria-label="Steer Bobbie">
        <ControlButton direction="left" active={controls.left} onDirection={setDirection}>Left</ControlButton>
        <ControlButton direction="right" active={controls.right} onDirection={setDirection}>Right</ControlButton>
      </div>
      {paused && snapshot.status === 'playing' && (
        <div className="jump-overlay jump-overlay-pause jump-overlay-enter">
          <p>Bobbie Jump</p>
          <h1>Take a breath</h1>
          <GameButton size="small" onClick={handlePause}>Resume</GameButton>
          <GameButton size="small" onClick={onBackToModes}>Game Modes</GameButton>
        </div>
      )}
      {snapshot.status === 'game-over' && (
        <JumpResult snapshot={snapshot} onTryAgain={tryAgain} onBackToModes={onBackToModes} onMainMenu={onMainMenu} />
      )}
    </main>
  );
}

function JumpMetric({ label, value, bone = false }) {
  return (
    <div className={`jump-metric${bone ? ' jump-metric-bone' : ''}`}>
      <span>{label}</span>
      <strong>{bone && <i aria-hidden="true" />} {value}</strong>
    </div>
  );
}

function ControlButton({ direction, active, onDirection, children }) {
  return (
    <button
      className={`jump-control${active ? ' jump-control-active' : ''}`}
      type="button"
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        onDirection(direction, true);
      }}
      onPointerUp={() => onDirection(direction, false)}
      onPointerCancel={() => onDirection(direction, false)}
      onPointerLeave={() => onDirection(direction, false)}
      aria-label={`Steer ${direction}`}
    >
      <span aria-hidden="true">{direction === 'left' ? '‹' : '›'}</span>
      {children}
    </button>
  );
}

function JumpResult({ snapshot, onTryAgain, onBackToModes, onMainMenu }) {
  return (
    <div className="jump-overlay jump-result jump-overlay-enter">
      <p>Sky run complete</p>
      <h1>Nice bounce!</h1>
      <dl>
        <div><dt>Height</dt><dd>{Math.floor(snapshot.height)} m</dd></div>
        <div><dt>Bones</dt><dd>{snapshot.bones}</dd></div>
        <div><dt>Best</dt><dd>{Math.floor(snapshot.bestHeight)} m</dd></div>
        <div><dt>Top combo</dt><dd>x{snapshot.peakCombo}</dd></div>
      </dl>
      <div className="jump-result-actions">
        <GameButton size="small" onClick={onTryAgain}>Try Again</GameButton>
        <GameButton size="small" onClick={onBackToModes}>Game Modes</GameButton>
        <GameButton size="small" onClick={onMainMenu}>Main Menu</GameButton>
      </div>
    </div>
  );
}

function makeSnapshot(state) {
  return {
    status: state.status,
    height: state.height,
    bones: state.runBones,
    bestHeight: Math.max(state.bestHeight, Math.floor(state.height)),
    peakCombo: state.peakCombo,
  };
}
