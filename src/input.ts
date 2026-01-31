import { CellState, Mode, type State } from "./types";
import { SIZE } from "./constants";
import { submitLine } from "./game";
import { render } from "./render";
import { cells, keyboardKeys } from "./dom";
import { shakeCells, animateCorrectLetter, animateCorrectLine, celebratePuzzleComplete } from "./animations";
import { getCurrentPuzzleIndex } from "./puzzle";
import { markPuzzleSolved } from "./storage";
import { getCurrentLanguage } from "./i18n";

const getLineCells = (state: State): HTMLElement[] =>
  state.mode === Mode.Row
    ? cells[state.cursor.row]
    : cells.map((row) => row[state.cursor.col]);

const toggleMode = (state: State): void => {
  state.mode = state.mode === Mode.Row ? Mode.Col : Mode.Row;
};

const moveCursor = (
  state: State,
  direction: "up" | "down" | "left" | "right"
): void => {
  const delta = direction === "down" || direction === "right" ? 1 : SIZE - 1;

  if (direction === "up" || direction === "down") {
    state.cursor.row = (state.cursor.row + delta) % SIZE;
  } else {
    state.cursor.col = (state.cursor.col + delta) % SIZE;
  }
};

const handleBackspace = (state: State): void => {
  const { row, col } = state.cursor;
  const cell = state.grid[row][col];

  if (cell.state !== CellState.Correct) {
    state.grid[row][col] = { letter: "", state: CellState.Empty };
  }

  if (state.mode === Mode.Row) {
    state.cursor.col = Math.max(state.cursor.col - 1, 0);
  } else {
    state.cursor.row = Math.max(state.cursor.row - 1, 0);
  }
};

const handleLetterInput = (state: State, letter: string): void => {
  const { row, col } = state.cursor;
  const cell = state.grid[row][col];

  if (cell.state === CellState.Correct) return;

  cell.letter = letter.toUpperCase();

  if (state.mode === Mode.Row) {
    state.cursor.col = Math.min(SIZE - 1, state.cursor.col + 1);
  } else {
    state.cursor.row = Math.min(SIZE - 1, state.cursor.row + 1);
  }
};

const setCursor = (state: State, row: number, col: number): void => {
  state.cursor.row = row;
  state.cursor.col = col;
};

export const setupInputHandlers = (state: State): void => {
  window.addEventListener("keydown", (event) => {
    switch (event.key) {
      case " ":
        event.preventDefault();
        toggleMode(state);
        break;
      case "ArrowUp":
        moveCursor(state, "up");
        break;
      case "ArrowDown":
        moveCursor(state, "down");
        break;
      case "ArrowLeft":
        moveCursor(state, "left");
        break;
      case "ArrowRight":
        moveCursor(state, "right");
        break;
      case "Backspace":
        handleBackspace(state);
        break;
      case "Enter": {
        const result = submitLine(state);
        if (!result.success) {
          const lineCells = getLineCells(state);
          const direction = state.mode === Mode.Row ? "horizontal" : "vertical";
          shakeCells(lineCells, direction);
        } else if (result.puzzleComplete) {
          markPuzzleSolved(getCurrentLanguage(), getCurrentPuzzleIndex());
          celebratePuzzleComplete(cells);
        } else if (result.lineComplete) {
          const lineCells = getLineCells(state);
          animateCorrectLine(lineCells);
        } else if (result.newlyCorrect.length > 0) {
          result.newlyCorrect.forEach(({ row, col }) => {
            animateCorrectLetter(cells[row][col]);
          });
        }
        break;
      }
      default:
        if (/^[a-zA-Z]$/.test(event.key)) {
          handleLetterInput(state, event.key);
        }
    }

    if (import.meta.env.DEV) console.info("state", state);
    render(state);
  });

  // Double-tap detection for touch devices
  let lastTapTime = 0;
  let lastTapCell: { row: number; col: number } | null = null;
  const DOUBLE_TAP_DELAY = 300;

  cells.forEach((rowCells, row) => {
    rowCells.forEach((cell, col) => {
      cell.addEventListener("click", () => {
        setCursor(state, row, col);
        render(state);
      });

      cell.addEventListener("dblclick", () => {
        setCursor(state, row, col);
        toggleMode(state);
        render(state);
      });

      // Touch double-tap support
      cell.addEventListener("touchend", (e) => {
        const now = Date.now();
        const isSameCell = lastTapCell?.row === row && lastTapCell?.col === col;

        if (isSameCell && now - lastTapTime < DOUBLE_TAP_DELAY) {
          e.preventDefault();
          toggleMode(state);
          render(state);
          lastTapTime = 0;
          lastTapCell = null;
        } else {
          lastTapTime = now;
          lastTapCell = { row, col };
        }
      });
    });
  });

  // On-screen keyboard handlers
  const handleKeyboardKey = (key: string): void => {
    switch (key) {
      case "⌫":
        handleBackspace(state);
        break;
      case "ENTER": {
        const result = submitLine(state);
        if (!result.success) {
          const lineCells = getLineCells(state);
          const direction = state.mode === Mode.Row ? "horizontal" : "vertical";
          shakeCells(lineCells, direction);
        } else if (result.puzzleComplete) {
          markPuzzleSolved(getCurrentLanguage(), getCurrentPuzzleIndex());
          celebratePuzzleComplete(cells);
        } else if (result.lineComplete) {
          const lineCells = getLineCells(state);
          animateCorrectLine(lineCells);
        } else if (result.newlyCorrect.length > 0) {
          result.newlyCorrect.forEach(({ row, col }) => {
            animateCorrectLetter(cells[row][col]);
          });
        }
        break;
      }
      default:
        if (/^[A-Z]$/.test(key)) {
          handleLetterInput(state, key);
        }
    }

    if (import.meta.env.DEV) console.info("state", state);
    render(state);
  };

  keyboardKeys.forEach((keyElement, key) => {
    keyElement.addEventListener("click", (e) => {
      e.preventDefault();
      handleKeyboardKey(key);
    });
  });
};
