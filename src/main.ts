import { CellState, Mode, type Cell, type LineKnowledge, type State } from "./types";
const puzzle = [
  "MONEL", 
  "URINE", 
  "RASTA", 
  "ATTER", 
  "LEERY"
].map(w => w.split(""));

const SIZE = 5;

const emptyKnowledge = (): LineKnowledge => ({
  misplaced: new Set<string>(),
  absent: new Set<string>(),
});

const state: State = {
  mode: Mode.Row,
  cursor: { row: 0, col: 0 },
  grid: Array.from({ length: SIZE }, () => 
    Array.from({ length: SIZE }, () => 
      ({ letter: "", state: CellState.Empty }))
  ),
  knowledge: {
    row: Array.from({ length: SIZE }, emptyKnowledge),
    col: Array.from({ length: SIZE }, emptyKnowledge),
  },
};

let words: Set<string> = new Set();
fetch("/tangled/words.txt")
  .then(response => response.text())
  .then(text => {
    words = new Set(text.split("\n").map(word => word.trim().toUpperCase()));
    console.log("loaded words", words)
  });

const board = document.getElementById("board");
const cells: HTMLElement[][] = [];

for (let r = 0; r < 5; r++) {
  const row: HTMLElement[] = [];
  for (let c = 0; c < 5; c++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.style.gridRow = String(r + 1);
    cell.style.gridColumn = String(c + 1);
    board!.appendChild(cell);
    row.push(cell);
  }
  cells.push(row);
}

const rowKnowledgeEls = Array.from({ length: 5 }, () => {
  const root = document.createElement("div");
  root.className = "knowledge row";
  board!.appendChild(root);
  return root;
});

const colKnowledgeEls = Array.from({ length: 5 }, () => {
  const root = document.createElement("div");
  root.className = "knowledge col";
  board!.appendChild(root);
  return root;
});

const renderRowKnowledge = (state: State) => {
  rowKnowledgeEls.forEach((elem, i) => {
    elem.replaceChildren();

    const { misplaced, absent } = state.knowledge.row[i];

    [...misplaced].sort().forEach(letter => {
      const cell = document.createElement("div");
      cell.className = "knowledge-cell misplaced-row";
      cell.textContent = letter;
      elem.appendChild(cell);
    });

    [...absent].sort().forEach(letter => {
      const cell = document.createElement("div");
      cell.className = "knowledge-cell absent";
      cell.textContent = letter;
      elem.appendChild(cell);
    });
  });
};

const renderColKnowledge = (state: State) => {
  colKnowledgeEls.forEach((elem, i) => {
    elem.replaceChildren();

    const { misplaced, absent } = state.knowledge.col[i];

    [...misplaced].sort().forEach(letter => {
      const cell = document.createElement("div");
      cell.className = "knowledge-cell misplaced-col";
      cell.textContent = letter;
      elem.appendChild(cell);
    });

    [...absent].sort().forEach(letter => {
      const cell = document.createElement("div");
      cell.className = "knowledge-cell absent";
      cell.textContent = letter;
      elem.appendChild(cell);
    });
  });
};

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
  // todo: add hightlight to knowledge
  // rowKnowledgeEls[row].classList.add("highlight");
  // colKnowledgeEls[col].classList.add("highlight");

  renderColKnowledge(state);
  renderRowKnowledge(state);
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
    state.cursor.col = (state.cursor.col + 4) % 5;
  }

  if (e.key === "ArrowRight") {
    state.cursor.col = (state.cursor.col + 1) % 5;
  }

  if (e.key === "Backspace") {
    // todo: revise backspace movement when
    //  - previous letter is correct
    //  - at the end or col/row
    const { row, col } = state.cursor;
    const cell = state.grid[row][col];

    if (cell.state !== CellState.Correct) {
      state.grid[state.cursor.row][state.cursor.col] = {
        letter: "", state: CellState.Empty
      };
    }

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

const handleSubmission = (line: Cell[], solution: string[][], state: State) => {
  const word = line.map(cell => cell.letter).join("");

  if (word.length < SIZE) {
    console.error(`"${word}" is not ${SIZE} characters long!`)
    return;
  }
  
  if (!words.has(word)) {
    console.error(`"${word}" is not a valid word!`)
    return;
  }


  const { mode, cursor: { row, col } } = state;

  // get correct letters
  line.forEach((cell, i) => {
    const r = mode === Mode.Row ? row : i;
    const c = mode === Mode.Row ? i : col;

    const correct = mode === Mode.Row
      ? solution[row][i]
      : solution[i][col];
    if (cell.letter === correct) {
      cell.state = CellState.Correct;
    }

    state.knowledge.col[c].misplaced.delete(cell.letter)
    state.knowledge.row[r].misplaced.delete(cell.letter)
  });

  line.forEach((cell, i) => {
    const r = mode === Mode.Row ? row : i;
    const c = mode === Mode.Row ? i : col;

    if (cell.state === CellState.Correct) return;

    // clear previous knowledge
    state.knowledge.row[r].misplaced.delete(cell.letter);
    state.knowledge.row[r].absent.delete(cell.letter);
    state.knowledge.col[c].misplaced.delete(cell.letter);
    state.knowledge.col[c].absent.delete(cell.letter);

    const inRow = puzzle[r].includes(cell.letter);
    const inCol = puzzle.some(row => row[c] === cell.letter);

    if (inRow && inCol) {
      cell.state = CellState.MisplacedBoth;
      state.knowledge.row[r].misplaced.add(cell.letter);
      state.knowledge.col[c].misplaced.add(cell.letter);
    }
    else if (inRow) {
      cell.state = CellState.MisplacedRow;
      state.knowledge.row[r].misplaced.add(cell.letter);
      state.knowledge.col[c].absent.add(cell.letter);
    }
    else if (inCol) {
      cell.state = CellState.MisplacedCol;
      state.knowledge.col[c].misplaced.add(cell.letter);
      state.knowledge.row[r].absent.add(cell.letter);
    }
    else {
      cell.state = CellState.Absent;
      state.knowledge.row[r].absent.add(cell.letter);
      state.knowledge.col[c].absent.add(cell.letter);
    }
  });

};

function handleSubmit() {
  const { mode, grid, cursor: { row, col } } = state;
  const line = mode === "row"
    ? grid[row]
    : grid.map(r => r[col]);

  handleSubmission(line, puzzle, state);
  console.info("state", state);
}

render();
