import React from 'react'
import Circle from './Circle'

function GamePieces({ pieces, onPieceClick, yourChar, yourTurn }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '9px',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        maxWidth: '80vw'
      }}
    >
      {pieces.map((piece, i) => (
        <Circle
          piece={piece}
          idx={i}
          onPieceClick={onPieceClick}
          color={yourChar == 'x' ? 'red' : 'blue'}
          yourTurn={yourTurn}
        />
      ))}
    </div>
  )
}

export default GamePieces
