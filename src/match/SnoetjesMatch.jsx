import { useEffect, useMemo, useRef, useState } from 'react';
import { GameButton } from '../components/GameButton.jsx';
import {
  areAdjacent,
  boardSize,
  calculateMatchScore,
  calculatePowerUpRewards,
  collapseAndRefill,
  createMatchState,
  findMatches,
  getPawBlastPositions,
  getRocketPositions,
  getTileKey,
  hasPossibleMove,
  levelGoal,
  levelMoves,
  mergePowerUps,
  removePositions,
  removeMatches,
  shuffleBoard,
  swapTiles,
} from './matchEngine.js';
import { itemTypes } from './matchItems.js';
import { matchAssetUrls, preloadMatchAssets } from './matchAssets.js';

const cascadeDelay = 280;
const swipeThreshold = 22;
const specialImpactDelay = {
  rocket: 560,
  paw: 390,
  shuffle: 440,
};
const specialEffectLifetime = {
  rocket: 980,
  paw: 780,
  shuffle: 700,
};

export function SnoetjesMatch({ onBackToModes, onMainMenu }) {
  const [game, setGame] = useState(() => createMatchState());
  const [selected, setSelected] = useState(null);
  const [matchedTiles, setMatchedTiles] = useState([]);
  const [invalidTiles, setInvalidTiles] = useState([]);
  const [popups, setPopups] = useState([]);
  const [specialEffects, setSpecialEffects] = useState([]);
  const [isResolving, setIsResolving] = useState(false);
  const [activePowerUp, setActivePowerUp] = useState(null);
  const dragStartRef = useRef(null);
  const itemById = useMemo(
    () => Object.fromEntries(itemTypes.map((item) => [item.id, item])),
    [],
  );

  useEffect(() => {
    preloadMatchAssets();
  }, []);

  function restart() {
    setGame(createMatchState());
    setSelected(null);
    setMatchedTiles([]);
    setInvalidTiles([]);
    setPopups([]);
    setSpecialEffects([]);
    setIsResolving(false);
    setActivePowerUp(null);
  }

  async function trySwap(from, to) {
    if (isResolving || game.status !== 'playing' || !areAdjacent(from, to)) {
      setInvalidTiles([from, to].filter(Boolean));
      window.setTimeout(() => setInvalidTiles([]), 260);
      return;
    }

    setIsResolving(true);
    setSelected(null);

    const swapped = swapTiles(game.board, from, to);
    setGame((current) => ({ ...current, board: swapped, message: 'Checking...' }));
    await wait(170);

    const matches = findMatches(swapped);
    if (matches.tiles.length === 0) {
      setInvalidTiles([from, to]);
      setGame((current) => ({
        ...current,
        board: game.board,
        message: 'Try a move that makes 3 in a row.',
      }));
      await wait(240);
      setInvalidTiles([]);
      setIsResolving(false);
      return;
    }

    await resolveCascades(swapped, game.score, game.movesLeft - 1);
    setIsResolving(false);
  }

  async function resolveCascades(startBoard, startScore, movesLeft) {
    let board = startBoard;
    let score = startScore;
    let combo = 0;
    let totalGain = 0;

    // Cascades are resolved step-by-step so each clear/fall/refill remains readable.
    while (true) {
      const matches = findMatches(board);
      if (matches.tiles.length === 0) {
        break;
      }

      const gain = calculateMatchScore(matches, combo);
      const rewards = calculatePowerUpRewards(matches, combo);
      score += gain;
      totalGain += gain;
      setMatchedTiles(matches.tiles);
      addScorePopup(matches.tiles, gain, combo);
      setGame((current) => ({
        ...current,
        board,
        score,
        movesLeft,
        powerUps: mergePowerUps(current.powerUps, rewards),
        message: combo > 0 ? `Combo x${combo + 1}!` : 'Nice match!',
      }));

      await wait(cascadeDelay);
      board = removeMatches(board, matches);
      setGame((current) => ({ ...current, board }));
      await wait(cascadeDelay);
      board = collapseAndRefill(board);
      setMatchedTiles([]);
      setGame((current) => ({ ...current, board }));
      await wait(cascadeDelay);
      combo += 1;
    }

    if (!hasPossibleMove(board)) {
      board = shuffleBoard(board);
      setGame((current) => ({
        ...current,
        board,
        message: 'Board shuffled!',
      }));
      await wait(220);
    }

    const status = score >= levelGoal ? 'won' : movesLeft <= 0 ? 'lost' : 'playing';
    setGame((current) => ({
      ...current,
      board,
      score,
      movesLeft,
      status,
      combo,
      message: makeMessage(status, totalGain),
    }));
  }

  function handleTilePress(row, col) {
    return (event) => {
      dragStartRef.current = {
        row,
        col,
        x: event.clientX,
        y: event.clientY,
        consumed: false,
      };

      event.currentTarget.setPointerCapture?.(event.pointerId);
      handleTileTap(row, col);
    };
  }

  function handleTileMove(row, col) {
    return (event) => {
      const start = dragStartRef.current;
      if (!start || start.consumed || isResolving || game.status !== 'playing') {
        return;
      }

      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      const distance = Math.hypot(dx, dy);
      if (distance < swipeThreshold) {
        return;
      }

      const target = getSwipeTarget(start, dx, dy);
      if (!target) {
        return;
      }

      start.consumed = true;
      setSelected(null);
      trySwap({ row: start.row, col: start.col }, target);
    };
  }

  function handleTileRelease() {
    dragStartRef.current = null;
  }

  function handleTileTap(row, col) {
    if (isResolving || game.status !== 'playing') {
      return;
    }

    const tile = { row, col };
    if (activePowerUp) {
      usePowerUp(activePowerUp, tile);
      return;
    }

    if (!selected) {
      setSelected(tile);
      return;
    }

    if (selected.row === row && selected.col === col) {
      setSelected(null);
      return;
    }

    if (areAdjacent(selected, tile)) {
      trySwap(selected, tile);
    } else {
      setSelected(tile);
    }
  }

  async function usePowerUp(type, tile) {
    if (isResolving || game.status !== 'playing' || game.powerUps[type] <= 0) {
      return;
    }

    setIsResolving(true);
    setSelected(null);
    setActivePowerUp(null);
    const impactDelay = launchPowerUpEffect(type, tile);

    if (type === 'shuffle') {
      setGame((current) => ({ ...current, message: 'Mixing it up!' }));
      await wait(impactDelay);
      const board = shuffleBoard(game.board);
      setGame((current) => ({
        ...current,
        board,
        powerUps: { ...current.powerUps, shuffle: current.powerUps.shuffle - 1 },
        message: 'Fresh board!',
      }));
      await wait(cascadeDelay);
      setIsResolving(false);
      return;
    }

    const positions = type === 'rocket' ? getRocketPositions(tile) : getPawBlastPositions(tile);
    const scoreGain = type === 'rocket' ? 420 : 520;
    setGame((current) => ({
      ...current,
      message: type === 'rocket' ? 'Rocket incoming!' : 'Paw blast charging!',
    }));
    await wait(impactDelay);

    const board = removePositions(game.board, positions);
    setMatchedTiles(positions);
    addScorePopup(positions, scoreGain, 0);
    setGame((current) => ({
      ...current,
      board,
      score: current.score + scoreGain,
      powerUps: { ...current.powerUps, [type]: current.powerUps[type] - 1 },
      message: type === 'rocket' ? 'Rocket row clear!' : 'Paw blast!',
    }));
    await wait(cascadeDelay);
    const collapsed = collapseAndRefill(board);
    setMatchedTiles([]);
    setGame((current) => ({ ...current, board: collapsed }));
    await wait(cascadeDelay);
    await resolveCascades(collapsed, game.score + scoreGain, game.movesLeft);
    setIsResolving(false);
  }

  function launchPowerUpEffect(type, tile) {
    const effect = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      row: tile.row,
      col: tile.col,
    };
    setSpecialEffects((current) => [...current, effect]);
    window.setTimeout(() => {
      setSpecialEffects((current) => current.filter((item) => item.id !== effect.id));
    }, specialEffectLifetime[type]);
    return specialImpactDelay[type];
  }

  function addScorePopup(matches, gain, combo) {
    const center = matches[Math.floor(matches.length / 2)] || { row: 3, col: 3 };
    const popup = {
      id: `${Date.now()}-${Math.random()}`,
      row: center.row,
      col: center.col,
      text: combo > 0 ? `+${gain} combo` : `+${gain}`,
    };
    setPopups((current) => [...current, popup]);
    window.setTimeout(() => {
      setPopups((current) => current.filter((item) => item.id !== popup.id));
    }, 800);
  }

  const progress = Math.min(100, (game.score / levelGoal) * 100);

  return (
    <main className="match-shell" style={{ '--match-garden': `url(${matchAssetUrls.garden})` }}>
      <div className="match-bg" aria-hidden="true">
        <span className="match-cloud match-cloud-one" />
        <span className="match-cloud match-cloud-two" />
        <span className="match-paw-bg match-paw-bg-one" />
        <span className="match-paw-bg match-paw-bg-two" />
        <span className="match-sun-glint" />
      </div>
      <section className="match-game" aria-labelledby="snoetjes-match-title">
        <header className="match-header">
          <button className="back-button" type="button" onClick={onBackToModes}>
            Modes
          </button>
          <div className="match-title-wrap">
            <p className="match-kicker">Level 1</p>
            <h1 id="snoetjes-match-title">Snoetjes Match</h1>
          </div>
          <button className="back-button" type="button" onClick={restart}>
            Restart
          </button>
        </header>

        <div className="match-stats" aria-label="Level status">
          <Stat label="Score" value={game.score} />
          <Stat label="Goal" value={levelGoal} />
          <Stat label="Moves" value={`${game.movesLeft}/${levelMoves}`} />
        </div>

        <div className="match-progress" aria-label="Goal progress">
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="power-up-bar" aria-label="Power ups">
          <PowerUpButton
            active={activePowerUp === 'rocket'}
            count={game.powerUps.rocket}
            label="Rocket"
            onClick={() => setActivePowerUp(activePowerUp === 'rocket' ? null : 'rocket')}
          />
          <PowerUpButton
            active={activePowerUp === 'paw'}
            count={game.powerUps.paw}
            label="Paw Blast"
            onClick={() => setActivePowerUp(activePowerUp === 'paw' ? null : 'paw')}
          />
          <PowerUpButton
            active={activePowerUp === 'shuffle'}
            count={game.powerUps.shuffle}
            label="Shuffle"
            onClick={() => setActivePowerUp(activePowerUp === 'shuffle' ? null : 'shuffle')}
          />
        </div>

        <p className="match-message">{game.message}</p>

        <div
          className={`match-board ${invalidTiles.length ? 'match-board-shake' : ''}`}
          style={{ '--board-size': boardSize }}
          aria-label="Snoetjes Match board"
        >
          {game.board.map((row, rowIndex) =>
            row.map((tile, colIndex) => {
              const position = { row: rowIndex, col: colIndex };
              const item = tile ? itemById[tile.type] : null;
              const selectedClass = isSameTile(selected, position) ? 'match-tile-selected' : '';
              const matchedClass = includesPosition(matchedTiles, position) ? 'match-tile-matched' : '';
              const invalidClass = includesPosition(invalidTiles, position) ? 'match-tile-invalid' : '';

              return (
                <button
                  className={`match-tile ${selectedClass} ${matchedClass} ${invalidClass}`}
                  type="button"
                  key={`${rowIndex}-${colIndex}-${getTileKey(tile)}`}
                  aria-label={item ? `${item.label} at row ${rowIndex + 1}, column ${colIndex + 1}` : 'Empty'}
                  onPointerDown={handleTilePress(rowIndex, colIndex)}
                  onPointerMove={handleTileMove(rowIndex, colIndex)}
                  onPointerUp={handleTileRelease}
                  onPointerCancel={handleTileRelease}
                >
                  {item && (
                    <span
                      className={`match-piece ${item.className}`}
                      style={{
                        '--match-items-sprite': `url(${matchAssetUrls.items})`,
                        '--match-sprite-position': item.spritePosition,
                      }}
                    />
                  )}
                </button>
              );
            }),
          )}
          <PowerUpEffects effects={specialEffects} />
          {popups.map((popup) => (
            <span
              className="score-popup"
              key={popup.id}
              style={{
                gridRow: popup.row + 1,
                gridColumn: popup.col + 1,
              }}
            >
              {popup.text}
            </span>
          ))}
        </div>
      </section>

      {game.status !== 'playing' && (
        <div className="match-result menu-enter">
          <h2>{game.status === 'won' ? 'Goal Cleared!' : 'Out of Moves'}</h2>
          <p>
            {game.status === 'won'
              ? `You scored ${game.score} points.`
              : `You reached ${game.score} of ${levelGoal} points.`}
          </p>
          <GameButton onClick={restart} size="small">
            Try Again
          </GameButton>
          <GameButton onClick={restart} size="small">
            Next Level
          </GameButton>
          <GameButton onClick={onMainMenu} size="small">
            Main Menu
          </GameButton>
        </div>
      )}
    </main>
  );
}

