import React, { useEffect, useState } from 'react'
import { CircularProgress, Stack, Typography, Box, Button, ThemeProvider } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import ReplayIcon from '@mui/icons-material/Replay'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import baseUrl from '../baseUrl'
import { orange, grey } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'
import GamePieces from './GamePieces'
import Circle from './Circle'

function GameComponent() {
  const params = useParams()
  const navigate = useNavigate()

  const theme = createTheme({
    palette: {
      primary: {
        main: orange[600]
      }
    }
  })

  const { roomName } = params
  const [gameState, setGameState] = useState(Array(9).fill(''))
  const [waiting, setWaiting] = useState(true)
  const [playerLeft, setPlayerLeft] = useState(false)
  const [waitingRestart, setWaitingRestart] = useState(false)
  const [yourTurn, setYourTurn] = useState()
  const [yourChar, setYourChar] = useState(null)
  const [winnerText, setWinnerText] = useState(null)
  // const [winningPos, setWinningPos] = useState([])
  const [socket, setSocket] = useState(null)
  const [pieces, setPieces] = useState([])
  const [activeSize, setActiveSize] = useState(0)

  useEffect(() => {
    const newSocket = io(baseUrl, {
      transports: ['websocket', 'polling', 'flashsocket'],
      query: {
        roomName
      }
    })
    setSocket(newSocket)

    return () => newSocket.close()
  }, [roomName])

  useEffect(() => {
    if (socket) {
      socket.on('init-game', (data) => {
        // setWinningPos([])
        setWaitingRestart(false)
        setPlayerLeft(false)
        setWinnerText(null)
        setGameState(Array(9).fill(''))
        setWaiting(false)
        if (data.x === socket.id) {
          setYourChar('x')
          setYourTurn(true)
        } else {
          setYourTurn(false)
          setYourChar('o')
        }
        setPieces([
          ...Array(3).fill({ size: '1', active: false }),
          ...Array(2).fill({ size: '2', active: false }),
          ...Array(1).fill({ size: '3', active: false })
        ])
        setActiveSize(0)
      })
      socket.on('player-left', () => {
        setPlayerLeft(true)
      })
      socket.on('next-turn', (data) => {
        setGameState(data.gameState)
        if (data.nextPlayer === socket.id) {
          setYourTurn(true)
          let minSizeOnBoard = Math.min(...data.gameState.map((piece) => parseInt(piece[0])))
          let myMaxSize = Math.max(...pieces.map((piece) => piece.size))
          if (minSizeOnBoard >= myMaxSize) {
            // game is a draw
            socket.emit('played', data.gameState, 'd', [])
            setWinnerText("It's a draw 😕")
          }
        }
      })
      socket.on('game-over', (data) => {
        if (data.winner === 'd') {
          setWinnerText("It's a draw 😕")
          setGameState(data.finalState)
        } else if (data.winner !== socket.id) {
          // setWinningPos(data.winningPosition)
          setGameState(data.finalState)
          setWinnerText('Opponent wins 😔')
        }
      })
    }
  }, [socket, yourChar])

  const handleClick = (i) => {
    if (!yourTurn || !activeSize) return
    let newState = gameState
    newState[i] = `${activeSize}${yourChar}` + newState[i]
    setYourTurn(false)
    setPieces((pieces) => pieces.filter((piece, idx) => !piece.active))
    setActiveSize(0)
    setGameState(newState)
    let gameWinner = null
    let position = []
    let winningPositions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ]
    for (let i = 0; i < 8; i++) {
      position = winningPositions[i]
      let a = gameState[position[0]]
      let b = gameState[position[1]]
      let c = gameState[position[2]]
      if (a === '' || b === '' || c === '') continue
      if (a[1] === b[1] && b[1] === c[1]) {
        gameWinner = yourChar
        // setWinningPos(position)
        break
      }
    }
    socket.emit('played', newState, gameWinner, position)
    if (!gameWinner) return
    setWinnerText(gameWinner === 'd' ? "It's a draw 😕" : 'You win! 🎉')
  }

  const onPieceClick = (i) => {
    setPieces((pieces) =>
      pieces.map((piece, idx) =>
        idx === i ? { ...piece, active: !piece.active } : { ...piece, active: false }
      )
    )
  }
  useEffect(() => {
    // Find the active piece and set its size
    const active = pieces.find((p) => p.active)
    setActiveSize(active ? active.size : 0)
  }, [pieces])

  const restartGame = () => {
    setWaitingRestart(true)
    socket.emit('restart-game')
  }

  const drawCircles = (a, i) => {
    let circles = a.match(/.{1,2}/g)
    let sizes = a.replace(/[x|o]/g, '').split('')
    let all_circles = '3g2g1g'.match(/.{1,2}/g)
    for (let size = 1; size <= 3; size++) {
      if (sizes.includes(size.toString())) {
        all_circles[3 - size] = `${size}${circles.find((c) => c[0] === `${size}`)[1]}`
      }
    }
    circles = all_circles
    return (
      <Circle
        piece={{ size: circles[0][0], active: false }}
        idx={i}
        color={circles[0][1] == 'x' ? 'red' : circles[0][1] == 'o' ? 'blue' : '#aaa6'}
        innerCircles={circles.slice(1).map((piece, idx) => ({
          size: piece[0],
          color: piece[1] == 'x' ? 'red' : piece[1] == 'o' ? 'blue' : '#aaa6'
        }))}
      />
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        bgcolor={orange[50]}
        minHeight="100vh"
        minWidth="100vw"
        alignItems="center"
        justifyContent="center"
        display="flex"
      >
        {playerLeft ? (
          <Stack spacing={2} alignItems="center" justifyContent="center">
            <Typography variant="h5" textAlign="center" color={orange[900]}>
              Uh-oh! Opponent has lost connection 😐
            </Typography>
            <Typography textAlign="center" color={grey[700]} variant="subtitle1">
              waiting for them to rejoin
            </Typography>
            <CircularProgress thickness={2} />
            <Button variant="outlined" size="small" onClick={() => navigate('/')}>
              Go back to menu
            </Button>
          </Stack>
        ) : waiting ? (
          <Stack spacing={2} alignItems="center" justifyContent="center">
            <Typography variant="h5" textAlign="center">
              Waiting for other player to join
            </Typography>
            <CircularProgress thickness={2} />
          </Stack>
        ) : (
          <Stack spacing={3} alignItems="center" justifyContent="center">
            <Typography color="orangered" variant="h4">
              {winnerText || (yourTurn ? 'Your turn' : "Opponent's turn")}
            </Typography>
            <Box sx={{ boxShadow: 15 }} className="game-board">
              {gameState.map((a, i) => (
                <div
                  key={i}
                  onClick={() => handleClick(i)}
                  className={`inner-box ${activeSize && `active`} ${
                    a[0] >= activeSize && 'occupied'
                  } ${a[1]} ${!gameState.includes('') && 'bg-yellow'}`}
                >
                  {a ? (
                    drawCircles(a, i)
                  ) : (
                    <Circle
                      piece={{ size: 3, active: false }}
                      idx={i}
                      color={'#ccc'}
                      innerCircles={[
                        { size: 2, color: '#ccc' },
                        { size: 1, color: '#ccc' }
                      ]}
                    />
                  )}
                </div>
              ))}
            </Box>
            {!winnerText && pieces.length > 0 && (
              <Stack
                sx={{ boxShadow: 2 }}
                gap={1}
                className="pieces-board"
                alignItems="center"
                justifyContent="center"
              >
                <GamePieces
                  pieces={pieces}
                  onPieceClick={onPieceClick}
                  yourChar={yourChar}
                  yourTurn={yourTurn}
                />
                <Typography variant="subtitle3" color="grey.800">
                  Select a circle and click on the board to place it
                </Typography>
              </Stack>
            )}
            {winnerText ? (
              <LoadingButton
                onClick={restartGame}
                loading={waitingRestart}
                startIcon={<ReplayIcon />}
                loadingPosition="start"
                variant="contained"
                style={{ marginTop: '40px' }}
              >
                {!waitingRestart ? 'Play Again' : 'Waiting for other player'}
              </LoadingButton>
            ) : (
              <div style={{ height: '36.5px' }}></div>
            )}
          </Stack>
        )}
      </Box>
    </ThemeProvider>
  )
}

export default GameComponent
