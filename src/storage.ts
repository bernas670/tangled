const STORAGE_KEYS = {
  SOLVED_PUZZLES: "tangled_solved_puzzles",
  HAS_PLAYED: "tangled_has_played",
  LANGUAGE: "tangled_language",
  VERSION: "tangled_storage_version",
};

const CURRENT_VERSION = 1;

type SolvedPuzzlesByLanguage = Record<string, number[]>;

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
            const newData: SolvedPuzzlesByLanguage = {
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
  return new Set(allSolved[language] || []);
};

export const markPuzzleSolved = (language: string, puzzleIndex: number): void => {
  const allSolved = getAllSolvedPuzzles();
  const languageSolved = new Set(allSolved[language] || []);
  languageSolved.add(puzzleIndex);
  allSolved[language] = [...languageSolved];
  localStorage.setItem(STORAGE_KEYS.SOLVED_PUZZLES, JSON.stringify(allSolved));
};

export const isPuzzleSolved = (language: string, puzzleIndex: number): boolean => {
  return getSolvedPuzzles(language).has(puzzleIndex);
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
