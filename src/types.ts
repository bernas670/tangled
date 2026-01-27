export enum CellState {
  Empty = "empty",
  Correct = "correct",
  Misplaced = "misplaced",
  Absent = "absent",
};

export type Cell = {
  letter: string;
  state: CellState;
};

export type LineKnowledge = {
  [CellState.Misplaced]: Set<string>,
  [CellState.Absent]: Set<string>,
}

export enum Mode {
  Row = "row",
  Col = "col",
};

export type State = {
  mode: Mode;
  cursor: {
    row: number,
    col: number,
  }
  grid: Cell[][];
  knowledge: {
    row: LineKnowledge[];
    col: LineKnowledge[];
  };
};

