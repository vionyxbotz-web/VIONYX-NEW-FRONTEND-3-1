# Vionyx Frontend (liquid glass + 3D)
URL bersih tanpa `#` (/topup, /manage-bot, /admin/users ...). Server harus mengarahkan semua path ke `index.html` (SPA fallback).

Lokal:        npx serve -s -l 5173 .      (flag -s = SPA fallback)
Vercel:       vercel.json sudah berisi rewrite.
Backend:      kalau frontend dilayani oleh backend (frontend/dist), tambahkan fallback `app.get('*', ...index.html)`.

Konfigurasi backend/Midtrans ada di config.js.
Halaman: / /login /register /reset-password /dashboard /manage-bot /topup /redeem /admin /admin/users /admin/topups /admin/blocks /admin/config /admin/redeem-codes /admin/testimonials /admin/bots /admin/coin-packages
