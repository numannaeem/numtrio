import React from 'react'
import Circle from './Circle'

function GamePieces({ pieces, onPieceClick, yourChar, yourTurn, setActiveSize, setPieces }) {
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
        <div key={i}>
          <Circle
            piece={piece}
            setPieces={setPieces}
            idx={i}
            setActiveSize={setActiveSize}
            onPieceClick={onPieceClick}
            color={yourChar == 'x' ? 'red' : 'blue'}
            yourTurn={yourTurn}
          />
        </div>
      ))}
    </div>
  )
}

export default GamePieces
