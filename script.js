// Get elements from DOM
const loadingIcon = document.getElementById("loadingIcon"); // Get loading icon element
const sudokuGrid = document.getElementById("sudokuGrid"); // Get Sudoku grid container element
const solveButton = document.querySelector("button[onclick='solvePuzzle()']"); // Get the solve button element

// Initialize grid function
function initializeGrid() {
  sudokuGrid.innerHTML = ""; // Clear the Sudoku grid
  for (let i = 0; i < 81; i++) {
    // Loop to create 81 grid cells (9x9 Sudoku)
    const cell = document.createElement("input"); // Create a new input element
    cell.type = "text"; // Set input type to text
    cell.maxLength = 1; // Allow only 1 character per cell
    cell.classList.add("cell"); // Add "cell" class for styling
    cell.addEventListener("input", validatePuzzle); // Add event listener to validate on user input
    sudokuGrid.appendChild(cell); // Append the input cell to the grid
  }
  solveButton.disabled = false; // Initially enable the solve button
}

// Fetch Sudoku puzzle from API with caching
// Utility function to set a timeout for fetch
function fetchWithTimeout(url, options, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Request timed out")),
      timeout
    ); // Set timeout
    fetch(url, options)
      .then((response) => {
        clearTimeout(timer); // Clear the timer if fetch completes
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timer); // Clear the timer on error
        reject(error);
      });
  });
}

// Fetch Sudoku puzzle from API with caching and timeout
async function getPuzzle(difficulty) {
  showLoadingAnimation(); // Show looping loading animation while fetching
  try {
    const response = await fetchWithTimeout(
      `https://sugoku.onrender.com/board?difficulty=${difficulty}`,
      {},
      5000
    );
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    hideLoadingAnimation(); // Hide loading animation after fetching
    loadPuzzle(data.board);
  } catch (error) {
    console.error("Error fetching puzzle:", error);
    hideLoadingAnimation(); // Hide loading animation on error
  }
}

// Function to load puzzle into the grid
function loadPuzzle(puzzle) {
  puzzle.forEach((row, i) => {
    // Loop through each row of the puzzle
    row.forEach((value, j) => {
      // Loop through each column of the current row
      const cell = sudokuGrid.children[i * 9 + j]; // Get the corresponding cell in the grid
      cell.value = value !== 0 ? value : ""; // Set the value to the cell, or empty if value is 0
      cell.classList.toggle("readonly", value !== 0); // Mark readonly for pre-filled cells
    });
  });
}

// Validate puzzle for duplicates (row, column, subgrid)
function validatePuzzle() {
  clearErrors(); // Clear previous error highlights

  const board = []; // Create a new board to hold the values
  let isValid = true; // Flag to track if puzzle is valid
  for (let i = 0; i < 9; i++) {
    // Loop through rows
    board.push([]); // Create a new row in the board
    for (let j = 0; j < 9; j++) {
      // Loop through columns
      const cell = sudokuGrid.children[i * 9 + j]; // Get the corresponding cell
      const value = cell.value ? parseInt(cell.value) : 0; // Parse cell value or set to 0 if empty
      board[i][j] = value; // Add value to the board
    }
  }

  // Check for duplicates in rows, columns, and subgrids
  for (let row = 0; row < 9; row++) {
    // Loop through rows
    for (let col = 0; col < 9; col++) {
      // Loop through columns
      const num = board[row][col]; // Get the current number
      if (num !== 0 && !isValidPlacement(board, row, col, num)) {
        // Check if placement is valid
        sudokuGrid.children[row * 9 + col].classList.add("error"); // Add error class if invalid
        isValid = false; // Set isValid to false
      }
    }
  }

  solveButton.disabled = !isValid; // Disable solve button if there are errors
}

// Clear previous error highlights
function clearErrors() {
  for (let i = 0; i < 81; i++) {
    // Loop through all cells
    sudokuGrid.children[i].classList.remove("error"); // Remove error class from each cell
  }
}

