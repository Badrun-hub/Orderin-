import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET /api/tables — List semua meja
router.get('/', async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { nomor_meja: 'asc' }
    })
    res.json(tables)
  } catch (error) {
    console.error('Get tables error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/tables/find?lokasi=X&nomor_meja=Y — Cari meja spesifik
router.get('/find', async (req, res) => {
  try {
    const { lokasi, nomor_meja } = req.query

    const table = await prisma.table.findFirst({
      where: {
        lokasi: lokasi ? decodeURIComponent(lokasi) : undefined,
        nomor_meja: nomor_meja || undefined
      }
    })

    if (!table) {
      return res.status(404).json({ error: 'Meja tidak ditemukan' })
    }
    res.json(table)
  } catch (error) {
    console.error('Find table error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/tables — Tambah meja
router.post('/', async (req, res) => {
  try {
    const { nomor_meja, lokasi, status } = req.body
    const table = await prisma.table.create({
      data: {
        nomor_meja,
        lokasi: lokasi || 'Lantai 1',
        status: status || 'available'
      }
    })

    // Emit socket event
    const io = req.app.get('io')
    io.emit('table_updated', table)

    res.status(201).json(table)
  } catch (error) {
    console.error('Create table error:', error)
    res.status(500).json({ error: error.message || 'Server error' })
  }
})

// PUT /api/tables/:id — Update meja
router.put('/:id', async (req, res) => {
  try {
    const { status, nomor_meja, lokasi, qr_code_url } = req.body
    const table = await prisma.table.update({
      where: { id: req.params.id },
      data: {
        status,
        nomor_meja,
        lokasi,
        qr_code_url
      }
    })

    // Emit socket event
    const io = req.app.get('io')
    io.emit('table_updated', table)

    res.json(table)
  } catch (error) {
    console.error('Update table error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/tables/:id — Hapus meja
router.delete('/:id', async (req, res) => {
  try {
    await prisma.table.delete({ where: { id: req.params.id } })

    const io = req.app.get('io')
    io.emit('table_updated', { id: req.params.id, deleted: true })

    res.json({ success: true })
  } catch (error) {
    console.error('Delete table error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
