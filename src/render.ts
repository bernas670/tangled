import { CellState, Mode, type LineKnowledge, type State } from "./types";
import { SIZE } from "./constants";
import {
  cells,
  rowMisplacedElements,
  rowAbsentElements,
  colMisplacedElements,
  colAbsentElements,
  keyboardKeys,
  triesElement,
} from "./dom";

const renderKnowledgeSet = (
  elements: HTMLElement[],
  knowledgeList: LineKnowledge[],
  type: "misplaced" | "absent",
  cellStyle: string
): void => {
  elements.forEach((element, index) => {
    element.replaceChildren();
    const letters = knowledgeList[index][type];

    [...letters].sort().forEach((letter) => {
      const cell = document.createElement("div");
      cell.className = `knowledge-cell ${cellStyle}`;
      cell.textContent = letter;
      element.appendChild(cell);
    });
  });
};

const renderGrid = (state: State): void => {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const cellElement = cells[row][col];
      const cell = state.grid[row][col];

      cellElement.className = "cell";
      cellElement.textContent = cell.letter ?? "";
      cellElement.classList.add(cell.state);
    }
  }
};

const renderHighlights = (state: State): void => {
  const { mode, cursor } = state;
  const line =
    mode === Mode.Row
      ? cells[cursor.row]
      : cells.map((row) => row[cursor.col]);

  line.forEach((cell) => cell.classList.add("highlight"));
  cells[cursor.row][cursor.col].classList.add("cursor");
};

const KEYBOARD_STATE_CLASSES = ["correct", "misplaced-row", "misplaced-col", "absent"];

const renderTries = (state: State): void => {
  const totalTries =
    state.tries.row.reduce((sum, t) => sum + t, 0) +
    state.tries.col.reduce((sum, t) => sum + t, 0);
  triesElement.textContent = String(totalTries);
};

const renderKeyboard = (state: State): void => {
  const { mode, cursor } = state;
  const lineIndex = mode === Mode.Row ? cursor.row : cursor.col;
  const lineKnowledge = mode === Mode.Row
    ? state.knowledge.row[lineIndex]
    : state.knowledge.col[lineIndex];
  const misplacedClass = mode === Mode.Row ? "misplaced-row" : "misplaced-col";
  const lineCells = mode === Mode.Row
    ? state.grid[cursor.row]
    : state.grid.map(r => r[cursor.col]);
  const correctLetters = lineCells.filter(c => c.state === CellState.Correct).map(c => c.letter);


  keyboardKeys.forEach((keyElement, key) => {
    // Skip non-letter keys
    if (!/^[A-Z]$/.test(key)) return;

    // Remove all state classes first
    keyElement.classList.remove(...KEYBOARD_STATE_CLASSES);

    // Apply correct class
    if (correctLetters.includes(key)) {
      keyElement.classList.add("correct");
    }

    // Apply appropriate class based on knowledge
    if (lineKnowledge.misplaced.has(key)) {
      keyElement.classList.add(misplacedClass);
    } else if (lineKnowledge.absent.has(key)) {
      keyElement.classList.add("absent");
    }
  });
};

export const render = (state: State): void => {
  renderGrid(state);
  renderHighlights(state);
  renderKnowledgeSet(rowMisplacedElements, state.knowledge.row, "misplaced", "misplaced-row");
  renderKnowledgeSet(rowAbsentElements, state.knowledge.row, "absent", "absent");
  renderKnowledgeSet(colMisplacedElements, state.knowledge.col, "misplaced", "misplaced-col");
  renderKnowledgeSet(colAbsentElements, state.knowledge.col, "absent", "absent");
  renderTries(state);
  renderKeyboard(state);
};
