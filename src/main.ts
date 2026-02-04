import {
  state, resetState,
  loadWords, loadPuzzles, setPuzzleIndex, getPuzzleCount, getCurrentPuzzleIndex,
  getSolvedPuzzles, hasPlayedBefore, markAsPlayed, getStoredLanguage, runMigrations,
  wasSolvedOnReleaseDay, getPuzzleSolveDate,
  getTodaysPuzzleIndex, isPuzzleAccessible, DAILY_START_DATE, getPuzzleDate,
} from "./core";
import { render, setupInputHandlers, startAutoPlay } from "./ui";
import {
  getCurrentLanguage, loadTranslations, setCurrentLanguage,
  detectBrowserLanguage, t, tArray,
  setupLanguageSelector, applyTranslations,
} from "./i18n";

const homepage = document.getElementById("homepage");
const gameContainer = document.getElementById("game-container");
const puzzleSelectorScreen = document.getElementById("puzzle-selector-screen");
const playNowBtn = document.getElementById("play-now-btn");
const selectPuzzleBtn = document.getElementById("select-puzzle-btn");
const backToHomeBtn = document.getElementById("back-to-home-btn");
const randomPuzzleBtn = document.getElementById("random-puzzle-btn");
const miniGrid = document.getElementById("mini-grid");
const helpModal = document.getElementById("help-modal");
const helpBtn = document.getElementById("help-btn");
const logo = document.getElementById("logo");
const puzzleNumberEl = document.getElementById("puzzle-number");
const completionBanner = document.getElementById("completion-banner");
const playNextBtn = document.getElementById("play-next-btn");

// Calendar elements
const calendarDays = document.getElementById("calendar-days");
const calendarWeekdays = document.getElementById("calendar-weekdays");
const calendarMonthYear = document.getElementById("calendar-month-year");
const calendarPrev = document.getElementById("calendar-prev");
const calendarNext = document.getElementById("calendar-next");

let stopAutoPlay: (() => void) | null = null;

// Calendar state
let currentCalendarMonth = DAILY_START_DATE.getMonth();
let currentCalendarYear = DAILY_START_DATE.getFullYear();

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
  // Update play button text based on puzzle availability
  updatePlayButton();
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
  // Reset calendar to current month with today's date
  const today = new Date();
  currentCalendarMonth = today.getMonth();
  currentCalendarYear = today.getFullYear();
  renderCalendar();
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

// Get puzzle index for a given date (returns null if before start date or no puzzle exists)
const getPuzzleIndexForDate = (year: number, month: number, day: number): number | null => {
  const date = new Date(year, month, day);
  const startDate = new Date(DAILY_START_DATE.getFullYear(), DAILY_START_DATE.getMonth(), DAILY_START_DATE.getDate());

  if (date < startDate) {
    return null;
  }

  const diffTime = date.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Check if puzzle exists for this index
  if (diffDays >= getPuzzleCount()) {
    return null;
  }

  return diffDays;
};

const renderCalendarWeekdays = (): void => {
  if (!calendarWeekdays) return;

  const weekdays = tArray("calendar.weekdays");
  calendarWeekdays.innerHTML = "";

  for (const day of weekdays) {
    const el = document.createElement("span");
    el.className = "calendar-weekday";
    el.textContent = day;
    calendarWeekdays.appendChild(el);
  }
};

