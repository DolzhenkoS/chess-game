// src/components/ChessBoard.jsx
import React, { useState } from 'react';
import Piece from './Piece';
import { initializeBoard, isKingInCheck, isCheckmate, getValidMoves,Queen } from '../utils/chessLogic';
import './ChessBoard.css';

function ChessBoard() {
    const [board, setBoard] = useState(initializeBoard());
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [turn, setTurn] = useState("w"); // Начинает белый
    const [status, setStatus] = useState("");

    // const handleSquareClick = (x, y) => {
    //     const piece = board[x][y];

    //     if (selectedPiece) {
    //         const [startX, startY] = selectedPiece;
    //         const selectedPieceInstance = board[startX][startY];

    //         const validMoves = getValidMoves([startX, startY], selectedPieceInstance, board);
    //         if (validMoves.some(([vx, vy]) => vx === x && vy === y)) {
    //             const newBoard = board.map(row => row.slice());
    //             newBoard[x][y] = selectedPieceInstance;
    //             newBoard[startX][startY] = null;
    //             setBoard(newBoard);

    //             const nextTurn = turn === "w" ? "b" : "w";
    //             setTurn(nextTurn);

    //             // Проверка на шах и мат
    //             if (isKingInCheck(newBoard, nextTurn)) {
    //                 if (isCheckmate(newBoard, nextTurn)) {
    //                     setStatus(`Мат! Победа за ${turn === "w" ? "белыми" : "черными"}!`);
    //                 } else {
    //                     setStatus("Шах!");
    //                 }
    //             } else {
    //                 setStatus("");
    //             }
    //         }

    //         setSelectedPiece(null);
    //     } else {
    //         if (piece && piece.color === turn) {
    //             setSelectedPiece([x, y]);
    //         }
    //     }
    // };

    const handleSquareClick = (x, y) => {
        const piece = board[x][y];
    
        if (selectedPiece) {
            const [startX, startY] = selectedPiece;
            const selectedPieceInstance = board[startX][startY];
    
            const validMoves = getValidMoves([startX, startY], selectedPieceInstance, board);
            if (validMoves.some(([vx, vy]) => vx === x && vy === y)) {
                const newBoard = board.map(row => row.slice());
    
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
            <h2>{status}</h2>
            <div className="chess-board">
                {board.map((row, x) =>
                    row.map((piece, y) => renderSquare(piece, x, y))
                )}
            </div>
        </div>
    );
}

export default ChessBoard;
