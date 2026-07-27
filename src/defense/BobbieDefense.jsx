import { useEffect, useRef, useState } from 'react';
import { GameButton } from '../components/GameButton.jsx';
import {
  createDefenseState,
  placeTower,
  selectTower,
  startWave,
  togglePause,
  updateDefense,
  upgradeTower,
} from './engine.js';
import { towerTypes, waves } from './level.js';
import { drawDefense } from './render.js';
import { defenseAssetUrls, preloadDefenseAssets } from './assets.js';

export function BobbieDefense({ onBackToModes, onMainMenu }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(createDefenseState());
  const fieldRef = useRef({ width: 390, height: 620, time: 0 });
  const rafRef = useRef(0);
  const [snapshot, setSnapshot] = useState(() => makeSnapshot(stateRef.current));

  useEffect(() => {
    preloadDefenseAssets();
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let previous = performance.now();
    let uiTimer = 0;
    let mounted = true;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      fieldRef.current.width = rect.width;
      fieldRef.current.height = rect.height;
    }

    function frame(now) {
      if (!mounted) {
        return;
      }
      const dt = Math.min(0.033, (now - previous) / 1000);
      previous = now;
      fieldRef.current.time += dt;
      stateRef.current = updateDefense(stateRef.current, dt, fieldRef.current);
      drawDefense(context, stateRef.current, fieldRef.current);
      uiTimer += dt;
      if (uiTimer > 0.1) {
        uiTimer = 0;
        setSnapshot(makeSnapshot(stateRef.current));
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  function commitState(next) {
    stateRef.current = next;
    setSnapshot(makeSnapshot(next));
  }

  function handleCanvasPointer(event) {
    const point = getCanvasPoint(event);
    const tower = findTowerAt(point, stateRef.current.towers);
    if (tower) {
      commitState(upgradeTower(stateRef.current, tower.id));
      return;
    }
    commitState(placeTower(stateRef.current, point, fieldRef.current));
  }

  function handleCanvasMove(event) {
    const point = getCanvasPoint(event);
    stateRef.current = {
      ...stateRef.current,
      placementPreview: point,
    };
  }

  function handleCanvasLeave() {
    stateRef.current = {
      ...stateRef.current,
      placementPreview: null,
    };
  }

  function getCanvasPoint(event) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  return (
    <main className="defense-shell">
      <header className="defense-hud">
        <button className="back-button" type="button" onClick={onBackToModes}>
          Modes
        </button>
        <DefenseStat label="Wave" value={`${snapshot.wave}/${waves.length}`} />
        <DefenseStat label="Lives" value={snapshot.lives} />
        <DefenseStat label="Biscuits" value={snapshot.coins} />
        <button
          className={`defense-wave-button ${snapshot.status === 'wave' ? 'defense-wave-button-active' : ''}`}
          type="button"
          onClick={() => commitState(snapshot.status === 'wave' ? togglePause(stateRef.current) : startWave(stateRef.current))}
        >
          {snapshot.status === 'wave' ? (snapshot.paused ? 'Resume' : 'Pause') : 'Start'}
        </button>
      </header>

      <canvas
        ref={canvasRef}
        className="defense-canvas"
        aria-label="Bobbie Defense speelveld"
        onPointerDown={handleCanvasPointer}
        onPointerMove={handleCanvasMove}
        onPointerLeave={handleCanvasLeave}
      />

      <div className="defense-mission" role="status">
        <span className={`defense-mission-dot ${snapshot.status === 'wave' && !snapshot.paused ? 'defense-mission-dot-live' : ''}`} />
        <p>{snapshot.message}</p>
        <strong>{snapshot.status === 'wave' ? `${snapshot.enemiesOnField} on path` : `Wave ${snapshot.wave} ready`}</strong>
      </div>

      <div className="tower-bar" aria-label="Tower shop">
        {Object.values(towerTypes).map((tower) => {
          const affordable = snapshot.coins >= tower.price;
          return (
            <button
              className={`tower-card ${snapshot.selectedTower === tower.id ? 'tower-card-active' : ''}`}
              type="button"
              key={tower.id}
              onClick={() => commitState(selectTower(stateRef.current, tower.id))}
            >
              <span className="tower-card-art" style={{ '--tower-accent': tower.color }}>
                <img src={defenseAssetUrls[tower.art]} alt="" />
              </span>
              <span className="tower-card-copy">
                <strong>{tower.name}</strong>
                <span>{tower.role}</span>
                <small>{tower.price} biscuits</small>
              </span>
              <span className={`tower-card-range ${affordable ? '' : 'tower-card-range-locked'}`}>{tower.range}</span>
            </button>
          );
        })}
      </div>

      {snapshot.status === 'won' || snapshot.status === 'lost' ? (
        <div className="defense-result menu-enter">
          <h1>{snapshot.status === 'won' ? 'Yard Saved!' : 'Yard Overrun'}</h1>
          <p>Wave {snapshot.wave} reached</p>
          <p>{snapshot.defeated} troublemakers stopped</p>
          <p>{snapshot.coinsEarned} biscuits earned</p>
          <GameButton onClick={() => commitState(createDefenseState())} size="small">
            Try Again
          </GameButton>
          <GameButton onClick={onBackToModes} size="small">
            Game Modes
          </GameButton>
          <GameButton onClick={onMainMenu} size="small">
            Main Menu
          </GameButton>
        </div>
      ) : null}
    </main>
  );
}

function DefenseStat({ label, value }) {
  return (
    <div className="defense-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function makeSnapshot(state) {
  return {
    status: state.status,
    lives: state.lives,
    coins: state.coins,
    wave: Math.min(waves.length, state.waveIndex + 1),
    selectedTower: state.selectedTower,
    message: state.message,
    paused: state.paused,
    enemiesOnField: state.enemies.length + state.spawnQueue.length,
    defeated: state.defeated,
    coinsEarned: state.coinsEarned,
  };
}

function findTowerAt(point, towers) {
  return towers.find((tower) => Math.hypot(tower.x - point.x, tower.y - point.y) < 28);
}
