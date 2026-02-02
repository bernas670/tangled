words: https://gist.github.com/dracos/dd0668f281e685bad51479e5acaadb93

# TODOs
 - highlight knowledge row/col ?
 - revise backspace logic
 - mobile version:
    - knowledge cells are too large and only stay in one row or col
    - add feedback to keyboard (change color on click/vibrate if supported maybe)
 - ui not working in mdpi laptop
 - transpose the grid when pressing space?

# Ideas
  - word pokedex 
    - words are unlocked once you use them as a guess
    - add icon when used as a solution
  - log book
    - add each guess to a log (with the state the word was in)
    - when clicking on the word the definition pops down
  - bug report
    - mechanism to report bugs directly to github issue
  - ui
    - improve color scheme (absent color should show better that its disabled)
    - when hovering a cell in the knowledge, show the places where the letter can/cannot be
      according to the knowledge the user has, on that row/col
