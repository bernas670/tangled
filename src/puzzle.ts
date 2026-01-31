import { BASE_PATH } from "./constants";
import { getCurrentLanguage } from "./i18n";

export type Puzzle = string[][];

let puzzles: Puzzle[] = [];
let currentPuzzleIndex = 1;

export const loadPuzzles = (lang?: string): Promise<void> => {
  const language = lang ?? getCurrentLanguage();
  return fetch(`${BASE_PATH}/puzzles/${language}.txt`)
    .then((response) => response.text())
    .then((text) => {
      puzzles = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) =>
          line.split(/\s+/).map((word) => word.toUpperCase().split(""))
        );
    });
};

export const getPuzzle = (): Puzzle => puzzles[currentPuzzleIndex] ?? [];

export const setPuzzleIndex = (index: number): void => {
  if (index >= 0 && index < puzzles.length) {
    currentPuzzleIndex = index;
  }
};

export const getCurrentPuzzleIndex = (): number => currentPuzzleIndex;

export const getPuzzleCount = (): number => puzzles.length;

let words: Set<string> = new Set();

export const loadWords = (lang?: string): Promise<void> => {
  const language = lang ?? getCurrentLanguage();
  return fetch(`${BASE_PATH}/words/${language}.txt`)
    .then((response) => response.text())
    .then((text) => {
      words = new Set(text.split("\n").map((word) => word.trim().toUpperCase()));
    });
};

export const isValidWord = (word: string): boolean => words.has(word);

export const reloadGameData = (lang: string): Promise<void> =>
  Promise.all([loadPuzzles(lang), loadWords(lang)]).then(() => {});
