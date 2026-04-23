import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET /api/shifts — List semua shift
router.get('/', async (req, res) => {
  try {
    const shifts = await prisma.shift.findMany({
      include: { kasir: true },
      orderBy: { clock_in: 'desc' }
    })
    res.json(shifts)
  } catch (error) {
    console.error('Get shifts error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/shifts — Create shift
router.post('/', async (req, res) => {
  try {
    const { kasir_id } = req.body
    const shift = await prisma.shift.create({
      data: { kasirId: kasir_id }
    })
    res.status(201).json(shift)
  } catch (error) {
    console.error('Create shift error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/shifts/:id — Update shift (clock out, totals)
router.put('/:id', async (req, res) => {
  try {
    const { clock_out, total_order, total_revenue } = req.body
    const shift = await prisma.shift.update({
      where: { id: req.params.id },
      data: { clock_out, total_order, total_revenue }
    })
    res.json(shift)
  } catch (error) {
    console.error('Update shift error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
