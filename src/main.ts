import { CellState, Mode, type Cell, type State } from "./types";
const puzzle = [
  "MONEL", 
  "URINE", 
  "RASTA", 
  "ATTER", 
  "LEERY"
].map(w => w.split(""));

const SIZE = 5;

const state: State = {
  mode: Mode.Row,
  cursor: { row: 0, col: 0 },
  grid: Array.from({ length: SIZE }, () => 
    Array.from({ length: SIZE }, () => 
      ({ letter: "", state: CellState.Empty }))
  ),
};

const grid = document.getElementById("grid");
const cells: HTMLElement[][] = [];
for (let r = 0; r < 5; r++) {
  const row = [];
  for (let c = 0; c < 5; c++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    grid?.appendChild(cell);
    row.push(cell);
  }
  cells.push(row);
}

function render() {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const cellEl = cells[row][col];
      const cell = state.grid[row][col];

      cellEl.className = "cell";
      cellEl.textContent = cell.letter ?? "";
      cellEl.classList.add(cell.state);
    }
  }

  // highlight row or column
  const { mode, cursor: { row, col } } = state;
  const line = mode === "row"
    ? cells[row]
    : cells.map(r => r[col]);
  line.forEach(cell => cell.classList.add("highlight"));
  cells[row][col].classList.add("cursor");
}

window.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    e.preventDefault();
    state.mode = state.mode === Mode.Row ? Mode.Col : Mode.Row;
  }

  if (e.key === "ArrowUp") {
    state.cursor.row = (state.cursor.row + 4) % 5;
  }

  if (e.key === "ArrowDown") {
    state.cursor.row = (state.cursor.row + 1) % 5;
  }

  if (e.key === "ArrowLeft") {
    state.cursor.col = Math.max(0, state.cursor.col - 1);
  }

  if (e.key === "ArrowRight") {
    state.cursor.col = Math.max(0, state.cursor.col + 1);
  }

  if (e.key === "Backspace") {
    const { row, col } = state.cursor;
    const cell = state.grid[row][col];

    if (cell.state === CellState.Correct) return;

    state.grid[state.cursor.row][state.cursor.col] = {
      letter: "", state: CellState.Empty
    };
    if (state.mode === "row") {
        state.cursor.col = Math.max(state.cursor.col - 1, 0);
    } else {
      state.cursor.row = Math.max(state.cursor.row - 1, 0);
    }
  }

  if (/^[a-zA-Z]$/.test(e.key)) {
    const { row, col } = state.cursor;
    const cell = state.grid[row][col];

    if (cell.state === CellState.Correct) return;

    cell.letter = e.key.toUpperCase();

    if (state.mode === Mode.Row) {
      state.cursor.col = Math.min(4, state.cursor.col + 1);
    } else {
      state.cursor.row = Math.min(4, state.cursor.row + 1);
    }
  }

  if (e.key === "Enter") {
    handleSubmit();
  }

  render();
});

function getAvailableLetters(solution: string[][], grid: Cell[][], row: number, col: number): Map<string, number> {
  const counts = new Map<string, number>();

  // count cells in solution
  solution[row].forEach(letter => counts.set(letter, (counts.get(letter) ?? 0) + 1));
  solution.forEach((r, i) => {
    if (i === row) return;
    const letter = r[col];
    counts.set(letter, (counts.get(letter) ?? 0) + 1)
  });

  // remove correct cells in grid
  grid[row].forEach(({letter, state}, i) => {
    if (state === CellState.Correct) counts.set(letter, counts.get(letter)! - 1);
  });
  grid.forEach((r, i) => {
    if (i === row) return;
    const {letter, state} = r[col];
    if (state === CellState.Correct) counts.set(letter, counts.get(letter)! - 1);
  });

  return counts;
}

function checkWord(cells: Cell[], solution: string[][], {mode, cursor: {row, col}, grid}: State) {
  const availability = getAvailableLetters(solution, grid, row, col);

  const result: CellState[] = Array(SIZE).fill(CellState.Absent);

  // get correct
  cells.forEach(({letter}, i) => {
    const correct = mode === Mode.Row
      ? solution[row][i]
      : solution[i][col];
    if (letter === correct) {
      result[i] = CellState.Correct;
      availability.set(letter, availability.get(letter)! - 1);
    }
  });

  // get misplaced
  cells.forEach(({letter}, i) => {
    if (result[i] !== CellState.Absent) return;
    
    const remaining = availability.get(letter) ?? 0;
    if (remaining > 0) {
      result[i] = CellState.Misplaced;
      availability.set(letter, remaining - 1);
    }
  });

  return result;
}

function handleSubmit() {
  const { mode, grid, cursor: { row, col } } = state;
  const line = mode === "row"
    ? grid[row]
    : grid.map(r => r[col]);
  const word = line.map(cell => cell.letter);
  if (word.length !== 5) {
    console.error("Word must be 5 letters");
    return;
  }

  const solution = mode === "row"
    ? puzzle[row]
    : puzzle.map(r => r[col]).join("");
  
  console.log(`Submit ${mode}: ${word} / ${solution}`);
  const result = checkWord(line, puzzle, state);
  console.log(result);

  result.forEach((cellState, i) => {
    const cell = mode === "row" ? state.grid[row][i] : state.grid[i][col];
    cell.state = cellState;
  })
}

render();
