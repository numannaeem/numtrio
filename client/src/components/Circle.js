import { Box } from '@mui/material'
import React from 'react'
import { useState } from 'react'

function Circle({ piece, idx, onPieceClick, color, innerCircles, yourTurn, setActiveSize }) {
  const sizes = {
    1: 25,
    2: 55,
    3: 80
  }

  const [circleBeingDragged, setCircleBeingDragged] = useState(false)

  return (
    <Box
      draggable={yourTurn && color !== '#ccc'}
      onDragStart={(e) => {
        e.dataTransfer.setData('pieceIndex', idx)
        setCircleBeingDragged(true)
        setActiveSize(piece.size)
        onPieceClick(idx)
        const svg = e.currentTarget.querySelector('svg')
        if (svg) {
          const clone = svg.cloneNode(true)
          clone.style.position = 'absolute'
          clone.style.top = '-1000px'
          document.body.appendChild(clone)
          e.dataTransfer.setDragImage(
            clone,
            clone.width.baseVal.value / 2,
            clone.height.baseVal.value / 2
          )
          setTimeout(() => document.body.removeChild(clone), 0)
        }
      }}
      onDragEnd={() => setCircleBeingDragged(false)}
      display="inline-block"
      sx={{ width: sizes[piece.size], height: sizes[piece.size], p: 0, m: 0 }}
    >
      <svg
        width={sizes[piece.size]}
        height={sizes[piece.size]}
        style={{ display: circleBeingDragged ? 'none' : 'block' }}
        onClick={() => yourTurn && onPieceClick && onPieceClick(idx)}
        className={`game-piece ${yourTurn && 'active'}`}
      >
        <circle
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
    </Box>
  )
}

export default Circle
