// src/components/ChessBoard.jsx
import React, { useState } from 'react';
import Piece from './Piece';
import { initializeBoard, isKingInCheck, isCheckmate, getValidMoves, Queen } from '../utils/chessLogic';
import './ChessBoard.css';
import { makeBestMove, makeMove } from '../utils/chessLogic';

function ChessBoard() {
    const [board, setBoard] = useState(initializeBoard());
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [turn, setTurn] = useState("w"); // Начинает белый
    const [status, setStatus] = useState("");
    const [moveLog, setMoveLog] = useState([]); // Хранит протокол ходов

    const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    function recordMove(start, end, piece) {
        const [startX, startY] = start;
        const [endX, endY] = end;

        const startNotation = `${columns[startY]}${8 - startX}`;
        const endNotation = `${columns[endY]}${8 - endX}`;

        const move = `${piece.constructor.name} ${startNotation} -> ${endNotation}`;
        setMoveLog((prevLog) => [...prevLog, move]);
    }

    const handleSquareClick = (x, y) => {
        const piece = board[x][y];

        if (selectedPiece) {
            const [startX, startY] = selectedPiece;
            const selectedPieceInstance = board[startX][startY];

            const validMoves = getValidMoves([startX, startY], selectedPieceInstance, board);
            if (validMoves.some(([vx, vy]) => vx === x && vy === y)) {
                const newBoard = board.map(row => row.slice());

                // Записываем ход в протокол
                recordMove([startX, startY], [x, y], selectedPieceInstance);

                // Обработка рокировки
                if (
                    selectedPieceInstance.constructor.name === "King" &&
                    Math.abs(y - startY) === 2
                ) {
                    const rookY = y > startY ? 7 : 0;
                    const rook = board[startX][rookY];
                    const newRookY = y > startY ? y - 1 : y + 1;

                    // Перемещаем короля и ладью
                    newBoard[x][newRookY] = rook;
                    newBoard[startX][rookY] = null;
                    rook.hasMoved = true;
                }

                // Проверка превращения пешки
                if (
                    selectedPieceInstance.constructor.name === "Pawn" &&
                    (x === 0 || x === 7) // Белая пешка достигает 0, черная — 7
                ) {
                    newBoard[x][y] = new Queen(selectedPieceInstance.color); // Превращаем пешку в ферзя
                } else {
                    // Перемещаем фигуру
                    newBoard[x][y] = selectedPieceInstance;
                }

                // Перемещаем короля или любую другую фигуру
                //                newBoard[x][y] = selectedPieceInstance;
                newBoard[startX][startY] = null;

                selectedPieceInstance.hasMoved = true; // Указываем, что фигура уже двигалась
                setBoard(newBoard);

                const nextTurn = turn === "w" ? "b" : "w";
                setTurn(nextTurn);

                if (nextTurn === 'b') {
                    // Ход AI
                    const bestMove = makeBestMove(newBoard, 5); // Глубина 3
                    if (bestMove) {
                        const [aiStart, aiEnd] = bestMove;

                        // Записываем ход AI
                        recordMove(aiStart, aiEnd, newBoard[aiStart[0]][aiStart[1]]);

                        const updatedBoard = makeMove(newBoard, aiStart, aiEnd);
                        setBoard(updatedBoard);
                        setTurn('w'); // Возвращаем ход игроку
                    }
                }



                // Проверка шаха и мата
                if (isKingInCheck(newBoard, nextTurn)) {
                    if (isCheckmate(newBoard, nextTurn)) {
                        setStatus(`Мат! Победа за ${turn === "w" ? "белыми" : "черными"}!`);
                    } else {
                        setStatus("Шах!");
                    }
                } else {
                    setStatus("");
                }
            }

            setSelectedPiece(null);
        } else {
            if (piece && piece.color === turn) {
                setSelectedPiece([x, y]);
            }
        }
    };


    const renderSquare = (piece, x, y) => {
        const isLightSquare = (x + y) % 2 === 0;
        const squareColor = isLightSquare ? "light-square" : "dark-square";

        const pieceTypeMap = {
            Pawn: 'p',
            Rook: 'r',
            Knight: 'n',
            Bishop: 'b',
            Queen: 'q',
            King: 'k',
        };

        const pieceType = piece ? pieceTypeMap[piece.constructor.name] : null;

        return (
            <div
                key={`${x}-${y}`}
                className={`square ${squareColor}`}
                onClick={() => handleSquareClick(x, y)}
            >
                {piece && <Piece type={pieceType} color={piece.color} />}
            </div>
        );
    };

    return (
        <div>
            <div className="chess-board">
                {board.map((row, x) =>
                    row.map((piece, y) => renderSquare(piece, x, y))
                )}
            </div>
            <h2>{status}</h2>
            <div className="move-log">
            <h3>Протокол ходов:</h3>
            <ul>
                {moveLog.map((move, index) => (
                    <li key={index}>
                        {index % 2 === 0 ? `${index / 2 + 1}. ${move}` : `... ${move}`}
                    </li>
                ))}
            </ul>
        </div>
        </div>
    );
}

export default ChessBoard;
