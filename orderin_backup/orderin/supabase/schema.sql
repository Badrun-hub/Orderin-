-- Kumpulan ekstensi yang sering dibutuhkan Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel settings
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_cafe TEXT NOT NULL DEFAULT 'Orderin Cafe',
    logo_url TEXT,
    primary_color TEXT DEFAULT '#10B981',
    theme TEXT DEFAULT 'dark',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabel categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama TEXT NOT NULL,
    urutan INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabel menus
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    nama TEXT NOT NULL,
    deskripsi TEXT,
    harga INT NOT NULL DEFAULT 0,
    foto_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabel tables (meja)
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nomor_meja TEXT UNIQUE NOT NULL, -- Diubah menjadi TEXT agar menerima "VIP-1" dsb
    lokasi TEXT DEFAULT 'Lantai 1',
    status TEXT DEFAULT 'available', -- 'available' | 'ordered' | 'cooking' | 'billing' (Opsional jika ikut Order status)
    qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabel profiles (extend auth.users untuk role based)
-- Catatan: Biasanya profile dihubungkan ke auth.users setelah user auth dibuat, 
-- namun untuk referensi di DDL, kita menggunakan tipe UUID saja untuk referensi manual.
CREATE TABLE profiles (
    id UUID PRIMARY KEY, -- references auth.users(id)
    nama TEXT NOT NULL,
    pin TEXT UNIQUE,                 -- PIN akses login untuk Kasir
    role TEXT DEFAULT 'kasir',       -- 'kasir' | 'admin'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Tabel shifts
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kasir_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    clock_in TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    clock_out TIMESTAMP WITH TIME ZONE,
    total_order INT DEFAULT 0,
    total_revenue INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Tabel orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
    customer_name TEXT,
    status TEXT DEFAULT 'ordered',  
    -- 'ordered' | 'confirmed' | 'cooking' | 'delivered' | 'bill_requested' | 
    -- 'payment_uploaded' | 'payment_confirmed' | 'selesai' | 'cancelled' | 'rejected'
    payment_method TEXT,            -- 'cash' | 'qris' | 'ewallet' | 'debit'
    bukti_bayar_url TEXT,
    confirmed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    total INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. Tabel order_items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_id UUID REFERENCES menus(id) ON DELETE SET NULL,
    nama_menu TEXT NOT NULL,        -- snapshot nama saat pesan
    harga INT NOT NULL,             -- snapshot harga saat pesan
    qty INT NOT NULL DEFAULT 1,
    subtotal INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS (Row Level Security) - Diaktifkan nanti melalui Supabase Dashboard, tapi bagus disiapkan strukturalnya

-----------------------------------------------
-- Realtime Subscriptions
-----------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
