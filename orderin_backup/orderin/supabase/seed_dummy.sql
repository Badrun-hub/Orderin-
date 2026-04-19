-- CLEAR EXISTING DATA FIRST
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE shifts CASCADE;
TRUNCATE TABLE profiles CASCADE;
TRUNCATE TABLE menus CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE tables CASCADE;

-- 1. INSERT PROFILES
INSERT INTO profiles (id, nama, role, pin, is_active) VALUES
('b19d2b27-0000-0000-0000-000000000001', 'Budi Kasir', 'kasir', '123456', true),
('b19d2b27-0000-0000-0000-000000000002', 'Siti Admin', 'admin', '654321', true);

-- 2. INSERT KATEGORI
INSERT INTO categories (id, nama, urutan) VALUES
('c0000000-0000-0000-0000-000000000001', 'Makanan Utama', 1),
('c0000000-0000-0000-0000-000000000002', 'Minuman Segar', 2);

-- 3. INSERT MENUS DENGAN FOTO HD
INSERT INTO menus (id, category_id, nama, deskripsi, harga, is_available, foto_url) VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Nasi Goreng Spesial', 'Nasi goreng dengan telur mata sapi, sosis, dan ayam suwir gurih.', 35000, true, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800'),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Mie Goreng Seafood', 'Mie goreng gurih dengan udang, cumi segar, dan baso ikan.', 42000, true, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800'),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Es Teh Manis', 'Teh pilihan dengan gula asli dan es batu kristal.', 10000, true, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800');

-- 4. INSERT TABLES (Gunakkan nomor simpel agar tes URL /order/1 berhasil)
INSERT INTO tables (id, nomor_meja, lokasi, status) VALUES
('e0000000-0000-0000-0000-000000000001', '1', 'Lantai 1', 'available'),
('e0000000-0000-0000-0000-000000000002', '2', 'Lantai 1', 'available'),
('e0000000-0000-0000-0000-000000000003', '3', 'Outdoor', 'available');

-- 5. INSERT SHIFTS
INSERT INTO shifts (id, kasir_id, clock_in) VALUES
('f0000000-0000-0000-0000-000000000001', 'b19d2b27-0000-0000-0000-000000000001', now());