const renderCalendar = (): void => {
  if (!calendarDays || !calendarMonthYear) return;

  const language = getCurrentLanguage();
  const months = tArray("calendar.months");

  // Update header
  calendarMonthYear.textContent = `${months[currentCalendarMonth]} ${currentCalendarYear}`;

  // Render weekdays
  renderCalendarWeekdays();

  // Calculate first day of month and number of days
  const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1);
  const lastDay = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  // Get today's date for highlighting
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentCalendarMonth && today.getFullYear() === currentCalendarYear;
  const todayDate = today.getDate();

  calendarDays.innerHTML = "";

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    const emptyCell = document.createElement("button");
    emptyCell.className = "calendar-day calendar-day-empty";
    emptyCell.disabled = true;
    calendarDays.appendChild(emptyCell);
  }

  // Add day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("button");
    cell.className = "calendar-day";
    cell.textContent = String(day);

    const puzzleIndex = getPuzzleIndexForDate(currentCalendarYear, currentCalendarMonth, day);

    // Highlight today
    if (isCurrentMonth && day === todayDate) {
      cell.classList.add("calendar-day-today");
    }

    if (puzzleIndex === null) {
      // No puzzle for this date (before start or after all puzzles)
      cell.classList.add("locked");
      cell.disabled = true;
    } else if (!isPuzzleAccessible(puzzleIndex)) {
      // Future puzzle
      cell.classList.add("locked");
      cell.disabled = true;
    } else {
      // Accessible puzzle - check solve status
      const solveDate = getPuzzleSolveDate(language, puzzleIndex);
      if (solveDate) {
        if (wasSolvedOnReleaseDay(language, puzzleIndex)) {
          cell.classList.add("solved-on-day");
        } else {
          cell.classList.add("solved-later");
        }
      }

      cell.addEventListener("click", () => startPuzzle(puzzleIndex));
    }

    calendarDays.appendChild(cell);
  }

  // Update navigation buttons
  updateCalendarNavigation();
};

const updateCalendarNavigation = (): void => {
  if (!calendarPrev || !calendarNext) return;

  const startMonth = DAILY_START_DATE.getMonth();
  const startYear = DAILY_START_DATE.getFullYear();

  // Disable prev if we're at or before the start month
  const isAtStart = currentCalendarYear < startYear ||
    (currentCalendarYear === startYear && currentCalendarMonth <= startMonth);
  (calendarPrev as HTMLButtonElement).disabled = isAtStart;

  // Calculate the last month that has puzzles
  const puzzleCount = getPuzzleCount();
  const lastPuzzleDate = getPuzzleDate(puzzleCount - 1);
  const lastMonth = lastPuzzleDate.getMonth();
  const lastYear = lastPuzzleDate.getFullYear();

  // Disable next if we're at or after the last puzzle month
  const isAtEnd = currentCalendarYear > lastYear ||
    (currentCalendarYear === lastYear && currentCalendarMonth >= lastMonth);
  (calendarNext as HTMLButtonElement).disabled = isAtEnd;
};

const navigateCalendar = (direction: number): void => {
  currentCalendarMonth += direction;

  if (currentCalendarMonth > 11) {
    currentCalendarMonth = 0;
    currentCalendarYear++;
  } else if (currentCalendarMonth < 0) {
    currentCalendarMonth = 11;
    currentCalendarYear--;
  }

  renderCalendar();
};

