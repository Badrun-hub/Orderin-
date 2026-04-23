import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000'

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10
})

socket.on('connect', () => {
  console.log('🔌 Socket.io connected:', socket.id)
})

socket.on('disconnect', () => {
  console.log('❌ Socket.io disconnected')
})

export default socket
