const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'
];

const SHAPES = [
    [[1, 1, 1, 1]],                    // I
    [[2, 2, 2], [0, 2, 0]],           // T
    [[3, 3, 3], [3, 0, 0]],           // L
    [[4, 4, 4], [0, 0, 4]],           // J
    [[5, 5], [5, 5]],                 // O
    [[6, 6, 0], [0, 6, 6]],           // S
    [[0, 7, 7], [7, 7, 0]]            // Z
];

let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
let nextCanvas = document.getElementById('next');
let nextCtx = nextCanvas.getContext('2d');

let score = 0;
let level = 1;
let gameOver = false;
let paused = false;
let currentPiece;
let nextPiece;
let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let gameLoop;
let isPlaying = false;

function createPiece() {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
        shape,
        pos: {x: Math.floor(COLS/2) - Math.floor(shape[0].length/2), y: 0}
    };
}

function draw() {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawBoard();
    if (currentPiece) {
        drawPiece(ctx, currentPiece);
    }
}

function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillStyle = COLORS[value - 1];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = 'black';
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function drawPiece(context, piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = COLORS[value - 1];
                context.fillRect(
                    (piece.pos.x + x) * BLOCK_SIZE,
                    (piece.pos.y + y) * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
                context.strokeStyle = 'black';
                context.strokeRect(
                    (piece.pos.x + x) * BLOCK_SIZE,
                    (piece.pos.y + y) * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
            }
        });
    });
}

function merge() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[y + currentPiece.pos.y][x + currentPiece.pos.x] = value;
            }
        });
    });
}

function collision() {
    const shape = currentPiece.shape;
    const pos = currentPiece.pos;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x] !== 0 &&
                (board[y + pos.y] &&
                board[y + pos.y][x + pos.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function moveDown() {
    currentPiece.pos.y++;
    if (collision()) {
        currentPiece.pos.y--;
        merge();
        checkLines();
        resetPiece();
        if (gameOver) {
            isPlaying = false;
            document.getElementById('pause-btn').disabled = true;
            alert('遊戲結束！得分：' + score);
        }
        return false;
    }
    return true;
}

function moveLeft() {
    currentPiece.pos.x--;
    if (collision()) {
        currentPiece.pos.x++;
        return false;
    }
    return true;
}

function moveRight() {
    currentPiece.pos.x++;
    if (collision()) {
        currentPiece.pos.x--;
        return false;
    }
    return true;
}

function rotate() {
    const shape = currentPiece.shape;
    const newShape = shape[0].map((val, index) => 
        shape.map(row => row[index]).reverse()
    );
    const oldShape = currentPiece.shape;
    currentPiece.shape = newShape;
    if (collision()) {
        currentPiece.shape = oldShape;
    }
}

function checkLines() {
    let lines = 0;
    outer: for (let y = board.length - 1; y >= 0; y--) {
        for (let x = 0; x < board[y].length; x++) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        lines++;
        y++;
    }
    
    if (lines > 0) {
        score += lines * 100 * level;
        document.getElementById('score').textContent = score;
        if (score >= level * 1000) {
            level++;
            document.getElementById('level').textContent = level;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        }
    }
}

function resetPiece() {
    currentPiece = nextPiece;
    nextPiece = createPiece();
    drawNext();
    if (collision()) {
        gameOver = true;
        alert('遊戲結束！得分：' + score);
        resetGame();
    }
}

function drawNext() {
    nextCtx.fillStyle = '#f8f8f8';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (nextPiece) {
        nextCtx.save();
        nextCtx.translate(20, 20);
        drawPiece(nextCtx, {
            shape: nextPiece.shape,
            pos: {x: 0, y: 0}
        });
        nextCtx.restore();
    }
}

function update(time = 0) {
    if (gameOver || paused) return;

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        moveDown();
        dropCounter = 0;
    }

    draw();
    requestAnimationFrame(update);
}

function resetGame() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    level = 1;
    dropInterval = 1000;
    gameOver = false;
    isPlaying = false;
    dropCounter = 0;
    lastTime = 0;
    
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    currentPiece = createPiece();
    nextPiece = createPiece();
    draw();
    drawNext();
}

function startGameLoop() {
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    gameLoop = setInterval(() => {
        if (!gameOver && !paused) {
            moveDown();
            draw();
        }
    }, dropInterval);
}

document.addEventListener('keydown', event => {
    if (gameOver || paused) return;

    switch(event.key) {
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowUp':
            rotate();
            break;
    }
    draw();
});

document.querySelectorAll('.control-btn').forEach(button => {
    button.addEventListener('click', () => {
        if (gameOver || paused) return;
        
        const key = button.dataset.key;
        switch(key) {
            case 'ArrowLeft':
                moveLeft();
                break;
            case 'ArrowRight':
                moveRight();
                break;
            case 'ArrowDown':
                moveDown();
                break;
            case 'ArrowUp':
                rotate();
                break;
        }
        draw();
    });
});

document.getElementById('start-btn').addEventListener('click', () => {
    if (isPlaying) return;
    
    if (gameOver) {
        resetGame();
    }
    
    gameOver = false;
    paused = false;
    isPlaying = true;
    document.getElementById('pause-btn').disabled = false;
    
    lastTime = 0;
    dropCounter = 0;
    requestAnimationFrame(update);
});

document.getElementById('pause-btn').addEventListener('click', () => {
    if (!isPlaying) return;
    
    paused = !paused;
    if (!paused) {
        lastTime = 0;
        requestAnimationFrame(update);
    }
});

resetGame(); 