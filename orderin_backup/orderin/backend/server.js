import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Route imports
import authRoutes from './routes/auth.js'
import categoriesRoutes from './routes/categories.js'
import menusRoutes from './routes/menus.js'
import tablesRoutes from './routes/tables.js'
import ordersRoutes from './routes/orders.js'
import profilesRoutes from './routes/profiles.js'
import shiftsRoutes from './routes/shifts.js'
import settingsRoutes from './routes/settings.js'
import uploadRoutes from './routes/upload.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const httpServer = createServer(app)

// Socket.io Setup
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
})

// Make io accessible to routes
app.set('io', io)

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files for uploads
app.use('/uploads', express.static(join(__dirname, 'uploads')))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/menus', menusRoutes)
app.use('/api/tables', tablesRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/profiles', profilesRoutes)
app.use('/api/shifts', shiftsRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/upload', uploadRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Orderin Backend is running 🚀' })
})

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id)
  })
})

// Start Server
const PORT = process.env.PORT || 8000
httpServer.listen(PORT, () => {
  console.log(`\n🟢 Orderin Backend running on http://localhost:${PORT}`)
  console.log(`📡 Socket.io ready for realtime connections`)
  console.log(`📁 Uploads served from /uploads/\n`)
})