// Check if a number can be placed in the current cell
function isValidPlacement(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    // Loop through rows and columns to check for duplicates
    if (
      (board[row][i] === num && i !== col) || // Check if the number exists in the row (not in the current column)
      (board[i][col] === num && i !== row) || // Check if the number exists in the column (not in the current row)
      (board[3 * Math.floor(row / 3) + Math.floor(i / 3)][
        3 * Math.floor(col / 3) + (i % 3)
      ] === num &&
        (3 * Math.floor(row / 3) + Math.floor(i / 3) !== row ||
          3 * Math.floor(col / 3) + (i % 3) !== col)) // Check 3x3 subgrid
    ) {
      return false; // Return false if any condition fails
    }
  }
  return true; // Return true if placement is valid
}

// Reset the grid to its initial state
function resetGrid() {
  for (let i = 0; i < sudokuGrid.children.length; i++) {
    // Loop through all cells
    const cell = sudokuGrid.children[i]; // Get each cell
    cell.value = ""; // Reset cell value
    cell.classList.remove("readonly"); // Remove readonly class
    cell.classList.remove("error"); // Clear error highlights
  }
  solveButton.disabled = false; // Enable the solve button on reset
}

// Solve the Sudoku puzzle using backtracking algorithm
function solvePuzzle() {
  const board = []; // Create an empty board to hold the cell values
  for (let i = 0; i < 9; i++) {
    // Loop through rows
    board.push([]); // Create a new row in the board
    for (let j = 0; j < 9; j++) {
      // Loop through columns
      const value = sudokuGrid.children[i * 9 + j].value; // Get the value from the cell
      board[i][j] = value ? parseInt(value) : 0; // Add value to board (0 if empty)
    }
  }

  if (solveSudoku(board)) {
    // Try solving the puzzle using backtracking
    board.forEach((row, i) => {
      // Loop through solved rows
      row.forEach((value, j) => {
        // Loop through solved columns
        const cell = sudokuGrid.children[i * 9 + j]; // Get the corresponding cell
        cell.value = value; // Set the solved value in the cell
      });
    });
  } else {
    console.error("No solution exists for the given puzzle."); // Log error if no solution is found
  }
}

// Backtracking algorithm to solve the Sudoku puzzle
function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    // Loop through rows
    for (let col = 0; col < 9; col++) {
      // Loop through columns
      if (board[row][col] === 0) {
        // If the cell is empty
        for (let num = 1; num <= 9; num++) {
          // Try numbers 1-9
          if (isValidPlacement(board, row, col, num)) {
            // Check if the number is valid
            board[row][col] = num; // Place the number in the cell
            if (solveSudoku(board)) {
              // Recursively try to solve the rest of the puzzle
              return true; // Return true if solved
            }
            board[row][col] = 0; // Reset cell if no solution is found
          }
        }
        return false; // Return false if no number is valid for the current cell
      }
    }
  }
  return true; // Return true if the entire puzzle is solved
}

// Function to show the loading animation (grid popping effect)
function showLoadingAnimation() {
  loadingIcon.style.display = "block"; // Show loading icon
  const cells = sudokuGrid.children;
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const row = Math.floor(i / 9);
    const col = i % 9;
    const delay = (row + col) * 0.05 + "s";
    cell.style.animation = `popIn 0.5s ease-in-out forwards ${delay}`;
  }
}


// Function to hide the loading animation after the puzzle is fetched
function hideLoadingAnimation() {
  setTimeout(() => {
  loadingIcon.style.display = "none"; // Hide loading icon
  const cells = sudokuGrid.children;
  for (let i = 0; i < cells.length; i++) {
    cells[i].style.animation = ""; // Reset animation
  }
},500);
}

// Start puzzle fetch on button click (easy difficulty example)
function startPuzzleFetch(difficulty) {
  initializeGrid(); // Initialize grid
  getPuzzle(difficulty); // Fetch the puzzle
}

// Initialize grid on page load
initializeGrid(); // Initialize the grid when the page is loaded
