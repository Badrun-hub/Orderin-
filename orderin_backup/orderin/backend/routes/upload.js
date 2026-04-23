import { Router } from 'express'
import multer from 'multer'
import { existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const router = Router()

// Dynamic storage configuration based on :folder param
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.params.folder || 'general'
    const uploadPath = join(__dirname, '..', 'uploads', folder)

    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true })
    }

    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = file.originalname.split('.').pop()
    cb(null, `${uniqueSuffix}.${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Hanya file gambar yang diizinkan'), false)
    }
  }
})

// POST /api/upload/:folder — Upload single file
router.post('/:folder', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah' })
    }

    const folder = req.params.folder
    const host = req.get('host')
    const protocol = req.protocol
    const publicUrl = `${protocol}://${host}/uploads/${folder}/${req.file.filename}`

    res.json({
      success: true,
      url: publicUrl,
      filename: req.file.filename
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Gagal mengunggah file' })
  }
})

export default router
