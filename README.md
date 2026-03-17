<div align="center">

<img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
<img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" />
<img src="https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=for-the-badge&logo=tailwindcss" />
<img src="https://img.shields.io/badge/Mayar-MCP-green?style=for-the-badge" />
<img src="https://img.shields.io/badge/HuggingFace-LLM-yellow?style=for-the-badge&logo=huggingface" />
<img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel" />

# 🌙 RamadanBiz AI

**Asisten bisnis berbasis AI untuk UMKM Indonesia di bulan Ramadan.**
Dibangun di atas platform pembayaran [Mayar](https://mayar.id) dengan agentic AI yang bisa membaca & bertindak atas data bisnis secara real-time via natural language.

[**🚀 Live Demo**](https://ramadan-biz-ai.vercel.app) · [**📖 Docs Mayar**](https://docs.mayar.id) · [**🏆 Vibecoding Competition Ramadhan 2026**](#)

</div>

---

## ✨ Fitur Utama

- 🤖 **Agentic AI** — AI tidak hanya menjawab, tapi bisa *bertindak*: cek saldo, buat invoice, monitor piutang via chat natural
- 💬 **Natural Language Interface** — Tidak perlu buka dashboard; cukup ketik seperti chat WhatsApp
- 🎭 **Demo Mode** — Data sintetis realistis (8 customer, 8 produk, 15 transaksi) siap pakai tanpa perlu akun Mayar
- 📊 **16 Mayar Tools** — Terintegrasi langsung dengan Mayar MCP untuk akses data transaksi, customer, produk, membership
- 🌙 **Konteks Ramadan** — Persona dan tone AI dirancang khusus untuk UMKM Ramadan Indonesia
- 📱 **Responsive UI** — Desain mobile-first dengan tema hijau-emas khas Ramadan, markdown renderer custom
- ⚡ **Serverless** — Zero-config deploy di Vercel, tidak butuh database eksternal

---

## 🎯 Contoh Penggunaan

```
👤 "Berapa saldo Mayar-ku sekarang?"
🤖 → [panggil get_balance] → Saldo tersedia: Rp 5.230.000

👤 "Buatkan invoice untuk Budi, Hampers Premium, Rp 350.000"
🤖 → Konfirmasi detail → [panggil create_invoice] → Return link invoice

👤 "Siapa yang belum bayar minggu ini?"
🤖 → [panggil get_latest_unpaid_transactions] → Tampilkan 3 invoice pending + insight

👤 "Omzetku bulan ini berapa? Produk apa yang paling laris?"
🤖 → [panggil get_transactions_by_time_period] → Analisis + rekomendasi strategi
```

---

## 🏗️ Arsitektur

```
User (Chat UI)
      │
      ▼
Next.js App Router (src/app/)
      │
      ├── /api/chat/route.ts       ← Agentic loop (max 5 iterasi)
      │         │
      │         ├── HuggingFace router (Llama 3.1 8B Instruct)
      │         └── Mock Executor (16 tools — demo mode)
      │                   │
      │                   └── mock-data.ts (data sintetis)
      │
      └── page.tsx                 ← Chat UI (Tailwind, no deps)
```

### Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (pure, no component library) |
| LLM | HuggingFace — Llama 3.1 8B Instruct (free) |
| Agentic Tools | 16 Mayar Mock Tools (demo mode) |
| Payment Platform | Mayar MCP (production-ready) |
| Deployment | Vercel (Serverless) |

---

## 🛠️ 16 Tools Mayar yang Tersedia

AI memanggil tools ini secara otomatis berdasarkan konteks percakapan:

| Kategori | Tools |
|---|---|
| 💰 Account | `get_balance` |
| 📄 Invoice | `create_invoice` |
| 👤 Customer | `get_customer_detail`, `send_portal_link` |
| 📊 Transaksi | `get_latest_transactions`, `get_transactions_by_time_period`, `get_transactions_by_time_range`, `get_transactions_by_customer_and_time_period`, `get_transactions_by_customer_and_time_range`, `get_latest_transactions_by_customer`, `get_transactions_by_specific_product` |
| ❌ Unpaid | `get_latest_unpaid_transactions`, `get_unpaid_transactions_by_time_range` |
| 🎫 Membership | `get_membership_customer_by_specific_product`, `get_membership_customer_by_specific_product_and_tier` |
| 📦 Produk | `get_products` |

---

## 🎭 Demo Data Sintetis

Mode demo sudah dilengkapi data realistis siap pakai tanpa perlu akun Mayar:

| Data | Detail |
|---|---|
| 💰 Saldo | Rp 5.230.000 |
| 👤 Customer | 8 customer (Budi, Siti, Ahmad, Rina, Yusuf, Diana, Hendra, Lestari) |
| 📦 Produk | 8 produk (hampers, katering, e-book, kelas online, membership, kurma) |
| ✅ Transaksi Paid | 15 transaksi (3 hari terakhir) |
| ❌ Unpaid | 3 invoice pending (total Rp 899.000) |
| 🎫 Membership | 4 member aktif (tier Gold, Silver, Basic) |

---

## 🚀 Setup & Development

### Prerequisites

- Node.js 18+
- npm
- Akun [HuggingFace](https://huggingface.co) (gratis)

### Instalasi

```bash
git clone https://github.com/GhazyUrbayani/RamadanBiz-AI.git
cd RamadanBiz-AI
npm install
```

### Environment Variables

Buat file `.env.local`:

```env
# Wajib — HuggingFace token (gratis di huggingface.co/settings/tokens)
# Buat token dengan permission: "Make calls to Inference Providers"
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
```

### Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## 🌐 Deploy ke Vercel

1. Fork / clone repo ini
2. Connect ke [Vercel Dashboard](https://vercel.com)
3. Set environment variable:
   - `HF_TOKEN` → token HuggingFace-mu (wajib)
4. Deploy otomatis setiap push ke `main`

---

## 📁 Struktur Project

```
RamadanBiz-AI/
├── src/
│   ├── app/
│   │   ├── api/chat/
│   │   │   └── route.ts              # Agentic loop + HuggingFace LLM
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Chat UI (markdown, bubbles, animasi)
│   └── lib/
│       ├── ai/
│       │   └── system-prompt.ts      # Persona & instruksi AI (Ramadan UMKM)
│       └── mayar/
│           ├── tool-definitions.ts   # 16 Mayar tools (Anthropic SDK format)
│           ├── tool-executor.ts      # Mayar MCP caller (mode live)
│           ├── mock-data.ts          # 🎭 Data sintetis realistis (demo mode)
│           └── mock-executor.ts      # 🎭 16 mock tools handler (demo mode)
├── .gitignore
├── next.config.mjs
├── package.json
└── tsconfig.json
```

---

## 🗺️ Roadmap

- [ ] Live mode dengan Mayar API key (production)
- [ ] Onboarding API key di UI
- [ ] Riwayat chat persisten (localStorage)
- [ ] Export laporan ke PDF
- [ ] Notifikasi unpaid otomatis via WhatsApp

---

## 🤝 Kontribusi

Pull request dan issue sangat welcome! Untuk perubahan besar, buka issue terlebih dahulu untuk diskusi.

---

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.

---

<div align="center">

Dibuat dengan ❤️ untuk **Vibecoding Competition Ramadhan 2026**

**رمضان مبارك** · Selamat Ramadan 🌙

</div>
