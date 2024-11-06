const sudokuGrid = document.getElementById("sudokuGrid");

// Initialize the 9x9 Sudoku grid
function initGrid() {
  sudokuGrid.innerHTML = "";
  for (let i = 0; i < 81; i++) {
    const cell = document.createElement("input");
    cell.type = "text";
    cell.maxLength = 1;
    cell.classList.add("cell");
    sudokuGrid.appendChild(cell);
  }
}

// Fetch puzzle from API and display it
async function getPuzzle(difficulty) {
  try {
    const response = await fetch(
      `https://sugoku.onrender.com/board?difficulty=${difficulty}`
    );
    const data = await response.json();
    const puzzle = data.board; // The puzzle board is returned in 'board' field

    // Populate the Sudoku grid with the puzzle
    puzzle.forEach((row, i) => {
      row.forEach((value, j) => {
        const cell = sudokuGrid.children[i * 9 + j];
        cell.value = value !== 0 ? value : ""; // Empty cells will be left blank
        cell.classList.toggle("readonly", value !== 0); // Mark non-zero cells as readonly
      });
    });
  } catch (error) {
    console.error("Error fetching puzzle:", error);
  }
}

// Solve the Sudoku puzzle
function solvePuzzle() {
  const puzzle = Array.from(sudokuGrid.children).map(
    (cell) => parseInt(cell.value) || 0
  );
  const solved = sudokuSolver(puzzle);

  if (solved) {
    solved.forEach((value, i) => {
      sudokuGrid.children[i].value = value;
    });
  } else {
    alert("Unable to solve the puzzle");
  }
}

// Reset the Sudoku grid
function resetGrid() {
  Array.from(sudokuGrid.children).forEach((cell) => {
    cell.value = "";
    cell.classList.remove("readonly");
  });
}

// Simple backtracking Sudoku solver
function sudokuSolver(puzzle) {
  const emptyIndex = puzzle.indexOf(0);
  if (emptyIndex === -1) return puzzle; // Solved

  for (let num = 1; num <= 9; num++) {
    if (isValid(num, emptyIndex, puzzle)) {
      puzzle[emptyIndex] = num;
      if (sudokuSolver(puzzle)) return puzzle;
      puzzle[emptyIndex] = 0;
    }
  }
  return null;
}

// Check if num can be placed at puzzle[index]
function isValid(num, index, puzzle) {
  const row = Math.floor(index / 9);
  const col = index % 9;

  for (let i = 0; i < 9; i++) {
    if (puzzle[row * 9 + i] === num || puzzle[i * 9 + col] === num)
      return false;

    const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const boxCol = 3 * Math.floor(col / 3) + (i % 3);
    if (puzzle[boxRow * 9 + boxCol] === num) return false;
  }
  return true;
}

initGrid();
