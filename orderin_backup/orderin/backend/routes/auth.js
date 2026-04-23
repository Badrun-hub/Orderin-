import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const router = Router()
const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'orderin-secret-key-2026'

// Middleware: Authenticate JWT Token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ error: 'Token tidak ditemukan' })

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token tidak valid' })
    req.user = user
    next()
  })
}

// POST /api/auth/login-pin — Login Kasir/Admin via PIN
router.post('/login-pin', async (req, res) => {
  try {
    const { pin } = req.body

    if (!pin) return res.status(400).json({ error: 'PIN diperlukan' })

    const profile = await prisma.profile.findUnique({
      where: { pin: pin }
    })

    if (!profile) {
      return res.status(401).json({ error: 'PIN tidak ditemukan' })
    }

    if (!profile.is_active) {
      return res.status(403).json({ error: 'Akun telah dinonaktifkan' })
    }

    const token = jwt.sign(
      { id: profile.id, nama: profile.nama, role: profile.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: profile.id,
        name: profile.nama,
        role: profile.role
      }
    })
  } catch (error) {
    console.error('Login PIN error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/auth/login-admin — Login Admin via email + password
router.post('/login-admin', async (req, res) => {
  try {
    const { email, password } = req.body

    // Check against admin profile in database
    // For MVP: validate against hardcoded + DB
    const adminProfile = await prisma.profile.findFirst({
      where: { role: 'admin', is_active: true }
    })

    // MVP validation: email=admin@orderin.com, password=admin123
    // OR PIN-based from database
    if (
      (email === 'admin@orderin.com' && password === 'admin123') ||
      (adminProfile && adminProfile.pin === password)
    ) {
      const user = adminProfile || { id: 'admin-default', nama: 'Admin', role: 'admin' }
      
      const token = jwt.sign(
        { id: user.id, nama: user.nama, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      )

      res.json({
        token,
        user: {
          id: user.id,
          name: user.nama,
          role: user.role
        }
      })
    } else {
      res.status(401).json({ error: 'Kredensial tidak valid' })
    }
  } catch (error) {
    console.error('Login Admin error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/auth/me — Verify token
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user })
})

export default router
