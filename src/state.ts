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
});

export const state: State = createInitialState();
