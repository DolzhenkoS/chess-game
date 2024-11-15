// src/utils/chessLogic.js

const pieceValues = {
    Pawn: 1,
    Knight: 3,
    Bishop: 3,
    Rook: 5,
    Queen: 9,
    King: 0, // Король не имеет численной стоимости, но потеря его означает конец игры
};

// Оценка доски: положительные значения для белых, отрицательные для черных
export function evaluateBoard(board) {
    let evaluation = 0;

    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const piece = board[x][y];
            if (piece) {
                const value = pieceValues[piece.constructor.name];
                evaluation += piece.color === 'w' ? value : -value;
            }
        }
    }

    return evaluation;
}

export function minimax(board, depth, isMaximizingPlayer, alpha, beta) {
    if (depth === 0) {
        return evaluateBoard(board); // Оценка текущей позиции
    }

    const color = isMaximizingPlayer ? 'b' : 'w'; // Черные или белые
    const allMoves = getAllMoves(board, color);

    if (allMoves.length === 0) {
        return isMaximizingPlayer ? -Infinity : Infinity; // Мат или пат
    }

    let bestValue = isMaximizingPlayer ? -Infinity : Infinity;

    for (const move of allMoves) {
        const [start, end] = move;
        const simulatedBoard = makeMove(board, start, end);

        const value = minimax(simulatedBoard, depth - 1, !isMaximizingPlayer, alpha, beta);

        if (isMaximizingPlayer) {
            bestValue = Math.max(bestValue, value);
            alpha = Math.max(alpha, bestValue);
        } else {
            bestValue = Math.min(bestValue, value);
            beta = Math.min(beta, bestValue);
        }

        if (beta <= alpha) break; // Альфа-бета обрезка
    }

    return bestValue;
}

export function getAllMoves(board, color) {
    const moves = [];

    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const piece = board[x][y];
            if (piece && piece.color === color) {
                const validMoves = getValidMoves([x, y], piece, board);

                // Добавляем только корректные ходы
                validMoves.forEach((move) => {
                    const simulatedBoard = makeMove(board, [x, y], move);
                    if (!isKingInCheck(simulatedBoard, color)) {
                        moves.push([[x, y], move]);
                    }
                });
            }
        }
    }

    return moves;
}

export function makeBestMove(board, depth) {
    let bestMove = null;
    let bestValue = -Infinity;

    const allMoves = getAllMoves(board, 'b'); // Ходы для черных (AI)

    for (const move of allMoves) {
        const [start, end] = move;
        const simulatedBoard = makeMove(board, start, end);

        const boardValue = minimax(simulatedBoard, depth - 1, false, -Infinity, Infinity);

        if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }

    return bestMove;
}

// Функция для симуляции хода
export function makeMove(board, start, end) {
    const newBoard = board.map(row => row.slice());

    const piece = newBoard[start[0]][start[1]];
    newBoard[end[0]][end[1]] = piece;
    newBoard[start[0]][start[1]] = null;

    // Проверка превращения пешки
    if (
        piece.constructor.name === "Pawn" &&
        (end[0] === 0 || end[0] === 7)
    ) {
        newBoard[end[0]][end[1]] = new Queen(piece.color); // Пешка превращается в ферзя
    }

    return newBoard;
}

// src/utils/chessLogic.js

export function getValidMoves(start, piece, board) {
    const validMoves = [];

    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const end = [x, y];

            if (piece.isValidMove(start, end, board)) {
                // Копируем доску, чтобы проверить, приводит ли ход к шаху
                const boardCopy = board.map(row => row.slice());
                boardCopy[end[0]][end[1]] = piece;
                boardCopy[start[0]][start[1]] = null;

                // Проверяем, не будет ли король под шахом после хода
                if (!isKingInCheck(boardCopy, piece.color)) {
                    validMoves.push(end);
                }
            }
        }
    }

    return validMoves;
}

export function isCheckmate(board, color) {
    if (!isKingInCheck(board, color)) return false; // Король не под шахом — это не мат

    // Перебираем все фигуры игрока и их возможные ходы
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const piece = board[x][y];
            if (piece && piece.color === color) {
                const moves = getValidMoves([x, y], piece, board);
                if (moves.length > 0) {
                    return false; // Есть допустимый ход, это не мат
                }
            }
        }
    }

    return true; // Король под шахом и нет допустимых ходов — это мат
}


// Проверка, находится ли король под шахом
export function isKingInCheck(board, color) {
    // Находим короля
    let kingPosition = null;
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const piece = board[x][y];
            if (piece && piece.constructor.name === 'King' && piece.color === color) {
                kingPosition = [x, y];
                break;
            }
        }
        if (kingPosition) break;
    }

    if (!kingPosition) return false; //!!!!!

    // Проверка всех фигур противника, угрожающих королю
    const opponentColor = color === 'w' ? 'b' : 'w';
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const piece = board[x][y];
            if (piece && piece.color === opponentColor) {
                if (piece.isValidMove([x, y], kingPosition, board)) {
                    return true; // Король под шахом
                }
            }
        }
    }

    return false;
}


function isWithinBounds(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
}

class Piece {
    constructor(color) {
        this.color = color;
    }

    isValidMove(start, end, board) {
        throw new Error("isValidMove должен быть переопределен");
    }
}

