import { SIZE } from "./constants";

const board = document.getElementById("board")!;

const createGridCells = (): HTMLElement[][] => {
  const cells: HTMLElement[][] = [];

  for (let row = 0; row < SIZE; row++) {
    const rowCells: HTMLElement[] = [];
    for (let col = 0; col < SIZE; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.style.gridRow = String(row + 2); // offset by 1 for top knowledge row
      cell.style.gridColumn = String(col + 2); // offset by 1 for left knowledge column
      board.appendChild(cell);
      rowCells.push(cell);
    }
    cells.push(rowCells);
  }

  return cells;
};

type KnowledgePosition = {
  className: string;
  gridRow: (index: number) => string;
  gridColumn: (index: number) => string;
};

const createKnowledgeElements = (position: KnowledgePosition): HTMLElement[] =>
  Array.from({ length: SIZE }, (_, index) => {
    const element = document.createElement("div");
    element.className = `knowledge ${position.className}`;
    element.style.gridRow = position.gridRow(index);
    element.style.gridColumn = position.gridColumn(index);
    board.appendChild(element);
    return element;
  });

export const cells = createGridCells();

// Row knowledge: left (misplaced) and right (absent)
export const rowMisplacedElements = createKnowledgeElements({
  className: "row-misplaced",
  gridRow: (i) => String(i + 2),
  gridColumn: () => "1",
});
export const rowAbsentElements = createKnowledgeElements({
  className: "row-absent",
  gridRow: (i) => String(i + 2),
  gridColumn: () => "7",
});

// Column knowledge: top (misplaced) and bottom (absent)
export const colMisplacedElements = createKnowledgeElements({
  className: "col-misplaced",
  gridRow: () => "1",
  gridColumn: (i) => String(i + 2),
});
export const colAbsentElements = createKnowledgeElements({
  className: "col-absent",
  gridRow: () => "7",
  gridColumn: (i) => String(i + 2),
});
