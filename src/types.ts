export enum CellState {
  Empty = "empty",
  Correct = "correct",

  MisplacedBoth = "misplaced-both",
  MisplacedRow = "misplaced-row",
  MisplacedCol = "misplaced-col",

  Absent = "absent",
};

export type Cell = {
  letter: string;
  state: CellState;
};

export type LineKnowledge = {
  misplaced: Set<string>,
  absent: Set<string>,
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
  tries: {
    row: number[];
    col: number[];
  };
};

