import { Mode, type LineKnowledge, type State } from "./types";
import { SIZE } from "./constants";
import { cells, rowKnowledgeElements, colKnowledgeElements } from "./dom";

type KnowledgeStyle = "misplaced-row" | "misplaced-col";

const renderKnowledge = (
  elements: HTMLElement[],
  knowledgeList: LineKnowledge[],
  misplacedStyle: KnowledgeStyle
): void => {
  elements.forEach((element, index) => {
    element.replaceChildren();
    const { misplaced, absent } = knowledgeList[index];

    [...misplaced].sort().forEach((letter) => {
      const cell = document.createElement("div");
      cell.className = `knowledge-cell ${misplacedStyle}`;
      cell.textContent = letter;
      element.appendChild(cell);
    });

    [...absent].sort().forEach((letter) => {
      const cell = document.createElement("div");
      cell.className = "knowledge-cell absent";
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
  renderKnowledge(rowKnowledgeElements, state.knowledge.row, "misplaced-row");
  renderKnowledge(colKnowledgeElements, state.knowledge.col, "misplaced-col");
};
