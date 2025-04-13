import { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Tile from './components/Tile'
import tileMatchingImage from './assets/tile-matching.svg'

interface TileType {
  id: number
  color: string
  rotation: number
}

interface HistoryEntry {
  tiles: TileType[]
  moveCount: number
}

function App() {
  // Solution state - don't modify this
  const solutionTiles: TileType[] = [
    { id: 1, color: '#FF5733', rotation: 0 },
    { id: 2, color: '#33FF57', rotation: 0 },
    { id: 3, color: '#3357FF', rotation: 0 },
    { id: 4, color: '#FF33F5', rotation: 0 },
    { id: 5, color: '#33FFF5', rotation: 0 },
    { id: 6, color: '#F5FF33', rotation: 0 },
    { id: 7, color: '#FF3333', rotation: 0 },
    { id: 8, color: '#33FF33', rotation: 0 },
    { id: 9, color: '#3333FF', rotation: 0 },
  ]

  // Function to shuffle array (Fisher-Yates algorithm)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  // Function to get random rotation (0, 90, 180, or 270 degrees)
  const getRandomRotation = (): number => {
    return Math.floor(Math.random() * 4) * 90
  }

  // Function to create initial randomized state
  const getRandomizedTiles = (): TileType[] => {
    const shuffledTiles = shuffleArray([...solutionTiles])
    return shuffledTiles.map(tile => ({
      ...tile,
      rotation: getRandomRotation()
    }))
  }

  const [tiles, setTiles] = useState<TileType[]>(getRandomizedTiles())
  const [moveCount, setMoveCount] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([{ tiles: [...tiles], moveCount: 0 }])
  const [canUndo, setCanUndo] = useState(false)
  const [isSolved, setIsSolved] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(false)

  // Function to normalize rotation to 0-359 degrees
  const normalizeRotation = (rotation: number): number => {
    return ((rotation % 360) + 360) % 360
  }

  // Check if puzzle is solved
  const checkSolution = () => {
    console.log('Checking solution...');
    const result = tiles.every((tile, index) => {
      const solutionTile = solutionTiles[index]
      const tileRotation = normalizeRotation(tile.rotation)
      const solutionRotation = normalizeRotation(solutionTile.rotation)
      console.log(`Tile ${index + 1}:`, {
        position: `Current ID: ${tile.id}, Expected ID: ${solutionTile.id}`,
        rotation: `Current: ${tileRotation}°, Expected: ${solutionRotation}°`,
        matches: tile.id === solutionTile.id && tileRotation === solutionRotation
      });
      return tile.id === solutionTile.id && tileRotation === solutionRotation
    })
    console.log('Puzzle solved?', result);
    return result;
  }

  // Check solution whenever tiles change
  useEffect(() => {
    console.log('Tiles or moves changed. Move count:', moveCount);
    if (moveCount > 0) {  // Only check after first move
      const solved = checkSolution()
      console.log('Setting isSolved to:', solved);
      setIsSolved(solved)
      if (solved) {
        setCanUndo(false)  // Hide undo button when solved
      }
    }
  }, [tiles, moveCount])  // Also watch moveCount to ensure we don't miss any checks

  // Check if it's the first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedMosaicMatch')
    if (!hasVisited) {
      setShowRules(true)
      setIsFirstVisit(true)
      localStorage.setItem('hasVisitedMosaicMatch', 'true')
    }
  }, [])

  const moveTile = (dragIndex: number, hoverIndex: number) => {
    const newTiles = [...tiles]
    const temp = newTiles[dragIndex]
    newTiles[dragIndex] = newTiles[hoverIndex]
    newTiles[hoverIndex] = temp
    setTiles(newTiles)
    const newMoveCount = moveCount + 1
    setMoveCount(newMoveCount)
    setHistory([...history, { tiles: newTiles, moveCount: newMoveCount }])
    setCanUndo(true)
  }

  const rotateTile = (index: number) => {
    const newTiles = [...tiles]
    const currentRotation = newTiles[index].rotation
    // Instead of using modulo, we'll increment the rotation continuously
    const newRotation = currentRotation + 90
    newTiles[index] = {
      ...newTiles[index],
      rotation: newRotation
    }
    setTiles(newTiles)
    const newMoveCount = moveCount + 1
    setMoveCount(newMoveCount)
    setHistory([...history, { tiles: newTiles, moveCount: newMoveCount }])
    setCanUndo(true)
  }

  const undoMove = () => {
    if (history.length > 1) {
      const previousState = history[history.length - 2]
      setTiles(previousState.tiles)
      const newMoveCount = moveCount + 1
      setMoveCount(newMoveCount)
      setHistory([history[0], { tiles: previousState.tiles, moveCount: newMoveCount }])
      setCanUndo(false)
    }
  }

  const resetGame = () => {
    const newTiles = getRandomizedTiles()
    setTiles(newTiles)
    setMoveCount(0)
    setHistory([{ tiles: newTiles, moveCount: 0 }])
    setCanUndo(false)
    setIsSolved(false)
  }

  const handleNewGameClick = () => {
    if (moveCount > 0) {
      setShowResetConfirm(true)
    } else {
      resetGame()
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Navigation Banner */}
        <nav style={{
          padding: '12px 16px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h1 style={{
            fontSize: window.innerWidth < 640 ? '20px' : '24px',
            fontWeight: 'bold',
            color: '#1a202c'
          }}>
            Mosaic Match
          </h1>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button style={{
              background: 'none',
              border: 'none',
              fontSize: window.innerWidth < 640 ? '14px' : '16px',
              color: '#718096',
              cursor: 'pointer',
              padding: '8px 12px'
            }}
            onClick={() => setShowRules(true)}>
              Rules
            </button>
            <button style={{
              backgroundColor: '#4c6ef5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: window.innerWidth < 640 ? '6px 12px' : '8px 24px',
              fontSize: window.innerWidth < 640 ? '14px' : '16px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onClick={handleNewGameClick}>
              New Game
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: window.innerWidth < 640 ? '12px' : '20px',
          gap: '16px'
        }}>
          {isSolved && (
            <div style={{
              padding: '8px 16px',
              fontSize: window.innerWidth < 640 ? '16px' : '18px',
              fontWeight: 'bold',
              backgroundColor: '#FFD700',
              color: '#000',
              borderRadius: '4px',
              animation: 'fadeIn 0.5s',
              marginBottom: '16px',
              width: '100%',
              maxWidth: window.innerWidth < 640 ? '300px' : '450px',
              textAlign: 'center'
            }}>
              🎉 Puzzle Solved! 🎉
            </div>
          )}
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center',
            width: '100%',
            maxWidth: window.innerWidth < 640 ? '300px' : '450px'
          }}>
            {window.innerWidth < 640 && (
              <div style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#E8F5E9',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#2E7D32',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <span style={{ fontSize: '16px' }}>💡</span>
                <span>Long press and hold tiles to drag and drop</span>
              </div>
            )}
            {/* Grid */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: window.innerWidth < 640 ? '8px' : '12px',
              aspectRatio: '1',
              width: '100%',
              padding: window.innerWidth < 640 ? '12px' : '24px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {tiles.map((tile, index) => (
                <Tile
                  key={tile.id}
                  id={tile.id}
                  index={index}
                  color={tile.color}
                  rotation={tile.rotation}
                  moveTile={moveTile}
                  onRotate={() => rotateTile(index)}
                />
              ))}
            </div>

            {/* Controls */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '12px',
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ 
                fontSize: window.innerWidth < 640 ? '16px' : '18px',
                fontWeight: 'bold',
                color: '#666'
              }}>
                Moves: {moveCount}
              </div>
              {canUndo && !isSolved && (
                <button
                  onClick={undoMove}
                  style={{
                    padding: '4px 12px',
                    fontSize: '14px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '80px'
                  }}
                >
                  ↩ Undo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Rules Modal */}
        {showRules && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              padding: '16px'
            }}
            onClick={() => {
              setShowRules(false)
              setIsFirstVisit(false)
            }}
          >
            <div 
              style={{
                backgroundColor: 'white',
                padding: window.innerWidth < 640 ? '16px' : '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowRules(false)
                  setIsFirstVisit(false)
                }}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '20px',
                color: '#2d3748'
              }}>
                {isFirstVisit ? 'Welcome New Player!' : 'How to Play'}
              </h2>
              <div style={{
                color: '#4a5568',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  color: '#2d3748'
                }}>
                  Game Objective
                </h3>
                <p style={{marginBottom: '16px'}}>
                  Arrange the colored tiles so that all adjacent edges match in color, creating a harmonious mosaic pattern.
                </p>

                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  color: '#2d3748'
                }}>
                  Game Controls
                </h3>
                <ul style={{
                  paddingLeft: '20px',
                  marginBottom: '16px'
                }}>
                  <li style={{marginBottom: '8px'}}>
                    <strong>Moving Tiles:</strong> Drag and drop tiles to swap their positions
                    {window.innerWidth < 640 && " (long press and hold on mobile)"}
                  </li>
                  <li style={{marginBottom: '8px'}}>
                    <strong>Rotating Tiles:</strong> Click/tap a tile to rotate it 90° clockwise
                  </li>
                  <li style={{marginBottom: '8px'}}>
                    <strong>Undo Move:</strong> Use the undo button to reverse your last move
                  </li>
                </ul>

                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  color: '#2d3748'
                }}>
                  How to Solve
                </h3>
                <ol style={{
                  paddingLeft: '20px',
                  marginBottom: '16px'
                }}>
                  <li style={{marginBottom: '8px'}}>Start by identifying tiles with matching colors on their edges</li>
                  <li style={{marginBottom: '8px'}}>Position tiles next to each other so their colored edges match</li>
                  <li style={{marginBottom: '8px'}}>Rotate tiles as needed to align the colors correctly</li>
                  <li style={{marginBottom: '8px'}}>Work systematically from one corner to complete the pattern</li>
                  <li style={{marginBottom: '8px'}}>Use the undo button if you make a mistake</li>
                </ol>

                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  color: '#2d3748'
                }}>
                  How Matching Works
                </h3>
                <div style={{
                  marginBottom: '16px',
                  padding: '16px',
                  backgroundColor: '#f7fafc',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <img 
                    src={tileMatchingImage} 
                    alt="Tile matching example showing two tiles with matching colored edges"
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      height: 'auto',
                      marginBottom: '8px'
                    }}
                  />
                  <p style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#4a5568'
                  }}>
                    Tiles match when their touching edges have the same color.
                    In this example, the red edge of the right tile matches with the red edge of the left tile.
                  </p>
                </div>

                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  color: '#2d3748'
                }}>
                  Tips
                </h3>
                <ul style={{
                  paddingLeft: '20px',
                  marginBottom: '16px'
                }}>
                  <li style={{marginBottom: '8px'}}>Look for unique color combinations to identify key tile positions</li>
                  <li style={{marginBottom: '8px'}}>Try to solve the corners and edges first</li>
                  <li style={{marginBottom: '8px'}}>Pay attention to both position and rotation of each tile</li>
                  <li style={{marginBottom: '8px'}}>The puzzle is solved when all adjacent edges match in color</li>
                </ul>

                {isFirstVisit && (
                  <div style={{
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <button
                      onClick={() => {
                        setShowRules(false)
                        setIsFirstVisit(false)
                        resetGame() // Reset the grid when starting the game
                      }}
                      style={{
                        padding: '12px 32px',
                        fontSize: '16px',
                        backgroundColor: '#4c6ef5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      Start Game
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              padding: '16px'
            }}
            onClick={() => setShowResetConfirm(false)}
          >
            <div 
              style={{
                backgroundColor: 'white',
                padding: window.innerWidth < 640 ? '16px' : '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                width: '90%',
                maxWidth: '400px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#2d3748'
              }}>
                Start New Game?
              </h2>
              <p style={{
                color: '#4a5568',
                fontSize: '16px',
                lineHeight: '1.5',
                marginBottom: '20px'
              }}>
                You've made {moveCount} moves. Are you sure you want to start a new game? Your current progress will be lost.
              </p>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: '#e2e8f0',
                    color: '#4a5568',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(false)
                    resetGame()
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: '#4c6ef5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Start New Game
                </button>
              </div>
            </div>
          </div>
        )}

        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}
        </style>
      </div>
    </DndProvider>
  )
}

export default App
