import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET /api/orders — List all orders (with filters)
router.get('/', async (req, res) => {
  try {
    const where = {}

    // Filter: exclude finished/cancelled orders
    if (req.query.active === 'true') {
      where.status = { notIn: ['selesai', 'cancelled'] }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: true,
        table: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Map to match frontend: order.order_items, order.tables
    const mapped = orders.map(o => ({
      ...o,
      order_items: o.orderItems,
      tables: o.table ? { nomor_meja: o.table.nomor_meja, lokasi: o.table.lokasi } : null
    }))

    res.json(mapped)
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/orders/active — Active orders only
router.get('/active', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { notIn: ['selesai', 'cancelled'] }
      },
      include: {
        orderItems: true,
        table: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const mapped = orders.map(o => ({
      ...o,
      order_items: o.orderItems,
      tables: o.table ? { nomor_meja: o.table.nomor_meja, lokasi: o.table.lokasi } : null
    }))

    res.json(mapped)
  } catch (error) {
    console.error('Get active orders error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/orders/:id — Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        orderItems: true,
        table: true
      }
    })

    if (!order) return res.status(404).json({ error: 'Order tidak ditemukan' })

    res.json({
      ...order,
      order_items: order.orderItems,
      tables: order.table ? { nomor_meja: order.table.nomor_meja, lokasi: order.table.lokasi } : null
    })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/orders — Create new order + items
router.post('/', async (req, res) => {
  try {
    const { table_id, customer_name, status, payment_method, total, items } = req.body

    // Create order
    const order = await prisma.order.create({
      data: {
        tableId: table_id,
        customer_name,
        status: status || 'ordered',
        payment_method,
        total: total || 0
      }
    })

    // Create order items if provided
    if (items && items.length > 0) {
      await prisma.orderItem.createMany({
        data: items.map(item => ({
          orderId: order.id,
          menuId: item.menu_id || null,
          nama_menu: item.nama_menu,
          harga: item.harga,
          qty: item.qty,
          subtotal: item.subtotal || (item.harga * item.qty)
        }))
      })
    }

    // Update table status
    if (table_id) {
      await prisma.table.update({
        where: { id: table_id },
        data: { status: 'occupied' }
      })
    }

    // Fetch complete order with items
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { orderItems: true, table: true }
    })

    // Emit Socket.io event
    const io = req.app.get('io')
    io.emit('new_order', {
      ...fullOrder,
      order_items: fullOrder.orderItems
    })

    if (table_id) {
      io.emit('table_updated', { id: table_id, status: 'occupied' })
    }

    res.status(201).json({
      ...fullOrder,
      order_items: fullOrder.orderItems
    })
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/orders/:id — Update order (status, bukti_bayar_url, etc.)
router.put('/:id', async (req, res) => {
  try {
    const { status, bukti_bayar_url, payment_method, confirmed_by } = req.body

    const data = {}
    if (status !== undefined) data.status = status
    if (bukti_bayar_url !== undefined) data.bukti_bayar_url = bukti_bayar_url
    if (payment_method !== undefined) data.payment_method = payment_method
    if (confirmed_by !== undefined) data.confirmedBy = confirmed_by

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data,
      include: { orderItems: true, table: true }
    })

    // Emit Socket.io event
    const io = req.app.get('io')
    io.emit('order_updated', {
      ...order,
      order_items: order.orderItems
    })

    res.json({
      ...order,
      order_items: order.orderItems
    })
  } catch (error) {
    console.error('Update order error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
