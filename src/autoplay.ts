import { CellState } from "./types";

const GRID_SIZE = 5;
const LETTER_FILL_DELAY = 120;
const PAUSE_BEFORE_EVAL = 300;
const CELL_REVEAL_DELAY = 80;
const PAUSE_BEFORE_RESTART = 2000;

// Sample demo data for the auto-play animation
const DEMO_LETTERS = [
  ["S", "T", "A", "R", "T"],
  ["H", "E", "L", "L", "O"],
  ["A", "R", "E", "N", "A"],
  ["R", "I", "S", "E", "S"],
  ["P", "E", "N", "C", "H"],
];

// Predetermined states for visual variety
const DEMO_STATES: CellState[][] = [
  [CellState.Correct, CellState.MisplacedRow, CellState.Correct, CellState.Absent, CellState.MisplacedCol],
  [CellState.MisplacedBoth, CellState.Correct, CellState.Absent, CellState.Correct, CellState.MisplacedRow],
  [CellState.Correct, CellState.Correct, CellState.Correct, CellState.Correct, CellState.Correct],
  [CellState.Absent, CellState.MisplacedCol, CellState.Correct, CellState.MisplacedBoth, CellState.Correct],
  [CellState.MisplacedRow, CellState.Absent, CellState.MisplacedCol, CellState.Correct, CellState.Correct],
];

type MiniCell = HTMLDivElement;

const createMiniGrid = (container: HTMLElement): MiniCell[][] => {
  container.innerHTML = "";
  const cells: MiniCell[][] = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    cells[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = document.createElement("div");
      cell.className = "mini-cell";
      container.appendChild(cell);
      cells[row][col] = cell;
    }
  }

  return cells;
};

const clearGrid = (cells: MiniCell[][]): void => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      cells[row][col].textContent = "";
      cells[row][col].className = "mini-cell";
    }
  }
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const startAutoPlay = (container: HTMLElement): (() => void) => {
  let running = true;
  const cells = createMiniGrid(container);

  const runLoop = async (): Promise<void> => {
    while (running) {
      // Phase 1: Fill letters one by one
      for (let row = 0; row < GRID_SIZE && running; row++) {
        for (let col = 0; col < GRID_SIZE && running; col++) {
          cells[row][col].textContent = DEMO_LETTERS[row][col];
          await sleep(LETTER_FILL_DELAY);
        }
      }

      if (!running) break;

      // Phase 2: Pause before evaluation
      await sleep(PAUSE_BEFORE_EVAL);

      if (!running) break;

      // Phase 3: Reveal states one by one
      for (let row = 0; row < GRID_SIZE && running; row++) {
        for (let col = 0; col < GRID_SIZE && running; col++) {
          const state = DEMO_STATES[row][col];
          cells[row][col].classList.add(state);
          await sleep(CELL_REVEAL_DELAY);
        }
      }

      if (!running) break;

      // Phase 4: Pause before restart
      await sleep(PAUSE_BEFORE_RESTART);

      if (!running) break;

      // Reset for next loop
      clearGrid(cells);
    }
  };

  runLoop();

  return () => {
    running = false;
  };
};
