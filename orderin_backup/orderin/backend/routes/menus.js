import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET /api/menus — List semua menu (with category relation)
router.get('/', async (req, res) => {
  try {
    const where = {}
    if (req.query.available === 'true') {
      where.is_available = true
    }

    const menus = await prisma.menu.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    })

    // Map category to match frontend expectation: menu.categories.nama
    const mapped = menus.map(m => ({
      ...m,
      categories: m.category ? { id: m.category.id, nama: m.category.nama } : null
    }))

    res.json(mapped)
  } catch (error) {
    console.error('Get menus error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/menus — Tambah menu
router.post('/', async (req, res) => {
  try {
    const { nama, category_id, harga, deskripsi, foto_url, is_available } = req.body
    const menu = await prisma.menu.create({
      data: {
        nama,
        categoryId: category_id || null,
        harga: Number(harga) || 0,
        deskripsi: deskripsi || null,
        foto_url: foto_url || null,
        is_available: is_available !== false
      },
      include: { category: true }
    })
    res.status(201).json(menu)
  } catch (error) {
    console.error('Create menu error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/menus/:id — Update menu
router.put('/:id', async (req, res) => {
  try {
    const { nama, category_id, harga, deskripsi, foto_url, is_available } = req.body
    const menu = await prisma.menu.update({
      where: { id: req.params.id },
      data: {
        nama,
        categoryId: category_id || undefined,
        harga: harga !== undefined ? Number(harga) : undefined,
        deskripsi,
        foto_url,
        is_available
      },
      include: { category: true }
    })
    res.json(menu)
  } catch (error) {
    console.error('Update menu error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /api/menus/:id/toggle — Toggle availability
router.patch('/:id/toggle', async (req, res) => {
  try {
    const menu = await prisma.menu.findUnique({ where: { id: req.params.id } })
    if (!menu) return res.status(404).json({ error: 'Menu tidak ditemukan' })

    const updated = await prisma.menu.update({
      where: { id: req.params.id },
      data: { is_available: !menu.is_available }
    })
    res.json(updated)
  } catch (error) {
    console.error('Toggle menu error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/menus/:id — Hapus menu
router.delete('/:id', async (req, res) => {
  try {
    await prisma.menu.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (error) {
    console.error('Delete menu error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
