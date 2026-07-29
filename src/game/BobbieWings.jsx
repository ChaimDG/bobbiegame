import { useEffect, useRef, useState } from 'react';
import { GameButton } from '../components/GameButton.jsx';
import { createBobbieWingsState, updateBobbieWings } from './engine/gameState.js';
import { attachInput } from './engine/input.js';
import { drawBobbieWings } from './rendering/renderBobbieWings.js';
import { getBestDistance, saveBestDistance } from './systems/storage.js';
import { wingsAssetUrls } from './wingsAssets.js';

const fixedStep = 1 / 120;

export function BobbieWings({ audioSettings, onBackToModes, onMainMenu, playGameSound }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const inputRef = useRef({ pressed: false, justPressed: false, justReleased: false });
  const rafRef = useRef(0);
  const [snapshot, setSnapshot] = useState(() => makeSnapshot(createBobbieWingsState(getBestDistance())));
  const [paused, setPaused] = useState(false);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const state = createBobbieWingsState(getBestDistance());
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
      state.view.width = rect.width;
      state.view.height = rect.height;
    }

    function playCue(name) {
      if (audioSettings.sfx) {
        playGameSound(name);
      }
    }

    function frame(now) {
      if (!mounted) {
        return;
      }

      const dt = Math.min(0.05, (now - previousTime) / 1000);
      previousTime = now;

      if (!state.paused && state.status === 'playing') {
        accumulator += dt;
        while (accumulator >= fixedStep) {
          updateBobbieWings(state, inputRef.current, fixedStep, playCue);
          accumulator -= fixedStep;
        }
      }

      drawBobbieWings(context, state);
      snapshotTimer += dt;
      if (snapshotTimer > 0.12 || state.status !== lastStatus) {
        snapshotTimer = 0;
        lastStatus = state.status;
        setSnapshot(makeSnapshot(state));
      }

      inputRef.current.justPressed = false;
      inputRef.current.justReleased = false;
      rafRef.current = requestAnimationFrame(frame);
    }

    resizeCanvas();
    const detachInput = attachInput(inputRef.current, canvas);
    window.addEventListener('resize', resizeCanvas);
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      detachInput();
      window.removeEventListener('resize', resizeCanvas);
      if (state.distance > state.bestDistance) {
        saveBestDistance(state.distance);
      }
    };
  }, [audioSettings.sfx, playGameSound, runKey]);

  function handlePause() {
    const state = stateRef.current;
    if (!state || state.status !== 'playing') {
      return;
    }

    state.paused = !state.paused;
    setPaused(state.paused);
  }

  function handleTryAgain() {
    setPaused(false);
    setRunKey((key) => key + 1);
  }

  return (
    <main className={`wings-shell ${snapshot.shake ? 'screen-shake' : ''}`}>
      <canvas
        ref={canvasRef}
        className="wings-canvas"
        aria-label="Bobbie Wings speelveld"
      />
      <GameHud snapshot={snapshot} paused={paused} onPause={handlePause} />
      {snapshot.status === 'game-over' && (
        <GameOverOverlay
          snapshot={snapshot}
          onTryAgain={handleTryAgain}
          onBackToModes={onBackToModes}
          onMainMenu={onMainMenu}
        />
      )}
      {paused && snapshot.status === 'playing' && (
        <div className="pause-overlay">
          <h2>Paused</h2>
          <GameButton onClick={handlePause} size="small">
            Resume
          </GameButton>
          <GameButton onClick={onBackToModes} size="small">
            Game Modes
          </GameButton>
        </div>
      )}
    </main>
  );
}

function GameHud({ snapshot, paused, onPause }) {
  return (
    <div className="game-hud">
      <div className="wings-hud-stats" style={{ '--wings-bone-icon': `url(${wingsAssetUrls.goldBone})` }}>
        <HudMetric label="Distance" value={`${Math.floor(snapshot.distance)} m`} />
        <HudMetric label="Speed" value={`${snapshot.speed.toFixed(1)}x`} />
        <HudMetric label="Bones" value={snapshot.bones} bone />
        <HudMetric label="Best" value={`${Math.floor(snapshot.bestDistance)} m`} />
      </div>
      <button
        className="pause-button"
        type="button"
        onClick={onPause}
        aria-label={paused ? 'Resume game' : 'Pause game'}
        title={paused ? 'Resume game' : 'Pause game'}
      >
        <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
      </button>
    </div>
  );
}

function HudMetric({ label, value, bone = false }) {
  return (
    <div className={`wings-hud-metric${bone ? ' wings-hud-bones' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function GameOverOverlay({ snapshot, onTryAgain, onBackToModes, onMainMenu }) {
  return (
    <div className="game-over-panel menu-enter">
      <p className="game-over-kicker">Bobbie Wings</p>
      <h1>Run Complete</h1>
      <dl>
        <div>
          <dt>Distance</dt>
          <dd>{Math.floor(snapshot.distance)} m</dd>
        </div>
        <div>
          <dt>Bones</dt>
          <dd>{snapshot.bones}</dd>
        </div>
        <div>
          <dt>Top Speed</dt>
          <dd>{snapshot.topSpeed.toFixed(1)}x</dd>
        </div>
        <div>
          <dt>Best</dt>
          <dd>{Math.floor(snapshot.bestDistance)} m</dd>
        </div>
      </dl>
      <div className="game-over-actions">
        <GameButton onClick={onTryAgain} size="small">
          Try Again
        </GameButton>
        <GameButton onClick={onBackToModes} size="small">
          Game Modes
        </GameButton>
        <GameButton onClick={onMainMenu} size="small">
          Main Menu
        </GameButton>
      </div>
    </div>
  );
}

function makeSnapshot(state) {
  return {
    distance: state.distance,
    speed: state.player.vx / 260,
    bones: state.score.bones,
    topSpeed: state.score.topSpeed / 260,
    bestDistance: Math.max(state.bestDistance, state.distance),
    status: state.status,
    shake: state.effects.shake > 0,
  };
}
