import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET /api/profiles — List profiles (filterable by role)
router.get('/', async (req, res) => {
  try {
    const where = {}
    if (req.query.role) {
      where.role = req.query.role
    }

    const profiles = await prisma.profile.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    res.json(profiles)
  } catch (error) {
    console.error('Get profiles error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/profiles — Tambah profile (kasir)
router.post('/', async (req, res) => {
  try {
    const { nama, pin, role, is_active } = req.body
    const profile = await prisma.profile.create({
      data: {
        nama,
        pin: pin || null,
        role: role || 'kasir',
        is_active: is_active !== false
      }
    })
    res.status(201).json(profile)
  } catch (error) {
    console.error('Create profile error:', error)
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'PIN sudah digunakan oleh kasir lain' })
    } else {
      res.status(500).json({ error: error.message || 'Server error' })
    }
  }
})

// PUT /api/profiles/:id — Update profile
router.put('/:id', async (req, res) => {
  try {
    const { nama, pin, is_active } = req.body
    const data = {}
    if (nama !== undefined) data.nama = nama
    if (pin !== undefined) data.pin = pin
    if (is_active !== undefined) data.is_active = is_active

    const profile = await prisma.profile.update({
      where: { id: req.params.id },
      data
    })
    res.json(profile)
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/profiles/:id — Hapus profile
router.delete('/:id', async (req, res) => {
  try {
    await prisma.profile.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (error) {
    console.error('Delete profile error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