class Pawn extends Piece {
    isValidMove(start, end, board) {
        const [startX, startY] = start;
        const [endX, endY] = end;
        const direction = this.color === "w" ? -1 : 1;
        const isStartingPosition = (this.color === "w" && startX === 6) || (this.color === "b" && startX === 1);

        if (endY === startY && board[endX][endY] === null) {
            if (endX === startX + direction) return true;
            if (isStartingPosition && endX === startX + 2 * direction) return true;
        }

        if (Math.abs(endY - startY) === 1 && endX === startX + direction) {
            return board[endX][endY] !== null && board[endX][endY].color !== this.color;
        }

        return false;
    }
}


class Rook extends Piece {
    constructor(color) {
        super(color);
        this.hasMoved = false; // Флаг, указывающий, двигалась ли ладья
    }

    isValidMove(start, end, board) {
        const [startX, startY] = start;
        const [endX, endY] = end;

        if (!isWithinBounds(endX, endY)) return false;

        if (startX !== endX && startY !== endY) return false;

        const dx = endX === startX ? 0 : endX > startX ? 1 : -1;
        const dy = endY === startY ? 0 : endY > startY ? 1 : -1;
        let x = startX + dx;
        let y = startY + dy;

        while (isWithinBounds(x, y) && (x !== endX || y !== endY)) {
            if (board[x][y] !== null) return false;
            x += dx;
            y += dy;
        }

        return board[endX][endY] === null || board[endX][endY].color !== this.color;
    }
}

// class Knight extends Piece {
//     isValidMove(start, end) {
//         const [startX, startY] = start;
//         const [endX, endY] = end;

//         const dx = Math.abs(startX - endX);
//         const dy = Math.abs(startY - endY);

//         return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
//     }
// }

class Knight extends Piece {
    isValidMove(start, end, board) {
        const [startX, startY] = start;
        const [endX, endY] = end;

        // Проверка координат хода
        const dx = Math.abs(startX - endX);
        const dy = Math.abs(startY - endY);

        // Конь должен двигаться в форме "Г" (2 клетки в одну сторону, 1 в другую)
        if (!((dx === 2 && dy === 1) || (dx === 1 && dy === 2))) {
            return false;
        }

        // Проверка, не стоит ли на конечной клетке фигура того же цвета
        const targetPiece = board[endX][endY];
        if (targetPiece && targetPiece.color === this.color) {
            return false; // Нельзя взять свою фигуру
        }

        return true;
    }
}

class Bishop extends Piece {
    isValidMove(start, end, board) {

        const [startX, startY] = start;
        const [endX, endY] = end;

        if (!isWithinBounds(endX, endY)) return false; // Проверка границ доски


        if (Math.abs(startX - endX) !== Math.abs(startY - endY)) return false;

        const dx = endX > startX ? 1 : -1;
        const dy = endY > startY ? 1 : -1;
        let x = startX + dx;
        let y = startY + dy;

        while (isWithinBounds(x, y) && (x !== endX || y !== endY)) {
            if (board[x][y] !== null) return false;
            x += dx;
            y += dy;
        }

        return board[endX][endY] === null || board[endX][endY].color !== this.color;
    }
}

class Queen extends Piece {
    isValidMove(start, end, board) {
        const rookMove = new Rook(this.color).isValidMove(start, end, board);
        const bishopMove = new Bishop(this.color).isValidMove(start, end, board);
        return rookMove || bishopMove;
    }
}


class King extends Piece {
    constructor(color) {
        super(color);
        this.hasMoved = false; // Флаг, указывающий, двигался ли король
    }

    isValidMove(start, end, board) {
        const [startX, startY] = start;
        const [endX, endY] = end;

        // Проверка стандартного хода короля на 1 клетку
        const dx = Math.abs(startX - endX);
        const dy = Math.abs(startY - endY);
        if (dx <= 1 && dy <= 1) {
            return (
                board[endX][endY] === null || board[endX][endY].color !== this.color
            );
        }

        // Проверка на рокировку
        if (!this.hasMoved && startX === endX && Math.abs(startY - endY) === 2) {
            const rookY = endY > startY ? 7 : 0; // Определяем столбец ладьи (короткая или длинная рокировка)
            const rook = board[startX][rookY];

            // Убедимся, что ладья существует, не двигалась и пути нет препятствий
            if (
                rook &&
                rook.constructor.name === "Rook" &&
                !rook.hasMoved &&
                this.isCastlingPathClear(start, [startX, rookY], board)
            ) {
                return true;
            }
        }

        return false;
    }

    // Проверяем, чист ли путь для рокировки
    isCastlingPathClear(kingStart, rookPosition, board) {
        const [kingX, kingY] = kingStart;
        const [rookX, rookY] = rookPosition;

        const direction = rookY > kingY ? 1 : -1;
        let y = kingY + direction;

        // Проверяем, что клетки между королем и ладьей пусты и не атакованы
        while (y !== rookY) {
            if (board[kingX][y] !== null) return false;
            y += direction;
        }

        return true;
    }
}

function initializeBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));

    const backRow = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook];
    const colors = ['b', 'w'];

    for (let i = 0; i < 8; i++) {
        board[0][i] = new backRow[i](colors[0]);
        board[7][i] = new backRow[i](colors[1]);
        board[1][i] = new Pawn(colors[0]);
        board[6][i] = new Pawn(colors[1]);
    }

    return board;
}




export { initializeBoard, Pawn, Rook, Knight, Bishop, Queen, King };
