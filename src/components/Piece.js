// src/components/Piece.jsx
import React from 'react';
import './Piece.css';

const Piece = ({ type, color }) => {
    // Путь к изображению на основе цвета и типа фигуры
    const imagePath = `${process.env.PUBLIC_URL}/images/${color}_${type}.png`;

    return (
        <div className="piece">
            <img src={imagePath} alt={`${color} ${type}`} />
        </div>
    );
};

export default Piece;
