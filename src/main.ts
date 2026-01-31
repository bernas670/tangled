import { state, resetState } from "./state";
import { loadWords, loadPuzzles, setPuzzleIndex, getPuzzleCount } from "./puzzle";
import { render } from "./render";
import { setupInputHandlers } from "./input";
import { getSolvedPuzzles, hasPlayedBefore, markAsPlayed } from "./storage";

const homepage = document.getElementById("homepage");
const gameContainer = document.getElementById("game-container");
const playNowBtn = document.getElementById("play-now-btn");
const puzzleGrid = document.getElementById("puzzle-grid");
const helpModal = document.getElementById("help-modal");
const logo = document.getElementById("logo");
const puzzleNumberEl = document.getElementById("puzzle-number");

const getPuzzleIndexFromUrl = (): number | null => {
  const params = new URLSearchParams(window.location.search);
  const puzzle = params.get("puzzle");
  if (puzzle && /^\d+$/.test(puzzle)) {
    return parseInt(puzzle, 10);
  }
  return null;
};

const showHomepage = (): void => {
  homepage?.removeAttribute("hidden");
  gameContainer?.setAttribute("hidden", "");
  puzzleNumberEl?.setAttribute("hidden", "");
  // Update URL without puzzle param
  const url = new URL(window.location.href);
  url.searchParams.delete("puzzle");
  window.history.replaceState({}, "", url.pathname);
  populatePuzzleGrid();
};

const showGame = (): void => {
  homepage?.setAttribute("hidden", "");
  gameContainer?.removeAttribute("hidden");
};

const populatePuzzleGrid = (): void => {
  if (!puzzleGrid) return;

  const puzzleCount = getPuzzleCount();
  const solvedPuzzles = getSolvedPuzzles();

  puzzleGrid.innerHTML = "";

  for (let i = 0; i < puzzleCount; i++) {
    const item = document.createElement("button");
    item.className = "puzzle-item";
    if (solvedPuzzles.has(i)) {
      item.classList.add("solved");
    }
    item.textContent = String(i + 1);
    item.addEventListener("click", () => startPuzzle(i));
    puzzleGrid.appendChild(item);
  }
};

const updatePuzzleNumber = (index: number): void => {
  if (puzzleNumberEl) {
    puzzleNumberEl.textContent = `#${String(index + 1).padStart(3, '0')}`;
    puzzleNumberEl.removeAttribute("hidden");
  }
};

const startPuzzle = (index: number): void => {
  setPuzzleIndex(index);
  resetState(state);

  // Update URL with puzzle param
  const url = new URL(window.location.href);
  url.searchParams.set("puzzle", String(index));
  window.history.pushState({}, "", url.toString());

  showGame();
  updatePuzzleNumber(index);

  // Show help modal for first-time players
  if (!hasPlayedBefore()) {
    helpModal?.removeAttribute("hidden");
    markAsPlayed();
  }

  render(state);
};

const startRandomPuzzle = (): void => {
  const puzzleCount = getPuzzleCount();
  const solvedPuzzles = getSolvedPuzzles();

  // Try to find an unsolved puzzle first
  const unsolvedPuzzles: number[] = [];
  for (let i = 0; i < puzzleCount; i++) {
    if (!solvedPuzzles.has(i)) {
      unsolvedPuzzles.push(i);
    }
  }

  let selectedIndex: number;
  if (unsolvedPuzzles.length > 0) {
    // Pick random unsolved puzzle
    selectedIndex = unsolvedPuzzles[Math.floor(Math.random() * unsolvedPuzzles.length)];
  } else {
    // All puzzles solved, pick any random puzzle
    selectedIndex = Math.floor(Math.random() * puzzleCount);
  }

  startPuzzle(selectedIndex);
};

// Handle browser back/forward
window.addEventListener("popstate", () => {
  const urlPuzzleIndex = getPuzzleIndexFromUrl();
  if (urlPuzzleIndex !== null) {
    setPuzzleIndex(urlPuzzleIndex);
    resetState(state);
    showGame();
    updatePuzzleNumber(urlPuzzleIndex);
    render(state);
  } else {
    showHomepage();
  }
});

Promise.all([loadWords(), loadPuzzles()]).then(() => {
  console.log("Game data loaded");

  const urlPuzzleIndex = getPuzzleIndexFromUrl();

  if (urlPuzzleIndex !== null) {
    // Direct link to puzzle - start game
    setPuzzleIndex(urlPuzzleIndex);
    resetState(state);
    showGame();
    updatePuzzleNumber(urlPuzzleIndex);

    // Show help modal for first-time players
    if (!hasPlayedBefore()) {
      helpModal?.removeAttribute("hidden");
      markAsPlayed();
    }
  } else {
    // No puzzle specified - show homepage
    showHomepage();
  }

  setupInputHandlers(state);
  render(state);

  // Setup homepage event listeners
  playNowBtn?.addEventListener("click", startRandomPuzzle);

  // Logo click to go back to homepage
  logo?.addEventListener("click", (e) => {
    e.preventDefault();
    showHomepage();
  });
});
