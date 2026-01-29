import { state } from "./state";
import { loadWords, loadPuzzles } from "./puzzle";
import { render } from "./render";
import { setupInputHandlers } from "./input";

Promise.all([loadWords(), loadPuzzles()]).then(() => {
  console.log("Game data loaded");
  setupInputHandlers(state);
  render(state);
});
