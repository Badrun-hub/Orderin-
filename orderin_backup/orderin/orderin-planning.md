# Orderin — Development Planning

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS (dengan custom config dari design system Emerald Service)
- React Router v6 untuk navigasi
- Zustand untuk state management (cart, session customer, dll)
- Tanstack Query untuk data fetching & caching

**Backend & Database**
- Supabase (PostgreSQL + Auth + Realtime + Storage)

**Print & Export**
- escpos-usb atau PrintJS untuk thermal printer
- jsPDF untuk export laporan PDF

**Hosting**
- Vercel (frontend)
- Supabase (backend sudah included)

---

## Struktur Folder Project

```
orderin/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/               # komponen reusable (Button, Card, Badge, dll)
│   │   ├── customer/         # komponen khusus customer
│   │   ├── kasir/            # komponen khusus kasir
│   │   └── admin/            # komponen khusus admin
│   ├── pages/
│   │   ├── customer/
│   │   │   ├── QRLanding.jsx
│   │   │   ├── MenuBrowse.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── PilihPembayaran.jsx
│   │   │   ├── UploadBukti.jsx
│   │   │   └── OrderStatus.jsx
│   │   ├── kasir/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DetailOrder.jsx
│   │   │   ├── VerifikasiPembayaran.jsx
│   │   │   └── Shift.jsx
│   │   └── admin/
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── KelolaMenu.jsx
│   │       ├── KelolaKategori.jsx
│   │       ├── KelolaMeja.jsx
│   │       ├── Laporan.jsx
│   │       ├── Analytics.jsx
│   │       ├── ManajemenKasir.jsx
│   │       └── Settings.jsx
│   ├── hooks/
│   │   ├── useCart.js
│   │   ├── useOrderRealtime.js
│   │   ├── useNotifikasi.js
│   │   └── useSession.js
│   ├── lib/
│   │   ├── supabase.js       # supabase client
│   │   ├── print.js          # helper thermal print
│   │   └── pdf.js            # helper export PDF
│   ├── store/
│   │   ├── cartStore.js
│   │   └── sessionStore.js
│   ├── utils/
│   │   ├── formatRupiah.js
│   │   └── orderStatus.js
│   ├── App.jsx
│   └── main.jsx
├── stitch/                   # UI reference dari design system
│   ├── menu_browse_customer/
│   ├── qr_landing_customer/
│   ├── order_status_customer/
│   ├── cashier_dashboard_staff/
│   ├── admin_dashboard_owner/
│   └── emerald_service/
│       └── DESIGN.md
├── .env
└── package.json
```

---

## Database Schema (Supabase / PostgreSQL)

### Tabel `settings`
```sql
id              uuid primary key
nama_cafe       text
logo_url        text
primary_color   text
theme           text default 'dark'   -- 'dark' | 'light'
created_at      timestamp
updated_at      timestamp
```

### Tabel `categories`
```sql
id              uuid primary key
nama            text
urutan          int                   -- untuk drag reorder
created_at      timestamp
```

### Tabel `menus`
```sql
id              uuid primary key
category_id     uuid references categories(id)
nama            text
deskripsi       text
harga           int
foto_url        text
is_available    boolean default true
created_at      timestamp
updated_at      timestamp
```

### Tabel `tables` (meja)
```sql
id              uuid primary key
nomor_meja      int unique
status          text default 'available'  -- 'available' | 'occupied' | 'billing'
qr_code_url     text
created_at      timestamp
```

### Tabel `shifts`
```sql
id              uuid primary key
kasir_id        uuid references auth.users(id)
clock_in        timestamp
clock_out       timestamp
total_order     int default 0
total_revenue   int default 0
created_at      timestamp
```

### Tabel `orders`
```sql
id              uuid primary key
table_id        uuid references tables(id)
shift_id        uuid references shifts(id)
customer_name   text
status          text    -- 'ordered' | 'confirmed' | 'cooking' |
                        -- 'delivered' | 'bill_requested' |
                        -- 'payment_uploaded' | 'payment_confirmed'
payment_method  text    -- 'cash' | 'qris' | 'ewallet' | 'debit'
bukti_bayar_url text
confirmed_by    uuid references auth.users(id)
total           int
created_at      timestamp
updated_at      timestamp
```

### Tabel `order_items`
```sql
id              uuid primary key
order_id        uuid references orders(id)
menu_id         uuid references menus(id)
nama_menu       text    -- snapshot nama saat pesan
harga           int     -- snapshot harga saat pesan
qty             int
subtotal        int
created_at      timestamp
```

