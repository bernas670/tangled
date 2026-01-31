import { CellState, Mode, type Cell, type State } from "./types";
import { SIZE } from "./constants";
import { getPuzzle, isValidWord } from "./puzzle";

const getLineCoordinates = (
  mode: Mode,
  cursorRow: number,
  cursorCol: number,
  index: number
): { row: number; col: number } => ({
  row: mode === Mode.Row ? cursorRow : index,
  col: mode === Mode.Row ? index : cursorCol,
});

const clearKnowledge = (state: State, row: number, col: number, letter: string): void => {
  state.knowledge.row[row].misplaced.delete(letter);
  state.knowledge.row[row].absent.delete(letter);
  state.knowledge.col[col].misplaced.delete(letter);
  state.knowledge.col[col].absent.delete(letter);
};

const updateCellState = (
  state: State,
  cell: Cell,
  row: number,
  col: number
): void => {
  const puzzle = getPuzzle();

  // Check if letter exists in an unfilled position in this row
  const inRow = puzzle[row].some(
    (letter, i) => letter === cell.letter && state.grid[row][i].state !== CellState.Correct
  );

  // Check if letter exists in an unfilled position in this column
  const inCol = puzzle.some(
    (puzzleRow, i) => puzzleRow[col] === cell.letter && state.grid[i][col].state !== CellState.Correct
  );

  if (inRow && inCol) {
    cell.state = CellState.MisplacedBoth;
    state.knowledge.row[row].misplaced.add(cell.letter);
    state.knowledge.col[col].misplaced.add(cell.letter);
  } else if (inRow) {
    cell.state = CellState.MisplacedRow;
    state.knowledge.row[row].misplaced.add(cell.letter);
    state.knowledge.col[col].absent.add(cell.letter);
  } else if (inCol) {
    cell.state = CellState.MisplacedCol;
    state.knowledge.col[col].misplaced.add(cell.letter);
    state.knowledge.row[row].absent.add(cell.letter);
  } else {
    cell.state = CellState.Absent;
    state.knowledge.row[row].absent.add(cell.letter);
    state.knowledge.col[col].absent.add(cell.letter);
  }
};

export type SubmitError = "incomplete" | "invalid";
export type SubmitResult =
  | { success: true; newlyCorrect: Array<{ row: number; col: number }>; lineComplete: boolean; puzzleComplete: boolean }
  | { success: false; error: SubmitError };

export const submitLine = (state: State): SubmitResult => {
  const { mode, grid, cursor } = state;
  const line =
    mode === Mode.Row
      ? grid[cursor.row]
      : grid.map((row) => row[cursor.col]);

  const word = line.map((cell) => cell.letter).join("");

  if (word.length < SIZE) {
    return { success: false, error: "incomplete" };
  }

  if (!isValidWord(word)) {
    return { success: false, error: "invalid" };
  }

  const puzzle = getPuzzle();
  const newlyCorrect: Array<{ row: number; col: number }> = [];

  // First pass: mark correct letters and clear their misplaced status
  line.forEach((cell, index) => {
    const { row, col } = getLineCoordinates(mode, cursor.row, cursor.col, index);
    const correctLetter =
      mode === Mode.Row ? puzzle[cursor.row][index] : puzzle[index][cursor.col];

    const wasCorrect = cell.state === CellState.Correct;
    if (cell.letter === correctLetter) {
      cell.state = CellState.Correct;
      if (!wasCorrect) {
        newlyCorrect.push({ row, col });
      }
    }

    state.knowledge.col[col].misplaced.delete(cell.letter);
    state.knowledge.row[row].misplaced.delete(cell.letter);
  });

  // Second pass: update non-correct cells
  line.forEach((cell, index) => {
    if (cell.state === CellState.Correct) return;

    const { row, col } = getLineCoordinates(mode, cursor.row, cursor.col, index);
    clearKnowledge(state, row, col, cell.letter);
    updateCellState(state, cell, row, col);
  });

  // Increment tries for the current line
  if (mode === Mode.Row) {
    state.tries.row[cursor.row]++;
  } else {
    state.tries.col[cursor.col]++;
  }

  const lineComplete = line.every((cell) => cell.state === CellState.Correct);
  const puzzleComplete = grid.every((row) => row.every((cell) => cell.state === CellState.Correct));

  return { success: true, newlyCorrect, lineComplete, puzzleComplete };
};