const formatPuzzleDate = (index: number): string => {
  const date = getPuzzleDate(index);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const updatePuzzleNumber = (index: number): void => {
  if (puzzleNumberEl) {
    puzzleNumberEl.textContent = formatPuzzleDate(index);
    puzzleNumberEl.removeAttribute("hidden");
  }
};

const hideCompletionBanner = (): void => {
  completionBanner?.setAttribute("hidden", "");
};

const updatePlayButton = (): void => {
  if (!playNowBtn) return;

  const todayIndex = getTodaysPuzzleIndex();
  const puzzleCount = getPuzzleCount();

  if (todayIndex < puzzleCount) {
    // Today's puzzle is available
    playNowBtn.textContent = t("homepage.playNow");
  } else {
    // All puzzles exhausted, show random puzzle option
    playNowBtn.textContent = t("homepage.randomPuzzle");
  }
};

const startPuzzle = (index: number): void => {
  // Check if puzzle date has arrived
  if (!isPuzzleAccessible(index)) {
    showHomepage();
    return;
  }

  setPuzzleIndex(index);
  resetState(state);
  hideCompletionBanner();

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
  const todayIndex = getTodaysPuzzleIndex();

  // Only consider accessible puzzles (up to today's index or puzzle count, whichever is smaller)
  const maxAccessibleIndex = Math.min(todayIndex, puzzleCount - 1);

  // Try to find an unsolved accessible puzzle first
  const unsolvedPuzzles: number[] = [];
  for (let i = 0; i <= maxAccessibleIndex; i++) {
    if (!solvedPuzzles.has(i)) {
      unsolvedPuzzles.push(i);
    }
  }

  let selectedIndex: number;
  if (unsolvedPuzzles.length > 0) {
    // Pick random unsolved puzzle
    selectedIndex = unsolvedPuzzles[Math.floor(Math.random() * unsolvedPuzzles.length)];
  } else {
    // All accessible puzzles solved, pick any random accessible puzzle
    selectedIndex = Math.floor(Math.random() * (maxAccessibleIndex + 1));
  }

  startPuzzle(selectedIndex);
};

const startTodaysPuzzle = (): void => {
  const todayIndex = getTodaysPuzzleIndex();
  const puzzleCount = getPuzzleCount();

  if (todayIndex < puzzleCount) {
    startPuzzle(todayIndex);
  } else {
    // Puzzles exhausted, start random instead
    startRandomPuzzle();
  }
};

const startNextPuzzle = (): void => {
  const currentIndex = getCurrentPuzzleIndex();
  const puzzleCount = getPuzzleCount();
  const todayIndex = getTodaysPuzzleIndex();
  const solvedPuzzles = getSolvedPuzzles(getCurrentLanguage());

  // Find the next unsolved accessible puzzle
  const maxAccessibleIndex = Math.min(todayIndex, puzzleCount - 1);

  // First try to find the next unsolved puzzle after current
  for (let i = currentIndex + 1; i <= maxAccessibleIndex; i++) {
    if (!solvedPuzzles.has(i)) {
      startPuzzle(i);
      return;
    }
  }

  // Then try from the beginning
  for (let i = 0; i < currentIndex; i++) {
    if (!solvedPuzzles.has(i)) {
      startPuzzle(i);
      return;
    }
  }

  // All puzzles solved, just go to today's or a random one
  if (todayIndex !== currentIndex && todayIndex < puzzleCount) {
    startPuzzle(todayIndex);
  } else {
    startRandomPuzzle();
  }
};

// Handle browser back/forward
window.addEventListener("popstate", () => {
  const urlPuzzleIndex = getPuzzleIndexFromUrl();
  if (urlPuzzleIndex !== null) {
    // Check if puzzle is accessible
    if (!isPuzzleAccessible(urlPuzzleIndex)) {
      showHomepage();
      return;
    }
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
    // Check if puzzle is accessible
    if (!isPuzzleAccessible(urlPuzzleIndex)) {
      showHomepage();
    } else {
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
    }
  } else {
    // No puzzle specified - show homepage
    showHomepage();
  }

  setupInputHandlers(state);
  render(state);

  // Setup homepage event listeners
  playNowBtn?.addEventListener("click", startTodaysPuzzle);
  selectPuzzleBtn?.addEventListener("click", showPuzzleSelector);

  // Setup puzzle selector event listeners
  backToHomeBtn?.addEventListener("click", showHomepage);
  randomPuzzleBtn?.addEventListener("click", startRandomPuzzle);

  // Setup calendar navigation
  calendarPrev?.addEventListener("click", () => navigateCalendar(-1));
  calendarNext?.addEventListener("click", () => navigateCalendar(1));

  // Play next button in completion banner
  playNextBtn?.addEventListener("click", startNextPuzzle);

  // Logo click to go back to homepage
  logo?.addEventListener("click", (e) => {
    e.preventDefault();
    showHomepage();
  });
};

initApp();
