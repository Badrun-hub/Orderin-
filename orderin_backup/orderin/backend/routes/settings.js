import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET /api/settings — Ambil settings (ambil record pertama)
router.get('/', async (req, res) => {
  try {
    let settings = await prisma.settings.findFirst()
    if (!settings) {
      settings = await prisma.settings.create({
        data: { nama_cafe: 'Orderin Cafe', primaryColor: '#10B981', theme: 'dark' }
      })
    }
    res.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/settings — Update settings
router.put('/', async (req, res) => {
  try {
    const { nama_cafe, logo_url, primary_color, theme } = req.body

    let current = await prisma.settings.findFirst()
    if (!current) {
      current = await prisma.settings.create({
        data: { nama_cafe: 'Orderin Cafe' }
      })
    }

    const updated = await prisma.settings.update({
      where: { id: current.id },
      data: {
        nama_cafe: nama_cafe || undefined,
        logo_url,
        primaryColor: primary_color || undefined,
        theme: theme || undefined
      }
    })

    res.json(updated)
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
