var wastes = ["M", "O", "PA", "PL", "C", "G"];
var board = [];
var rows = 9;
var columns = 9;

var currTile;
var otherTile;

let draggedTile = null;
let score = 0; // Initialize score variable
let timeLeft = 60; // 60 seconds timer
let timerInterval;

window.onload = function() {
    startGame();
    updateScoreDisplay(); // Display initial score
    startTimer(); // Start the timer

    // Call cWastes every second
    window.setInterval(function() {
        cWastes();
    }, 1000);
}

function randomWaste() {
    return wastes[Math.floor(Math.random() * wastes.length)];
}

function startGame() {
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.id = r.toString() + "-" + c.toString();
            tile.src = "./image/" + randomWaste() + ".png";
            tile.draggable = true; // Make the tile draggable

            // Drag functionality
            tile.addEventListener("dragstart", dragStart);
            tile.addEventListener("dragover", dragOver);
            tile.addEventListener("dragenter", dragEnter);
            tile.addEventListener("dragleave", dragLeave);
            tile.addEventListener("drop", dragDrop);
            tile.addEventListener("dragend", dragEnd);

            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }
    console.log(board);
}

function dragStart(e) {
    draggedTile = e.target; // Store the dragged tile
    e.dataTransfer.effectAllowed = "move"; // Set drag effect
    currTile = this;
}

function dragOver(e) {
    e.preventDefault(); // Prevent default to allow drop
    e.dataTransfer.dropEffect = "move"; // Show move effect
}

function dragEnter(e) {
    e.preventDefault(); // Prevent default to allow drop
}

function dragLeave(e) {
    // Optional: Add visual feedback for leaving
}

function dragDrop(e) {
    e.stopPropagation(); // Prevent default action
    otherTile = e.target; // Set the target tile
}

function dragEnd(e) {
    if(currTile.src.includes("blank") || otherTile.src.includes("blank")){
        return;
    }

    let currCoords = currTile.id.split("-");
    let r = parseInt(currCoords[0]);
    let c = parseInt(currCoords[1]);

    let otherCoords = otherTile.id.split("-");
    let r2 = parseInt(otherCoords[0]);
    let c2 = parseInt(otherCoords[1]);

    // Check if the tiles are adjacent
    let isAdjacent = (c2 == c - 1 && r == r2) || (c2 == c + 1 && r == r2) ||
                     (r2 == r - 1 && c == c2) || (r2 == r + 1 && c == c2);

    if (isAdjacent) {
        // Swap images
        let currImg = currTile.src;
        let otherImg = otherTile.src; 
        currTile.src = otherImg;
        otherTile.src = currImg;

        let validMove = checkValid();
        if (!validMove) {
            // Swap back if the move is not valid
            currTile.src = currImg;  
            otherTile.src = otherImg;  
        } else {
            // If the move is valid, check for matches
            cThree();
        }
    }
}

function cWastes() {
    cThree();
}

function cThree() {
    let matchedTiles = []; // Keep track of matched tiles

    // Check horizontal matches
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let waste1 = board[r][c];
            let waste2 = board[r][c + 1];
            let waste3 = board[r][c + 2];

            if (waste1.src === waste2.src && waste2.src === waste3.src && !waste1.src.includes("blank")) {
                matchedTiles.push(waste1, waste2, waste3);
            }
        }
    }

    // Check vertical matches
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let waste1 = board[r][c];
            let waste2 = board[r + 1][c];
            let waste3 = board[r + 2][c];

            if (waste1.src === waste2.src && waste2.src === waste3.src && !waste1.src.includes("blank")) {
                matchedTiles.push(waste1, waste2, waste3);
            }
        }
    }

    // Crush matched tiles and handle board state
    if (matchedTiles.length > 0) {
        crushTiles(matchedTiles);
        updateScore(30); // Increase score by 30 points
    }
}

function crushTiles(tiles) {
    tiles.forEach(tile => {
        tile.src = "./image/B.png"; // Replace with blank image
    });

    // Drop tiles down and fill in new ones
    for (let c = 0; c < columns; c++) {
        for (let r = rows - 1; r >= 0; r--) {
            if (board[r][c].src.includes("B")) {
                // Find a tile above to drop down
                for (let rAbove = r - 1; rAbove >= 0; rAbove--) {
                    if (!board[rAbove][c].src.includes("B")) {
                        // Swap with the tile above
                        board[r][c].src = board[rAbove][c].src;
                        board[rAbove][c].src = "./image/B.png"; // Set the above tile to blank
                        break;
                    }
                }
            }
        }
    }

    // Fill empty tiles with new random wastes
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c].src.includes("B")) {
                board[r][c].src = "./image/" + randomWaste() + ".png"; // Fill with new waste
            }
        }
    }
}

function updateScore(points) {
    score += points; // Increase score
    updateScoreDisplay(); // Update the score display
}

function updateScoreDisplay() {
    const scoreElement = document.getElementById("score"); // Ensure you have an element to display score
    if (scoreElement) {
        scoreElement.textContent = "Score: " + score; // Update score display
    }
}

function startTimer() {
    timerInterval = setInterval(function() {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        } else {
            document.getElementById("timer").textContent = "Time Left: " + timeLeft + " seconds";
            timeLeft--;
        }
    }, 1000);
}

function endGame() {
    // Play the game over sound
    let audio = new Audio("go.mp3");
    audio.play();

    // Display the final score and game over message
    alert("Game Over! Your final score is: " + score);

    // Optionally reset the game or redirect
    // resetGame(); // Uncomment to reset game or handle redirection
}

function checkValid() {
    // Check horizontal matches
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let waste1 = board[r][c];
            let waste2 = board[r][c + 1];
            let waste3 = board[r][c + 2];

            if (waste1.src === waste2.src && waste2.src === waste3.src && !waste1.src.includes("blank")) {
                return true;
            }
        }
    }

    // Check vertical matches
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let waste1 = board[r][c];
            let waste2 = board[r + 1][c];
            let waste3 = board[r + 2][c];

            if (waste1.src === waste2.src && waste2.src === waste3.src && !waste1.src.includes("blank")) {
                return true;
            }
        }
    }
    return false;
}

