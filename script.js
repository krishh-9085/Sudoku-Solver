const loadingIcon = document.getElementById("loadingIcon");
const sudokuGrid = document.getElementById("sudokuGrid");

// Initialize grid
function initializeGrid() {
    sudokuGrid.innerHTML = "";
    for (let i = 0; i < 81; i++) {
        const cell = document.createElement("input");
        cell.type = "text";
        cell.maxLength = 1;
        cell.classList.add("cell");
        sudokuGrid.appendChild(cell);
    }
}

// Fetch Sudoku puzzle
async function getPuzzle(difficulty) {
    try {
        loadingIcon.style.display = "block"; // Show loading icon
        const response = await fetch(`https://sugoku.onrender.com/board?difficulty=${difficulty}`);
        const data = await response.json();
        loadingIcon.style.display = "none"; // Hide loading icon after fetching

        const puzzle = data.board;
        puzzle.forEach((row, i) => {
            row.forEach((value, j) => {
                const cell = sudokuGrid.children[i * 9 + j];
                cell.value = value !== 0 ? value : "";
                cell.classList.toggle("readonly", value !== 0);
            });
        });
    } catch (error) {
        loadingIcon.style.display = "none"; // Hide loading icon on error
        console.error("Error fetching puzzle:", error);
    }
}

// Reset grid
function resetGrid() {
    for (let i = 0; i < sudokuGrid.children.length; i++) {
        const cell = sudokuGrid.children[i];
        cell.value = "";
        cell.classList.remove("readonly");
    }
}

// Solve puzzle using backtracking algorithm
function solvePuzzle() {
    loadingIcon.style.display = "block"; // Show loading icon before solving

    const board = [];
    for (let i = 0; i < 9; i++) {
        board.push([]);
        for (let j = 0; j < 9; j++) {
            const value = sudokuGrid.children[i * 9 + j].value;
            board[i][j] = value ? parseInt(value) : 0;
        }
    }

    if (solveSudoku(board)) {
        board.forEach((row, i) => {
            row.forEach((value, j) => {
                const cell = sudokuGrid.children[i * 9 + j];
                cell.value = value;
            });
        });
    } else {
        console.error("No solution exists for the given puzzle.");
    }

    loadingIcon.style.display = "none"; // Hide loading icon after solving
}

// Sudoku backtracking solver function
function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board)) {
                            return true;
                        }
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// Check if placing a number is valid
function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num || board[3 * Math.floor(row / 3) + Math.floor(i / 3)][3 * Math.floor(col / 3) + (i % 3)] === num) {
            return false;
        }
    }
    return true;
}

// Initialize grid on page load
initializeGrid();
