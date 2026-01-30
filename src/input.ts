import { CellState, Mode, type State } from "./types";
import { SIZE } from "./constants";
import { submitLine } from "./game";
import { render } from "./render";
import { cells } from "./dom";

const getLineCells = (state: State): HTMLElement[] =>
  state.mode === Mode.Row
    ? cells[state.cursor.row]
    : cells.map((row) => row[state.cursor.col]);

const shakeInvalidWord = (state: State): void => {
  const lineCells = getLineCells(state);
  const isRow = state.mode === Mode.Row;

  const keyframes = isRow
    ? [
        { transform: "translateX(0)" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(-4px)" },
        { transform: "translateX(4px)" },
        { transform: "translateX(0)" },
      ]
    : [
        { transform: "translateY(0)" },
        { transform: "translateY(-6px)" },
        { transform: "translateY(6px)" },
        { transform: "translateY(-4px)" },
        { transform: "translateY(4px)" },
        { transform: "translateY(0)" },
      ];

  lineCells.forEach((cell) => {
    cell.animate(keyframes, { duration: 400, easing: "ease-in-out" });
  });
};

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
        if (!result.success && result.error === "invalid") {
          shakeInvalidWord(state);
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
    });
  });
};
