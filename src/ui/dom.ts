import { SIZE } from "../constants";

const board = document.getElementById("board")!;
const keyboardContainer = document.getElementById("keyboard")!;

// Tries counter in top-left corner
const createTriesElement = (): { container: HTMLElement; count: HTMLElement } => {
  const container = document.createElement("div");
  container.className = "tries-container";
  container.style.gridRow = "1";
  container.style.gridColumn = "1";

  const label = document.createElement("div");
  label.className = "tries-label";
  label.textContent = "TRIES";
  label.dataset.i18n = "game.tries";

  const count = document.createElement("div");
  count.className = "tries-count";
  count.textContent = "0";

  container.appendChild(label);
  container.appendChild(count);
  board.appendChild(container);

  return { container, count };
};

const triesElements = createTriesElement();
export const triesElement = triesElements.count;

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

// On-screen keyboard
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

const createKeyboard = (): Map<string, HTMLElement> => {
  const keyElements = new Map<string, HTMLElement>();

  KEYBOARD_ROWS.forEach((row) => {
    const rowElement = document.createElement("div");
    rowElement.className = "keyboard-row";

    row.forEach((key) => {
      const keyElement = document.createElement("button");
      keyElement.className = "keyboard-key";
      keyElement.dataset.key = key;

      if (key === "ENTER") {
        keyElement.textContent = "ENTER";
        keyElement.dataset.i18n = "keyboard.enter";
        keyElement.classList.add("wide");
      } else if (key === "⌫") {
        keyElement.textContent = "⌫";
        keyElement.classList.add("wide");
      } else {
        keyElement.textContent = key;
      }

      keyElements.set(key, keyElement);
      rowElement.appendChild(keyElement);
    });

    keyboardContainer.appendChild(rowElement);
  });

  return keyElements;
};

export const keyboardKeys = createKeyboard();
