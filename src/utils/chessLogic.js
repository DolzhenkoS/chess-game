// src/utils/chessLogic.js

// src/utils/chessLogic.js
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

// src/utils/chessLogic.js

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

// src/utils/chessLogic.js

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
    isValidMove(start, end, board) {

        const [startX, startY] = start;
        const [endX, endY] = end;

        if (startX !== endX && startY !== endY) return false;

        const dx = endX === startX ? 0 : endX > startX ? 1 : -1;
        const dy = endY === startY ? 0 : endY > startY ? 1 : -1;
        let x = startX + dx;
        let y = startY + dy;

        while (x !== endX || y !== endY) {
            if (board[x][y] !== null) return false;
            x += dx;
            y += dy;
        }

        return board[endX][endY] === null || board[endX][endY].color !== this.color;
    }
}

class Knight extends Piece {
    isValidMove(start, end) {
        const [startX, startY] = start;
        const [endX, endY] = end;

        const dx = Math.abs(startX - endX);
        const dy = Math.abs(startY - endY);

        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
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
    isValidMove(start, end, board) {
        const [startX, startY] = start;
        const [endX, endY] = end;

        const dx = Math.abs(startX - endX);
        const dy = Math.abs(startY - endY);

        if (dx <= 1 && dy <= 1) {
            return board[endX][endY] === null || board[endX][endY].color !== this.color;
        }
        return false;
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
