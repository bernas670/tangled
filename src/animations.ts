/**
 * Animation utilities that operate on DOM elements directly.
 * These functions take cell elements rather than state.
 */

const SHAKE_DURATION = 400;
const POP_DURATION = 200;
const STAGGER_DELAY = 100;

/**
 * Shake cells to indicate an invalid submission.
 */
export const shakeCells = (
  cells: HTMLElement[],
  direction: "horizontal" | "vertical"
): void => {
  const axis = direction === "horizontal" ? "X" : "Y";

  const keyframes = [
    { transform: `translate${axis}(0)` },
    { transform: `translate${axis}(-6px)` },
    { transform: `translate${axis}(6px)` },
    { transform: `translate${axis}(-4px)` },
    { transform: `translate${axis}(4px)` },
    { transform: `translate${axis}(0)` },
  ];

  cells.forEach((cell) => {
    cell.animate(keyframes, { duration: SHAKE_DURATION, easing: "ease-in-out" });
  });
};

/**
 * Animate a single cell becoming correct with a pop effect.
 */
export const animateCorrectLetter = (cell: HTMLElement, delay = 0): void => {
  const keyframes = [
    { transform: "scale(1)", offset: 0 },
    { transform: "scale(1.2)", offset: 0.5 },
    { transform: "scale(1)", offset: 1 },
  ];

  cell.animate(keyframes, {
    duration: POP_DURATION,
    delay,
    easing: "ease-out",
  });
};

/**
 * Animate a line of cells becoming correct with staggered pop effects.
 * Cells animate in order (left-to-right for rows, top-to-bottom for columns).
 */
export const animateCorrectLine = (cells: HTMLElement[]): void => {
  cells.forEach((cell, index) => {
    animateCorrectLetter(cell, index * STAGGER_DELAY);
  });
};

// ============================================
// Puzzle completion celebration animations
// ============================================

type CelebrationAnimation = (grid: HTMLElement[][]) => void;

/**
 * Wave animation - cells ripple outward from center.
 */
const waveAnimation: CelebrationAnimation = (grid) => {
  const centerRow = 2;
  const centerCol = 2;

  grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const distance = Math.abs(rowIndex - centerRow) + Math.abs(colIndex - centerCol);
      const delay = distance * 80;

      cell.animate(
        [
          { transform: "scale(1) translateY(0)" },
          { transform: "scale(1.3) translateY(-10px)" },
          { transform: "scale(1) translateY(0)" },
        ],
        { duration: 400, delay, easing: "ease-out" }
      );
    });
  });
};

/**
 * Fireworks animation - cells pop in random order with varying sizes.
 */
const fireworksAnimation: CelebrationAnimation = (grid) => {
  const allCells = grid.flat();
  const shuffled = [...allCells].sort(() => Math.random() - 0.5);

  shuffled.forEach((cell, index) => {
    const delay = index * 40;
    const scale = 1.2 + Math.random() * 0.3;

    cell.animate(
      [
        { transform: "scale(1)", filter: "brightness(1)" },
        { transform: `scale(${scale})`, filter: "brightness(1.5)" },
        { transform: "scale(1)", filter: "brightness(1)" },
      ],
      { duration: 300, delay, easing: "ease-out" }
    );
  });
};

/**
 * Spiral animation - cells animate in a spiral pattern from outside to center.
 */
const spiralAnimation: CelebrationAnimation = (grid) => {
  const size = grid.length;
  const spiralOrder: Array<{ row: number; col: number }> = [];

  let top = 0, bottom = size - 1, left = 0, right = size - 1;

  while (top <= bottom && left <= right) {
    for (let col = left; col <= right; col++) spiralOrder.push({ row: top, col });
    top++;
    for (let row = top; row <= bottom; row++) spiralOrder.push({ row, col: right });
    right--;
    if (top <= bottom) {
      for (let col = right; col >= left; col--) spiralOrder.push({ row: bottom, col });
      bottom--;
    }
    if (left <= right) {
      for (let row = bottom; row >= top; row--) spiralOrder.push({ row, col: left });
      left++;
    }
  }

  spiralOrder.forEach(({ row, col }, index) => {
    const cell = grid[row][col];
    const delay = index * 50;

    cell.animate(
      [
        { transform: "scale(1) rotate(0deg)" },
        { transform: "scale(1.2) rotate(10deg)" },
        { transform: "scale(1) rotate(0deg)" },
      ],
      { duration: 300, delay, easing: "ease-out" }
    );
  });
};

/**
 * Bounce animation - cells drop and bounce back up.
 */
const bounceAnimation: CelebrationAnimation = (grid) => {
  grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const delay = (rowIndex + colIndex) * 60;

      cell.animate(
        [
          { transform: "translateY(0)" },
          { transform: "translateY(20px)" },
          { transform: "translateY(-15px)" },
          { transform: "translateY(10px)" },
          { transform: "translateY(-5px)" },
          { transform: "translateY(0)" },
        ],
        { duration: 500, delay, easing: "ease-out" }
      );
    });
  });
};

/**
 * Sparkle animation - cells flash with staggered timing.
 */
const sparkleAnimation: CelebrationAnimation = (grid) => {
  const allCells = grid.flat();

  allCells.forEach((cell) => {
    const delay = Math.random() * 300;
    const iterations = 2 + Math.floor(Math.random() * 2);

    cell.animate(
      [
        { filter: "brightness(1)", transform: "scale(1)" },
        { filter: "brightness(1.8)", transform: "scale(1.1)" },
        { filter: "brightness(1)", transform: "scale(1)" },
      ],
      { duration: 250, delay, iterations, easing: "ease-in-out" }
    );
  });
};

const celebrationAnimations: CelebrationAnimation[] = [
  waveAnimation,
  fireworksAnimation,
  spiralAnimation,
  bounceAnimation,
  sparkleAnimation,
];

/**
 * Play a random celebration animation on the grid.
 */
export const celebratePuzzleComplete = (grid: HTMLElement[][]): void => {
  const randomIndex = Math.floor(Math.random() * celebrationAnimations.length);
  celebrationAnimations[randomIndex](grid);
};