function PowerUpEffects({ effects }) {
  return (
    <div className="match-special-layer" aria-hidden="true">
      {effects.map((effect) => {
        const position = {
          gridRow: effect.row + 1,
          gridColumn: effect.col + 1,
        };

        if (effect.type === 'rocket') {
          return (
            <div className="match-special-effect rocket-special" key={effect.id}>
              <span className="rocket-row-flash" style={{ gridRow: position.gridRow }} />
              <span
                className="rocket-flight"
                style={{
                  gridRow: position.gridRow,
                  '--impact-x': `${((effect.col + 0.5) / boardSize) * 100}%`,
                }}
              >
                <img src={matchAssetUrls.rocket} alt="" />
              </span>
              <span className="rocket-impact" style={position} />
            </div>
          );
        }

        if (effect.type === 'paw') {
          return (
            <div className="match-special-effect paw-special" key={effect.id}>
              <span className="paw-blast-area" style={position}>
                <span
                  className="paw-blast-mark"
                  style={{
                    '--match-items-sprite': `url(${matchAssetUrls.items})`,
                  }}
                />
              </span>
            </div>
          );
        }

        return (
          <div className="match-special-effect shuffle-special" key={effect.id}>
            <span className="shuffle-vortex" />
            <span className="shuffle-spark shuffle-spark-one" />
            <span className="shuffle-spark shuffle-spark-two" />
            <span className="shuffle-spark shuffle-spark-three" />
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="match-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PowerUpButton({ active, count, label, onClick }) {
  return (
    <button
      className={`power-up-button ${active ? 'power-up-active' : ''}`}
      type="button"
      disabled={count <= 0}
      onClick={onClick}
    >
      <span>{label}</span>
      <strong>{count}</strong>
    </button>
  );
}

function getSwipeTarget(start, dx, dy) {
  const horizontal = Math.abs(dx) > Math.abs(dy);
  const target = {
    row: start.row + (horizontal ? 0 : Math.sign(dy)),
    col: start.col + (horizontal ? Math.sign(dx) : 0),
  };

  if (target.row < 0 || target.row >= boardSize || target.col < 0 || target.col >= boardSize) {
    return null;
  }

  return target;
}

function makeMessage(status, gain) {
  if (status === 'won') {
    return 'Goal cleared!';
  }
  if (status === 'lost') {
    return 'No moves left.';
  }
  return gain > 0 ? `Scored ${gain} points!` : 'Keep matching!';
}

function isSameTile(a, b) {
  return Boolean(a && b && a.row === b.row && a.col === b.col);
}

function includesPosition(list, position) {
  return list.some((item) => isSameTile(item, position));
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
