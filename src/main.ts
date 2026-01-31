import { state, resetState } from "./state";
import { loadWords, loadPuzzles, setPuzzleIndex, getPuzzleCount } from "./puzzle";
import { render } from "./render";
import { setupInputHandlers } from "./input";
import { getSolvedPuzzles, hasPlayedBefore, markAsPlayed, getStoredLanguage, runMigrations } from "./storage";
import { getCurrentLanguage } from "./i18n";
import { startAutoPlay } from "./autoplay";
import { loadTranslations, setCurrentLanguage, detectBrowserLanguage } from "./i18n";
import { setupLanguageSelector, applyTranslations } from "./language";

const homepage = document.getElementById("homepage");
const gameContainer = document.getElementById("game-container");
const puzzleSelectorScreen = document.getElementById("puzzle-selector-screen");
const playNowBtn = document.getElementById("play-now-btn");
const selectPuzzleBtn = document.getElementById("select-puzzle-btn");
const backToHomeBtn = document.getElementById("back-to-home-btn");
const puzzleGrid = document.getElementById("puzzle-grid");
const miniGrid = document.getElementById("mini-grid");
const helpModal = document.getElementById("help-modal");
const helpBtn = document.getElementById("help-btn");
const logo = document.getElementById("logo");
const puzzleNumberEl = document.getElementById("puzzle-number");

let stopAutoPlay: (() => void) | null = null;

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
  puzzleSelectorScreen?.setAttribute("hidden", "");
  puzzleNumberEl?.setAttribute("hidden", "");
  helpBtn?.setAttribute("hidden", "");
  // Update URL without puzzle param
  const url = new URL(window.location.href);
  url.searchParams.delete("puzzle");
  window.history.replaceState({}, "", url.pathname);
  // Start auto-play
  if (miniGrid && !stopAutoPlay) {
    stopAutoPlay = startAutoPlay(miniGrid);
  }
};

const showPuzzleSelector = (): void => {
  homepage?.setAttribute("hidden", "");
  gameContainer?.setAttribute("hidden", "");
  puzzleSelectorScreen?.removeAttribute("hidden");
  puzzleNumberEl?.setAttribute("hidden", "");
  helpBtn?.removeAttribute("hidden");
  // Stop auto-play
  if (stopAutoPlay) {
    stopAutoPlay();
    stopAutoPlay = null;
  }
  populatePuzzleGrid();
};

const showGame = (): void => {
  homepage?.setAttribute("hidden", "");
  gameContainer?.removeAttribute("hidden");
  puzzleSelectorScreen?.setAttribute("hidden", "");
  helpBtn?.removeAttribute("hidden");
  // Stop auto-play
  if (stopAutoPlay) {
    stopAutoPlay();
    stopAutoPlay = null;
  }
};

const populatePuzzleGrid = (): void => {
  if (!puzzleGrid) return;

  const puzzleCount = getPuzzleCount();
  const solvedPuzzles = getSolvedPuzzles(getCurrentLanguage());

  puzzleGrid.innerHTML = "";

  for (let i = 0; i < puzzleCount; i++) {
    const item = document.createElement("button");
    item.className = "puzzle-item";
    if (solvedPuzzles.has(i)) {
      item.classList.add("solved");
    }
    item.textContent = `#${String(i + 1).padStart(3, '0')}`;
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
  const solvedPuzzles = getSolvedPuzzles(getCurrentLanguage());

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

const initApp = async () => {
  // Run storage migrations before accessing any stored data
  runMigrations();

  // Load language preference (stored or detect browser)
  const storedLang = getStoredLanguage();
  const language = storedLang ?? detectBrowserLanguage();
  setCurrentLanguage(language);

  // Load translations and game data for that language
  await Promise.all([
    loadTranslations(language),
    loadWords(language),
    loadPuzzles(language),
  ]);

  // Apply translations to DOM
  applyTranslations();

  // Setup language selector
  setupLanguageSelector();

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
  selectPuzzleBtn?.addEventListener("click", showPuzzleSelector);
  backToHomeBtn?.addEventListener("click", showHomepage);

  // Logo click to go back to homepage
  logo?.addEventListener("click", (e) => {
    e.preventDefault();
    showHomepage();
  });
};

initApp();
