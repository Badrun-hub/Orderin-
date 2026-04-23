import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Orderin database...')

  // Clear existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.menu.deleteMany()
  await prisma.category.deleteMany()
  await prisma.table.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.settings.deleteMany()

  // 1. Settings
  await prisma.settings.create({
    data: {
      id: 'settings-default-001',
      nama_cafe: 'Orderin Cafe',
      primaryColor: '#10B981',
      theme: 'dark'
    }
  })

  // 2. Profiles (Kasir + Admin)
  const kasir = await prisma.profile.create({
    data: {
      id: 'profile-kasir-001',
      nama: 'Budi Kasir',
      role: 'kasir',
      pin: '123456',
      is_active: true
    }
  })

  const admin = await prisma.profile.create({
    data: {
      id: 'profile-admin-001',
      nama: 'Siti Admin',
      role: 'admin',
      pin: '654321',
      is_active: true
    }
  })

  // 3. Categories
  const catMakanan = await prisma.category.create({
    data: {
      id: 'cat-makanan-001',
      nama: 'Makanan Utama',
      urutan: 1
    }
  })

  const catMinuman = await prisma.category.create({
    data: {
      id: 'cat-minuman-001',
      nama: 'Minuman Segar',
      urutan: 2
    }
  })

  // 4. Menus
  await prisma.menu.createMany({
    data: [
      {
        id: 'menu-nasgor-001',
        categoryId: catMakanan.id,
        nama: 'Nasi Goreng Spesial',
        deskripsi: 'Nasi goreng dengan telur mata sapi, sosis, dan ayam suwir gurih.',
        harga: 35000,
        is_available: true,
        foto_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800'
      },
      {
        id: 'menu-miegoreng-001',
        categoryId: catMakanan.id,
        nama: 'Mie Goreng Seafood',
        deskripsi: 'Mie goreng gurih dengan udang, cumi segar, dan baso ikan.',
        harga: 42000,
        is_available: true,
        foto_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800'
      },
      {
        id: 'menu-esteh-001',
        categoryId: catMinuman.id,
        nama: 'Es Teh Manis',
        deskripsi: 'Teh pilihan dengan gula asli dan es batu kristal.',
        harga: 10000,
        is_available: true,
        foto_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800'
      }
    ]
  })

  // 5. Tables
  await prisma.table.createMany({
    data: [
      { id: 'table-001', nomor_meja: '1', lokasi: 'Lantai 1', status: 'available' },
      { id: 'table-002', nomor_meja: '2', lokasi: 'Lantai 1', status: 'available' },
      { id: 'table-003', nomor_meja: '3', lokasi: 'Outdoor', status: 'available' }
    ]
  })

  // 6. Shifts
  await prisma.shift.create({
    data: {
      id: 'shift-001',
      kasirId: kasir.id,
      clock_in: new Date()
    }
  })

  console.log('✅ Seed selesai! Data dummy tersedia.')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
