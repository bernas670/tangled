import { Mode, type LineKnowledge, type State } from "./types";
import { SIZE } from "./constants";
import {
  cells,
  rowMisplacedElements,
  rowAbsentElements,
  colMisplacedElements,
  colAbsentElements,
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

export const render = (state: State): void => {
  renderGrid(state);
  renderHighlights(state);
  renderKnowledgeSet(rowMisplacedElements, state.knowledge.row, "misplaced", "misplaced-row");
  renderKnowledgeSet(rowAbsentElements, state.knowledge.row, "absent", "absent");
  renderKnowledgeSet(colMisplacedElements, state.knowledge.col, "misplaced", "misplaced-col");
  renderKnowledgeSet(colAbsentElements, state.knowledge.col, "absent", "absent");
};
