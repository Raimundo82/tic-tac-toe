let origBoard;
let huPlayer1 = 'O';
let aiPlayer = 'X';
let humanPlayers = 1
let turnPlayer = aiPlayer;
let difficulty = 'easy';
const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [6, 4, 2],
    [2, 5, 8],
    [1, 4, 7],
    [0, 3, 6]
];

const cells = document.querySelectorAll('.cell');
huPlayersNumber();

function selectSym(sym) {
    origBoard = Array.from(Array(9).keys());
    cells.forEach(cell => cell.addEventListener('click', turnClick, false));

    if (sym === 'X') {
        huPlayer1 = 'X';
        aiPlayer = 'O';
        turnPlayer = huPlayer1;
    } else if (humanPlayers === 1) {
        huPlayer1 = 'O';
        aiPlayer = 'X';
        turnPlayer = aiPlayer;
        turn(bestSpot(), turnPlayer);
    }

    if (humanPlayers === 2) {
        labelTurn(turnPlayer);
    }

    styleDisplayChange('symbol', "none");
}

function huPlayersNumber() {
    styleDisplayChange('endgame', "none");
    passTextToElement('endgameText',"");
    styleDisplayChange('human', "block");
}

function styleDisplayChange(elementId, action) {
    document.getElementById(elementId).style.display = action;
}

function changeBackgroundColor(elementId, color) {
    document.getElementById(elementId).style.backgroundColor = `${color}`
}

function passTextToElement(elementId, text) {
    document.getElementById(elementId).innerText = text;

}

function labelTurn(player) {
    let color;
    player === huPlayer1 ? color = "green" : color = "red";
    styleDisplayChange('turn', "none");
    changeBackgroundColor('turn', color);
    passTextToElement('turnText', `Player ${player} turn`)
    styleDisplayChange('turn', "block");
}

function selectDifficulty(number) {
    humanPlayers = number;
    styleDisplayChange('turn', "none");
    styleDisplayChange('human', "none");
    if (humanPlayers === 1) {
        styleDisplayChange('dif',"block")
    } else {
        startGame('hard')
    }
}

function startGame(dif) {
    difficulty = dif;
    styleDisplayChange('dif', "none");
    styleDisplayChange('symbol', "block");

    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
    }
}

function turnClick(square) {
    if (typeof origBoard[square.target.id] === 'number') {
        if (humanPlayers === 1) {
            turn(square.target.id, huPlayer1);
            if (!checkWin(origBoard, huPlayer1) && !checkTie()) {
                turn(bestSpot(), aiPlayer);
            }
        } else {
            turn(square.target.id, turnPlayer);
            if (!checkWin(origBoard, huPlayer1) && !checkTie()) {
                turn(square.target.id, turnPlayer);
            }
            changeTurn();
        }
    }
}

function changeTurn() {
    turnPlayer === aiPlayer ? turnPlayer = huPlayer1 : turnPlayer = aiPlayer;
    labelTurn(turnPlayer)
}

function turn(squareId, player) {
    origBoard[squareId] = player;
    document.getElementById(squareId).innerHTML = player;
    let gameWon = checkWin(origBoard, player);
    if (gameWon) gameOver(gameWon);
    checkTie();
}

function checkWin(board, player) {
    let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winCombos.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = {index: index, player: player};
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    for (let index of winCombos[gameWon.index]) {
        changeBackgroundColor(index, gameWon.player === huPlayer1 ? "green" : "red");
    }

    for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }
    humanPlayers === 1 ?
        declareWinner(gameWon.player === huPlayer1 ? "You win!" : "You lose") :
        declareWinner(gameWon.player === huPlayer1 ? `Player ${huPlayer1} wins` : `Player ${aiPlayer} wins`);
    ;
}

function declareWinner(who) {
    styleDisplayChange('endgame',"block");
    passTextToElement('endgameText',who);
}

function emptySquares() {
    return origBoard.filter((elm, i) => i === elm);
}

function bestSpot() {
    return difficulty === 'hard' ?
        minimax(origBoard, aiPlayer).index :
        emptySquares()[0];
}

function checkTie() {
    if (emptySquares().length === 0) {
        cells.forEach(cell => {
            cell.style.backgroundColor = "gray";
            cell.removeEventListener('click', turnClick, false);
        })
        declareWinner("Tie game");
        return true;
    }
    return false;
}

function minimax(newBoard, player) {
    const availSpots = emptySquares(newBoard);

    if (checkWin(newBoard, huPlayer1)) {
        return {score: -10};
    } else if (checkWin(newBoard, aiPlayer)) {
        return {score: 10};
    } else if (availSpots.length === 0) {
        return {score: 0};
    }

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        if (player === aiPlayer)
            move.score = minimax(newBoard, huPlayer1).score;
        else
            move.score = minimax(newBoard, aiPlayer).score;
        newBoard[availSpots[i]] = move.index;
        if ((player === aiPlayer && move.score === 10) || (player === huPlayer1 && move.score === -10))
            return move;
        else
            moves.push(move);
    }

    let bestMove, bestScore;
    if (player === aiPlayer) {
        bestScore = -1000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        bestScore = 1000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    return moves[bestMove];
}
