import { itemTypeIds } from './matchItems.js';

export const boardSize = 8;
export const levelGoal = 1500;
export const levelMoves = 25;

let nextTileId = 1;

export function createMatchState() {
  return {
    board: createPlayableBoard(),
    score: 0,
    movesLeft: levelMoves,
    status: 'playing',
    message: 'Make a match to start!',
    combo: 0,
    powerUps: {
      rocket: 1,
      paw: 1,
      shuffle: 0,
    },
  };
}

export function swapTiles(board, from, to) {
  const next = cloneBoard(board);
  const a = next[from.row][from.col];
  next[from.row][from.col] = next[to.row][to.col];
  next[to.row][to.col] = a;
  return next;
}

export function areAdjacent(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

export function findMatches(board) {
  const matched = new Map();
  const groups = [];

  for (let row = 0; row < boardSize; row += 1) {
    let run = [position(row, 0)];
    for (let col = 1; col < boardSize; col += 1) {
      if (board[row][col]?.type === board[row][col - 1]?.type) {
        run.push(position(row, col));
      } else {
        collectRun(run, matched, groups);
        run = [position(row, col)];
      }
    }
    collectRun(run, matched, groups);
  }

  for (let col = 0; col < boardSize; col += 1) {
    let run = [position(0, col)];
    for (let row = 1; row < boardSize; row += 1) {
      if (board[row][col]?.type === board[row - 1][col]?.type) {
        run.push(position(row, col));
      } else {
        collectRun(run, matched, groups);
        run = [position(row, col)];
      }
    }
    collectRun(run, matched, groups);
  }

  return {
    tiles: [...matched.values()],
    groups,
  };
}

export function removeMatches(board, matches) {
  return removePositions(board, matches.tiles);
}

export function removePositions(board, positions) {
  const next = cloneBoard(board);
  for (const tile of uniquePositions(positions)) {
    next[tile.row][tile.col] = null;
  }
  return next;
}

export function collapseAndRefill(board) {
  const next = makeEmptyBoard();

  for (let col = 0; col < boardSize; col += 1) {
    const stack = [];
    for (let row = boardSize - 1; row >= 0; row -= 1) {
      if (board[row][col]) {
        stack.push(board[row][col]);
      }
    }

    for (let row = boardSize - 1; row >= 0; row -= 1) {
      next[row][col] = stack.shift() || createTile(randomType());
    }
  }

  return next;
}

export function calculateMatchScore(matches, combo) {
  return matches.groups.reduce((total, group) => {
    const base = group.length * 80;
    const bonus = group.length >= 4 ? (group.length - 3) * 180 : 0;
    return total + Math.floor((base + bonus) * (1 + combo * 0.18));
  }, 0);
}

export function calculatePowerUpRewards(matches, combo) {
  const rewards = {
    rocket: 0,
    paw: 0,
    shuffle: 0,
  };

  for (const group of matches.groups) {
    if (group.length >= 4) {
      rewards.rocket += 1;
    }
    if (group.length >= 5) {
      rewards.paw += 1;
    }
  }

  if (combo >= 2) {
    rewards.shuffle += 1;
  }

  return rewards;
}

export function getRocketPositions(tile) {
  return Array.from({ length: boardSize }, (_, col) => ({ row: tile.row, col }));
}

export function getPawBlastPositions(tile) {
  const positions = [];
  for (let row = tile.row - 1; row <= tile.row + 1; row += 1) {
    for (let col = tile.col - 1; col <= tile.col + 1; col += 1) {
      if (isInside({ row, col })) {
        positions.push({ row, col });
      }
    }
  }
  return positions;
}

export function mergePowerUps(current, rewards) {
  return {
    rocket: current.rocket + rewards.rocket,
    paw: current.paw + rewards.paw,
    shuffle: current.shuffle + rewards.shuffle,
  };
}

export function hasPossibleMove(board) {
  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      const here = position(row, col);
      const neighbors = [position(row + 1, col), position(row, col + 1)];
      for (const next of neighbors) {
        if (!isInside(next)) {
          continue;
        }
        const swapped = swapTiles(board, here, next);
        if (findMatches(swapped).tiles.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
}

export function shuffleBoard(board) {
  const flat = board.flat().filter(Boolean);
  let shuffled = board;
  let attempts = 0;

  do {
    attempts += 1;
    const pool = [...flat].sort(() => Math.random() - 0.5);
    shuffled = makeEmptyBoard().map((row) => row.map(() => pool.pop()));
  } while ((findMatches(shuffled).tiles.length > 0 || !hasPossibleMove(shuffled)) && attempts < 80);

  return attempts >= 80 ? createPlayableBoard() : shuffled;
}

export function getTileKey(tile) {
  return tile ? tile.id : 'empty';
}

function createPlayableBoard() {
  let board;
  let attempts = 0;

  do {
    attempts += 1;
    board = makeEmptyBoard();
    for (let row = 0; row < boardSize; row += 1) {
      for (let col = 0; col < boardSize; col += 1) {
        board[row][col] = createTile(randomAllowedType(board, row, col));
      }
    }
  } while (!hasPossibleMove(board) && attempts < 100);

  return attempts >= 100 ? createPlayableBoard() : board;
}

function randomAllowedType(board, row, col) {
  let options = itemTypeIds;

  if (board) {
    options = itemTypeIds.filter((type) => {
      const horizontalMatch =
        col >= 2 && board[row][col - 1]?.type === type && board[row][col - 2]?.type === type;
      const verticalMatch =
        row >= 2 && board[row - 1][col]?.type === type && board[row - 2][col]?.type === type;
      return !horizontalMatch && !verticalMatch;
    });
  }

  return options[Math.floor(Math.random() * options.length)];
}

function randomType() {
  return itemTypeIds[Math.floor(Math.random() * itemTypeIds.length)];
}

function createTile(type) {
  return {
    id: nextTileId++,
    type,
  };
}

function collectRun(run, matched, groups) {
  if (run.length < 3) {
    return;
  }

  groups.push(run);
  for (const tile of run) {
    matched.set(`${tile.row}:${tile.col}`, tile);
  }
}

function uniquePositions(positions) {
  return [...new Map(positions.map((tile) => [`${tile.row}:${tile.col}`, tile])).values()];
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function makeEmptyBoard() {
  return Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => null));
}

function position(row, col) {
  return { row, col };
}

function isInside(tile) {
  return tile.row >= 0 && tile.row < boardSize && tile.col >= 0 && tile.col < boardSize;
}
