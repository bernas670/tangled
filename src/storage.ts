const STORAGE_KEYS = {
  SOLVED_PUZZLES: "tangled_solved_puzzles",
  HAS_PLAYED: "tangled_has_played",
};

export const getSolvedPuzzles = (): Set<number> => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SOLVED_PUZZLES);
    if (data) {
      return new Set(JSON.parse(data));
    }
  } catch {
    // ignore parse errors
  }
  return new Set();
};

export const markPuzzleSolved = (puzzleIndex: number): void => {
  const solved = getSolvedPuzzles();
  solved.add(puzzleIndex);
  localStorage.setItem(STORAGE_KEYS.SOLVED_PUZZLES, JSON.stringify([...solved]));
};

export const isPuzzleSolved = (puzzleIndex: number): boolean => {
  return getSolvedPuzzles().has(puzzleIndex);
};

export const hasPlayedBefore = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.HAS_PLAYED) === "true";
};

export const markAsPlayed = (): void => {
  localStorage.setItem(STORAGE_KEYS.HAS_PLAYED, "true");
};