### Tabel `profiles` (extend auth.users)
```sql
id              uuid references auth.users(id) primary key
nama            text
role            text    -- 'kasir' | 'admin'
is_active       boolean default true
created_at      timestamp
```

---

## Routing Plan

```
/order/:tableId              → QR Landing (customer)
/order/:tableId/menu         → Menu Browse
/order/:tableId/cart         → Cart & Checkout
/order/:tableId/payment      → Pilih Pembayaran
/order/:tableId/upload       → Upload Bukti Bayar
/order/:tableId/status       → Order Status

/kasir/login                 → Login Kasir
/kasir/dashboard             → Dashboard Kasir
/kasir/order/:orderId        → Detail Order
/kasir/shift                 → Shift

/admin/login                 → Login Admin
/admin/dashboard             → Dashboard Admin
/admin/menu                  → Kelola Menu
/admin/kategori              → Kelola Kategori
/admin/meja                  → Kelola Meja
/admin/laporan               → Laporan
/admin/analytics             → Analytics
/admin/kasir                 → Manajemen Kasir
/admin/settings              → Settings
```

---

## Supabase Realtime — Channel Plan

```
channel: orders              → kasir subscribe, trigger notif saat ada order baru
channel: order_status        → customer subscribe, update status realtime
channel: tables              → admin/kasir subscribe, update status meja realtime
```

---

## Halaman yang Perlu Dibuat

### Sudah ada di `stitch/` (tinggal konversi ke React)
- QR Landing ✅
- Menu Browse ✅
- Order Status ✅
- Cashier Dashboard ✅
- Admin Dashboard ✅

### Perlu dibuat baru (ikuti `stitch/emerald_service/DESIGN.md`)
- Cart & Checkout
- Pilih Pembayaran
- Upload Bukti Bayar
- Detail Order (kasir)
- Verifikasi Pembayaran (kasir)
- Shift (kasir)
- Kelola Menu (admin)
- Kelola Kategori (admin)
- Kelola Meja (admin)
- Laporan (admin)
- Analytics (admin)
- Manajemen Kasir (admin)
- Settings (admin)
- Login (kasir & admin)

---

## Urutan Development

### Phase 1 — Foundation
1. Setup project Vite + React + Tailwind
2. Pasang custom Tailwind config dari design system Emerald Service
3. Setup Supabase, buat semua tabel
4. Setup routing dasar
5. Buat komponen UI reusable (Button, Card, Badge, Input, BottomNav)

### Phase 2 — Customer Flow (MVP)
6. QR Landing (konversi dari stitch)
7. Menu Browse (konversi dari stitch)
8. Cart & Checkout (buat baru)
9. Pilih Pembayaran (buat baru)
10. Order Status (konversi dari stitch)
11. Upload Bukti Bayar (buat baru)

### Phase 3 — Kasir Flow (MVP)
12. Login Kasir
13. Dashboard Kasir (konversi dari stitch)
14. Detail Order + update status
15. Verifikasi Pembayaran
16. Reset Meja
17. Notifikasi realtime + bunyi

### Phase 4 — Admin Flow (MVP)
18. Login Admin
19. Dashboard Admin (konversi dari stitch)
20. Kelola Menu & Kategori
21. Kelola Meja + generate QR

### Phase 5 — V2 Features
22. Laporan harian & bulanan
23. Export PDF
24. Analytics & chart
25. Print struk thermal
26. Manajemen Kasir & Shift
27. Settings tema cafe

---

## Status Order

```
ordered → confirmed → cooking → delivered → bill_requested → payment_uploaded → payment_confirmed
```

## Status Meja

```
available → occupied → billing
```

---

## Keamanan

- QR permanen (di-print di meja), isi hanya tableId
- Meja locked saat `occupied`, customer baru tidak bisa masuk
- Cookie/session di HP customer untuk re-entry tanpa isi ulang
- Kasir verifikasi manual setiap order masuk
- Order timeout otomatis jika tidak dikonfirmasi kasir dalam X menit

---

## Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_NAME=Orderin
```

---

## Catatan Penting

- Folder `stitch/` diletakkan di root project sebagai referensi UI, tidak ikut build
- Semua halaman baru mengikuti design system di `stitch/emerald_service/DESIGN.md`
- Warna, font, dan komponen mengacu pada Tailwind config dari file stitch (sudah ada token lengkap)
- Mobile-first di semua halaman
- Supabase Realtime digunakan untuk notifikasi kasir dan update status order customer
