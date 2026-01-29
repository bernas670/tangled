import { SIZE } from "./constants";

const board = document.getElementById("board")!;

const createGridCells = (): HTMLElement[][] => {
  const cells: HTMLElement[][] = [];

  for (let row = 0; row < SIZE; row++) {
    const rowCells: HTMLElement[] = [];
    for (let col = 0; col < SIZE; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.style.gridRow = String(row + 1);
      cell.style.gridColumn = String(col + 1);
      board.appendChild(cell);
      rowCells.push(cell);
    }
    cells.push(rowCells);
  }

  return cells;
};

const createKnowledgeElements = (className: string): HTMLElement[] =>
  Array.from({ length: SIZE }, () => {
    const element = document.createElement("div");
    element.className = `knowledge ${className}`;
    board.appendChild(element);
    return element;
  });

export const cells = createGridCells();
export const rowKnowledgeElements = createKnowledgeElements("row");
export const colKnowledgeElements = createKnowledgeElements("col");
