import { state, resetState } from "./state";
import { loadWords, loadPuzzles, setPuzzleIndex } from "./puzzle";
import { render } from "./render";
import { setupInputHandlers } from "./input";

const getPuzzleIndexFromUrl = (): number | null => {
  const params = new URLSearchParams(window.location.search);
  const puzzle = params.get("puzzle");
  if (puzzle && /^\d+$/.test(puzzle)) {
    return parseInt(puzzle, 10);
  }
  return null;
};

Promise.all([loadWords(), loadPuzzles()]).then(() => {
  console.log("Game data loaded");

  const urlPuzzleIndex = getPuzzleIndexFromUrl();
  if (urlPuzzleIndex !== null) {
    setPuzzleIndex(urlPuzzleIndex);
    resetState(state);
  }

  setupInputHandlers(state);
  render(state);
});
