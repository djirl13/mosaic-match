import React from 'react'
import { useDrag, useDrop } from 'react-dnd'

interface TileProps {
  id: number
  index: number
  color: string
  rotation: number
  moveTile: (dragIndex: number, hoverIndex: number) => void
  onRotate: () => void
}

interface DragItem {
  id: number
  index: number
  type: string
}

const Tile: React.FC<TileProps> = ({ id, index, color, rotation, moveTile, onRotate }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'tile',
    item: { id, index, type: 'tile' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'tile',
    drop: (item: DragItem) => {
      if (item.index === index) {
        return
      }
      moveTile(item.index, index)
    },
  })

  const dragDropRef = (element: HTMLDivElement | null) => {
    drag(drop(element))
  }

  // Function to determine color based on tile ID and position
  const getSquareColor = (position: number) => {
    // Convert position to 1-based index to match the requirements
    const squareNumber = position + 1
    
    // Define colors with vibrant but not fully saturated variants
    const red = '#FF8080'      // Vibrant coral red
    const blue = '#6666FF'     // Vibrant medium blue
    const orange = '#FFA366'   // Vibrant warm orange
    const green = '#66FF66'    // Vibrant lime green
    const white = '#FFFFFF'     // White stays the same
    
    // Color mapping for each tile and square
    const colorMap: { [key: number]: { [key: number]: string } } = {
      1: { 2: red, 4: blue, 6: orange, 8: green },
      2: { 2: red, 4: orange, 6: green, 8: blue },
      3: { 2: red, 4: green, 6: orange, 8: green },
      4: { 2: green, 4: orange, 6: red, 8: blue },
      5: { 2: blue, 4: red, 6: orange, 8: red },
      6: { 2: green, 4: orange, 6: blue, 8: orange },
      7: { 2: blue, 4: red, 6: green, 8: orange },
      8: { 2: red, 4: green, 6: blue, 8: green },
      9: { 2: orange, 4: blue, 6: red, 8: blue }
    }

    // Return the specified color if it exists in the map, otherwise use default logic
    if (colorMap[id]?.[squareNumber]) {
      return colorMap[id][squareNumber]
    }

    // Default color logic for unspecified squares
    return position === 0 || position === 2 || position === 6 || position === 8 || position === 4
      ? white
      : color
  }

  // Function to get rotated position
  const getRotatedPosition = (position: number, rotation: number) => {
    const size = 3
    const x = position % size
    const y = Math.floor(position / size)
    
    // Convert rotation to number of 90-degree turns
    const turns = Math.floor((rotation % 360) / 90)
    
    let newX = x
    let newY = y
    
    for (let i = 0; i < turns; i++) {
      const tempX = newX
      newX = (size - 1) - newY
      newY = tempX
    }
    
    return newY * size + newX
  }

  // Function to determine text color based on background color
  const getTextColor = (backgroundColor: string) => {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Return white for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  const handleClick = (e: React.MouseEvent) => {
    // Only rotate if it's a click (not a drag)
    if (!isDragging) {
      onRotate()
    }
  }

  return (
    <div
      ref={dragDropRef}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        backgroundColor: '#000',
        border: '2px solid #000',
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.3s ease',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: window.innerWidth < 640 ? '1px' : '2px',
        padding: window.innerWidth < 640 ? '1px' : '2px',
        touchAction: 'none'
      }}
      onClick={onRotate}
    >
      {/* Render the 3x3 grid of squares */}
      {Array.from({ length: 9 }).map((_, i) => {
        const row = Math.floor(i / 3)
        const col = i % 3
        const isCenter = row === 1 && col === 1
        const isCorner = (row === 0 || row === 2) && (col === 0 || col === 2)
        const squareColor = getSquareColor(i)
        
        return (
          <div
            key={i}
            style={{
              width: '100%',
              aspectRatio: '1',
              backgroundColor: squareColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              touchAction: 'none'
            }}
          />
        )
      })}
    </div>
  )
}

export default Tile 