import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET /api/categories — List semua kategori
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { urutan: 'asc' }
    })
    res.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/categories — Tambah kategori
router.post('/', async (req, res) => {
  try {
    const { nama, urutan } = req.body
    const category = await prisma.category.create({
      data: { nama, urutan: urutan || 0 }
    })
    res.status(201).json(category)
  } catch (error) {
    console.error('Create category error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
