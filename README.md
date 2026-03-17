<div align="center">

<img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
<img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" />
<img src="https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=for-the-badge&logo=tailwindcss" />
<img src="https://img.shields.io/badge/Mayar-MCP-green?style=for-the-badge" />
<img src="https://img.shields.io/badge/HuggingFace-LLM-yellow?style=for-the-badge&logo=huggingface" />
<img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel" />

# 🌙 RamadanBiz AI

**Asisten bisnis berbasis AI untuk UMKM Indonesia di bulan Ramadan.**  
Dibangun di atas platform pembayaran [Mayar](https://mayar.id) dengan agentic AI yang bisa membaca data bisnis secara real-time via natural language.

[**🚀 Live Demo**](https://ramadan-biz-ai.vercel.app) · [**📖 Docs Mayar**](https://docs.mayar.id) · [**🏆 Vibecoding Competition Ramadhan 2026**](#)

</div>

---

## ✨ Fitur Utama

- 🤖 **Agentic AI** — AI tidak hanya menjawab, tapi bisa *bertindak*: cek saldo, buat invoice, monitor piutang via chat
- 💬 **Natural Language Interface** — Tidak perlu buka dashboard; cukup ketik seperti chat WhatsApp
- 📊 **Real-time Business Data** — Terintegrasi langsung dengan Mayar MCP untuk akses data transaksi, customer, produk
- 🌙 **Konteks Ramadan** — Persona dan tone AI dirancang khusus untuk UMKM Ramadan Indonesia
- 📱 **Responsive UI** — Desain mobile-first dengan tema hijau-emas khas Ramadan
- ⚡ **Instant Deploy** — Serverless di Vercel, zero-config

---

## 🎯 Contoh Penggunaan

```
👤 "Berapa saldo Mayar-ku sekarang?"
🤖 → Cek saldo real-time dari akun Mayar-mu

👤 "Buatkan invoice untuk Budi, Hampers Premium, Rp 150.000"
🤖 → Konfirmasi → Buat invoice → Return link pembayaran

👤 "Siapa yang belum bayar minggu ini?"
🤖 → Tampilkan daftar unpaid invoice beserta insight follow-up

👤 "Omzetku bulan ini berapa? Analisis produk terlaris."
🤖 → Ambil data transaksi → Analisis → Rekomendasikan strategi
```

---

## 🏗️ Arsitektur

```
User (Chat UI)
      │
      ▼
Next.js App Router (src/app/)
      │
      ├── /api/chat/route.ts    ← Agentic loop + LLM
      │         │
      │         ├── HuggingFace Inference (LLM)
      │         └── Mayar MCP Tools (16 tools)
      │                   │
      │                   └── mayar.id API (real-time)
      │
      └── page.tsx              ← Chat UI (Tailwind, no deps)
```

### Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (pure, no component lib) |
| LLM | HuggingFace — Llama 3.1 8B Instruct |
| Payment Platform | Mayar MCP (16 tools) |
| Deployment | Vercel (Serverless) |

---

## 🛠️ Tools Mayar yang Tersedia

AI dapat memanggil 16 tools berikut secara otomatis berdasarkan konteks percakapan:

| Kategori | Tools |
|---|---|
| 💰 Account | `get_balance` |
| 📄 Invoice | `create_invoice` |
| 👤 Customer | `get_customer_detail`, `send_portal_link` |
| 📊 Transaksi | `get_latest_transactions`, `get_transactions_by_time_period`, `get_transactions_by_time_range`, `get_transactions_by_customer_*`, `get_transactions_by_specific_product` |
| ❌ Unpaid | `get_latest_unpaid_transactions`, `get_unpaid_transactions_by_time_range` |
| 🎫 Membership | `get_membership_customer_by_specific_product`, `get_membership_customer_by_specific_product_and_tier` |
| 📦 Produk | `get_products` |

---

## 🚀 Setup & Development

### Prerequisites

- Node.js 18+
- npm / yarn
- Akun [HuggingFace](https://huggingface.co) (gratis)
- Akun [Mayar](https://mayar.id) (opsional, untuk mode live)

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
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx

# Opsional — Untuk mode live dengan akun Mayar nyata
MAYAR_API_KEY=your_mayar_api_key
```

### Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## 🌐 Deploy ke Vercel

```bash
# One-click deploy
vercel --prod
```

Atau connect repo ini ke [Vercel Dashboard](https://vercel.com) dan set environment variables:
- `HF_TOKEN` → token HuggingFace-mu
- `MAYAR_API_KEY` → API key Mayar (opsional untuk demo)

---

## 📁 Struktur Project

```
RamadanBiz-AI/
├── src/
│   ├── app/
│   │   ├── api/chat/
│   │   │   └── route.ts          # API endpoint + agentic loop
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx              # Chat UI
│   └── lib/
│       ├── ai/
│       │   └── system-prompt.ts  # Persona & instruksi AI
│       └── mayar/
│           ├── tool-definitions.ts  # 16 Mayar tools
│           └── tool-executor.ts     # Mayar MCP caller
├── next.config.mjs
├── package.json
└── tsconfig.json
```

---

## 🤝 Kontribusi

Pull request dan issue sangat welcome! Untuk perubahan besar, buka issue terlebih dahulu.

---

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.

---

<div align="center">

Dibuat dengan ❤️ untuk **Vibecoding Competition Ramadhan 2026**

**رمضان مبارك** · Selamat Ramadan

</div>
