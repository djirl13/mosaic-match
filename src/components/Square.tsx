import React from 'react';
import { useDrag, useDrop } from 'react-dnd';

interface SquareProps {
  id: number;
  index: number;
  color: string;
  moveSquare: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  id: number;
  index: number;
  type: string;
}

const Square: React.FC<SquareProps> = ({ id, index, color, moveSquare }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'SQUARE',
    item: { id, index, type: 'SQUARE' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'SQUARE',
    hover: (item: DragItem) => {
      if (item.index === index) {
        return;
      }
      moveSquare(item.index, index);
      item.index = index;
    },
  });

  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      className="w-full h-full rounded-lg shadow-md transition-all duration-200 cursor-move"
      style={{
        backgroundColor: color,
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isDragging 
          ? '0 5px 15px rgba(0,0,0,0.3)' 
          : '0 2px 5px rgba(0,0,0,0.1)',
      }}
    />
  );
};

export default Square; 