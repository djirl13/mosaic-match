import React, { useState } from 'react';
import Square from './Square';

interface SquareType {
  id: number;
  color: string;
}

const Grid: React.FC = () => {
  const [squares, setSquares] = useState<SquareType[]>([
    { id: 1, color: '#FF5733' },
    { id: 2, color: '#33FF57' },
    { id: 3, color: '#3357FF' },
    { id: 4, color: '#FF33F5' },
    { id: 5, color: '#33FFF5' },
    { id: 6, color: '#F5FF33' },
    { id: 7, color: '#FF3333' },
    { id: 8, color: '#33FF33' },
    { id: 9, color: '#3333FF' },
  ]);

  const moveSquare = (dragIndex: number, hoverIndex: number) => {
    const newSquares = [...squares];
    const draggedSquare = newSquares[dragIndex];
    newSquares.splice(dragIndex, 1);
    newSquares.splice(hoverIndex, 0, draggedSquare);
    setSquares(newSquares);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="grid grid-cols-3 gap-4 w-[300px] h-[300px]">
        {squares.map((square, index) => (
          <Square
            key={square.id}
            id={square.id}
            index={index}
            color={square.color}
            moveSquare={moveSquare}
          />
        ))}
      </div>
    </div>
  );
};

export default Grid; 