import { getTodayISO, wasSolvedOnReleaseDay as checkWasSolvedOnReleaseDay } from "./daily";

const STORAGE_KEYS = {
  SOLVED_PUZZLES: "tangled_solved_puzzles",
  HAS_PLAYED: "tangled_has_played",
  LANGUAGE: "tangled_language",
  VERSION: "tangled_storage_version",
};

const CURRENT_VERSION = 2;

// New format: { "en": { "0": "2026-02-01", "2": "2026-02-05" } } (index -> solve date)
type SolvedPuzzlesByLanguage = Record<string, Record<string, string>>;

// Old v1 format: { "en": [0, 2, 5] } (array of indices)
type OldV1Format = Record<string, number[]>;

type Migration = {
  fromVersion: number;
  toVersion: number;
  migrate: () => void;
};

const migrations: Migration[] = [
  {
    fromVersion: 0,
    toVersion: 1,
    migrate: () => {
      // Migrate from flat array to language-keyed object
      // Old format: [0, 2, 5] - just indices
      // New format: { "en": [0, 2, 5] } - indices by language
      try {
        const oldData = localStorage.getItem(STORAGE_KEYS.SOLVED_PUZZLES);
        if (oldData) {
          const oldPuzzles: number[] = JSON.parse(oldData);
          if (Array.isArray(oldPuzzles) && oldPuzzles.length > 0) {
            // Get the language the user was playing in (or default to 'en')
            const language = localStorage.getItem(STORAGE_KEYS.LANGUAGE) || "en";
            const newData: OldV1Format = {
              [language]: oldPuzzles,
            };
            localStorage.setItem(STORAGE_KEYS.SOLVED_PUZZLES, JSON.stringify(newData));
          }
        }
      } catch {
        // If migration fails, clear corrupted data
        localStorage.removeItem(STORAGE_KEYS.SOLVED_PUZZLES);
      }
    },
  },
  {
    fromVersion: 1,
    toVersion: 2,
    migrate: () => {
      // Migrate from array format to object with solve dates
      // Old format: { "en": [0, 2, 5] } - array of indices
      // New format: { "en": { "0": "2026-02-01", "2": "2026-02-05" } } - index -> solve date
      // Since we don't know when puzzles were originally solved, mark them with a placeholder date
      // We'll use "unknown" as a special marker for migrated puzzles
      try {
        const oldData = localStorage.getItem(STORAGE_KEYS.SOLVED_PUZZLES);
        if (oldData) {
          const parsed = JSON.parse(oldData);
          // Check if it's the old v1 format (values are arrays)
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            const newData: SolvedPuzzlesByLanguage = {};
            for (const [lang, indices] of Object.entries(parsed)) {
              if (Array.isArray(indices)) {
                newData[lang] = {};
                for (const index of indices as number[]) {
                  // Mark migrated puzzles with "unknown" since we don't know the original solve date
                  // These will be treated as "solved later" since they won't match release dates
                  newData[lang][String(index)] = "unknown";
                }
              } else if (typeof indices === "object") {
                // Already in new format, keep as-is
                newData[lang] = indices as Record<string, string>;
              }
            }
            localStorage.setItem(STORAGE_KEYS.SOLVED_PUZZLES, JSON.stringify(newData));
          }
        }
      } catch {
        // If migration fails, clear corrupted data
        localStorage.removeItem(STORAGE_KEYS.SOLVED_PUZZLES);
      }
    },
  },
];

const getStorageVersion = (): number => {
  const version = localStorage.getItem(STORAGE_KEYS.VERSION);
  return version ? parseInt(version, 10) : 0;
};

const setStorageVersion = (version: number): void => {
  localStorage.setItem(STORAGE_KEYS.VERSION, version.toString());
};

export const runMigrations = (): void => {
  let currentVersion = getStorageVersion();

  // Run migrations in order, one step at a time
  while (currentVersion < CURRENT_VERSION) {
    const migration = migrations.find((m) => m.fromVersion === currentVersion);
    if (migration) {
      migration.migrate();
      currentVersion = migration.toVersion;
      setStorageVersion(currentVersion);
    } else {
      // No migration found for this version, jump to current
      // This handles the case of a fresh install
      setStorageVersion(CURRENT_VERSION);
      break;
    }
  }
};

const getAllSolvedPuzzles = (): SolvedPuzzlesByLanguage => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SOLVED_PUZZLES);
    if (data) {
      const parsed = JSON.parse(data);
      // Validate it's an object (not an array - that would be old format)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore parse errors
  }
  return {};
};

export const getSolvedPuzzles = (language: string): Set<number> => {
  const allSolved = getAllSolvedPuzzles();
  const languageSolved = allSolved[language] || {};
  return new Set(Object.keys(languageSolved).map(Number));
};

export const markPuzzleSolved = (language: string, puzzleIndex: number): void => {
  const allSolved = getAllSolvedPuzzles();
  if (!allSolved[language]) {
    allSolved[language] = {};
  }
  // Only mark as solved if not already solved (preserve original solve date)
  if (!allSolved[language][String(puzzleIndex)]) {
    allSolved[language][String(puzzleIndex)] = getTodayISO();
  }
  localStorage.setItem(STORAGE_KEYS.SOLVED_PUZZLES, JSON.stringify(allSolved));
};

export const isPuzzleSolved = (language: string, puzzleIndex: number): boolean => {
  return getSolvedPuzzles(language).has(puzzleIndex);
};

export const getPuzzleSolveDate = (language: string, puzzleIndex: number): string | null => {
  const allSolved = getAllSolvedPuzzles();
  const languageSolved = allSolved[language] || {};
  return languageSolved[String(puzzleIndex)] || null;
};

export const wasSolvedOnReleaseDay = (language: string, puzzleIndex: number): boolean => {
  const solveDate = getPuzzleSolveDate(language, puzzleIndex);
  if (!solveDate || solveDate === "unknown") {
    // Migrated puzzles with unknown dates are treated as "solved later"
    return false;
  }
  return checkWasSolvedOnReleaseDay(puzzleIndex, solveDate);
};

export const hasPlayedBefore = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.HAS_PLAYED) === "true";
};

export const markAsPlayed = (): void => {
  localStorage.setItem(STORAGE_KEYS.HAS_PLAYED, "true");
};

export const getStoredLanguage = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LANGUAGE);
};

export const setStoredLanguage = (lang: string): void => {
  localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
};
