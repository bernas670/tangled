import { CellState, Mode, type LineKnowledge, type State } from "./types";
import { SIZE } from "./constants";

const createEmptyKnowledge = (): LineKnowledge => ({
  misplaced: new Set<string>(),
  absent: new Set<string>(),
});

export const createInitialState = (): State => ({
  mode: Mode.Row,
  cursor: { row: 0, col: 0 },
  grid: Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({ letter: "", state: CellState.Empty }))
  ),
  knowledge: {
    row: Array.from({ length: SIZE }, createEmptyKnowledge),
    col: Array.from({ length: SIZE }, createEmptyKnowledge),
  },
  tries: {
    row: Array.from({ length: SIZE }, () => 0),
    col: Array.from({ length: SIZE }, () => 0),
  },
});

export const state: State = createInitialState();

export const resetState = (s: State): void => {
  const fresh = createInitialState();
  s.mode = fresh.mode;
  s.cursor = fresh.cursor;
  s.grid = fresh.grid;
  s.knowledge = fresh.knowledge;
  s.tries = fresh.tries;
};
