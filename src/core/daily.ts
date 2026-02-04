// Daily puzzle date utilities
// Puzzle index 0 = February 1, 2026
// Puzzle index N = February (N+1), 2026

export const DAILY_START_DATE = new Date("2026-02-01T00:00:00");

// Get today's date at midnight (local time)
const getTodayMidnight = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Get today's puzzle index (0-indexed)
export const getTodaysPuzzleIndex = (): number => {
  const today = getTodayMidnight();
  const diffTime = today.getTime() - DAILY_START_DATE.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Get the date for a given puzzle index
export const getPuzzleDate = (puzzleIndex: number): Date => {
  const date = new Date(DAILY_START_DATE);
  date.setDate(date.getDate() + puzzleIndex);
  return date;
};

// Format date as ISO string (YYYY-MM-DD)
export const formatDateISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Get today's date as ISO string
export const getTodayISO = (): string => {
  return formatDateISO(getTodayMidnight());
};

// Check if puzzle is accessible (date has arrived)
export const isPuzzleAccessible = (puzzleIndex: number): boolean => {
  const puzzleDate = getPuzzleDate(puzzleIndex);
  const today = getTodayMidnight();
  return puzzleDate.getTime() <= today.getTime();
};

// Check if today is the puzzle's release date
export const isPuzzleReleaseDay = (puzzleIndex: number): boolean => {
  const puzzleDate = getPuzzleDate(puzzleIndex);
  const today = getTodayMidnight();
  return puzzleDate.getTime() === today.getTime();
};

// Check if a given solve date matches the puzzle's release date
export const wasSolvedOnReleaseDay = (
  puzzleIndex: number,
  solveDateISO: string
): boolean => {
  const puzzleDateISO = formatDateISO(getPuzzleDate(puzzleIndex));
  return solveDateISO === puzzleDateISO;
};
