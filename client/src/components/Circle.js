import React from 'react'

function Circle({ piece, idx, onPieceClick, color, innerCircles, yourTurn }) {
  const sizes = {
    1: 20,
    2: 50,
    3: 80
  }
  return (
    <svg
      key={idx}
      width={sizes[piece.size]}
      height={sizes[piece.size]}
      onClick={() => yourTurn && onPieceClick && onPieceClick(idx)}
    >
      <circle
        className={`game-piece ${yourTurn && 'active'}`}
        cx={sizes[piece.size] / 2}
        cy={sizes[piece.size] / 2}
        r={sizes[piece.size] / 2 - 2}
        fill={'transparent'}
        stroke={color}
        strokeWidth={piece.active ? '4' : '2'}
      />
      {innerCircles
        ? innerCircles.map((innerCircle, i) => (
            <circle
              className={`game-piece`}
              style={{ position: 'absolute' }}
              key={i}
              cx={sizes[piece.size] / 2}
              cy={sizes[piece.size] / 2}
              r={sizes[innerCircle.size] / 2 - 2}
              fill={'transparent'}
              stroke={innerCircle.color}
              strokeWidth={'2'}
            />
          ))
        : null}
    </svg>
  )
}

export default Circle
