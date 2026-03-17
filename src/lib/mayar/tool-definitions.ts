// Best practice: Deskripsi tool yang LLM-friendly (Anthropic Writing Tools Guide)

import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const MAYAR_TOOLS: Tool[] = [
  {
    name: "get_balance",
    description: `Ambil saldo akun Mayar saat ini.
Gunakan tool ini ketika user bertanya tentang:
- Saldo Mayar
- Berapa uang yang tersedia
- Cek saldo
TIDAK PERLU parameter tambahan.`,
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "create_invoice",
    description: `Buat invoice baru untuk customer.
Gunakan tool ini HANYA setelah mendapat konfirmasi eksplisit dari user.
Tool ini melakukan write action — tidak bisa di-undo tanpa membatalkan invoice.

Contoh trigger: "buat invoice", "tagihkan", "kirim invoice ke [customer]"`,
    input_schema: {
      type: "object",
      properties: {
        customer_name: {
          type: "string",
          description: "Nama lengkap customer. Contoh: 'Budi Santoso'",
        },
        customer_email: {
          type: "string",
          description:
            "Email customer (opsional tapi sangat disarankan untuk pengiriman otomatis). Contoh: 'budi@gmail.com'",
        },
        amount: {
          type: "number",
          description:
            "Jumlah tagihan dalam Rupiah (angka bulat, tanpa titik/koma). Contoh: 150000 untuk Rp 150.000",
        },
        product_name: {
          type: "string",
          description:
            "Nama produk atau deskripsi layanan. Contoh: 'Hampers Lebaran Premium'",
        },
        notes: {
          type: "string",
          description:
            "Catatan tambahan untuk invoice (opsional). Contoh: 'Terima kasih sudah order!'",
        },
      },
      required: ["customer_name", "amount", "product_name"],
    },
  },
  {
    name: "get_customer_detail",
    description: `Cari detail informasi customer berdasarkan nama atau email.
Mengembalikan: nama, email, nomor HP, status membership, total transaksi.

Gunakan ketika user bertanya:
- "cari customer [nama]"
- "data pelanggan [nama/email]"
- "cek info [nama customer]"

Tips: Jika pencarian dengan nama tidak ketemu, coba dengan email.`,
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "Nama customer (bisa sebagian). Contoh: 'Budi' atau 'Budi Santoso'",
        },
        email: {
          type: "string",
          description:
            "Email customer (lebih akurat dari nama). Contoh: 'budi@gmail.com'",
        },
      },
      required: [],
    },
  },
  {
    name: "send_portal_link",
    description: `Kirim link customer portal ke email customer.
Customer portal berisi riwayat transaksi, invoice, dan status membership mereka.

PENTING: Ini write action — konfirmasi dulu sebelum panggil tool ini.
Gunakan ketika user minta: "kirim portal ke [customer]", "send portal link [email]"`,
    input_schema: {
      type: "object",
      properties: {
        customer_email: {
          type: "string",
          description:
            "Email customer yang akan menerima portal link. Harus email yang valid.",
        },
      },
      required: ["customer_email"],
    },
  },
  {
    name: "get_latest_transactions",
    description: `Ambil daftar transaksi PAID (lunas) terbaru.
Diurutkan dari yang terbaru. Gunakan untuk monitoring aktivitas bisnis real-time.

Trigger: "transaksi terbaru", "order terakhir", "siapa yang baru bayar"`,
    input_schema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description:
            "Jumlah transaksi yang ditampilkan. Default: 10. Maksimum: 50.",
          default: 10,
        },
      },
      required: [],
    },
  },
  {
    name: "get_latest_transactions_by_customer",
    description: `Ambil transaksi terbaru dari customer TERTENTU.
Berguna untuk customer service, melihat history pembelian, atau analisis per pelanggan.

Trigger: "transaksi [nama customer]", "order history [nama]", "sudah beli apa [nama]"`,
    input_schema: {
      type: "object",
      properties: {
        customer_identifier: {
          type: "string",
          description:
            "Nama atau email customer. Contoh: 'Budi Santoso' atau 'budi@gmail.com'",
        },
        limit: {
          type: "number",
          description: "Jumlah transaksi. Default: 10.",
          default: 10,
        },
      },
      required: ["customer_identifier"],
    },
  },
  {
    name: "get_transactions_by_time_period",
    description: `Ambil semua transaksi dalam periode standar (hari/minggu/bulan/tahun ini).
Paling umum digunakan untuk laporan omzet periodik.

Trigger: "omzet hari ini", "penjualan minggu ini", "pemasukan bulan ini", "pendapatan tahun ini"
Period values: "day" = hari ini, "week" = minggu ini, "month" = bulan ini, "year" = tahun ini`,
    input_schema: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["day", "week", "month", "year"],
          description:
            "Periode waktu: 'day' (hari ini), 'week' (minggu ini), 'month' (bulan ini), 'year' (tahun ini)",
        },
      },
      required: ["period"],
    },
  },
  {
    name: "get_transactions_by_time_range",
    description: `Ambil transaksi dalam rentang tanggal CUSTOM (awal dan akhir spesifik).
Lebih fleksibel dari get_transactions_by_time_period untuk analisis custom.

Trigger: "transaksi dari [tgl] sampai [tgl]", "omzet [tgl] - [tgl]", "laporan [periode custom]"`,
    input_schema: {
      type: "object",
      properties: {
        start_date: {
          type: "string",
          description:
            "Tanggal mulai dalam format YYYY-MM-DD. Contoh: '2026-03-01'",
        },
        end_date: {
          type: "string",
          description:
            "Tanggal akhir dalam format YYYY-MM-DD. Contoh: '2026-03-16'",
        },
      },
      required: ["start_date", "end_date"],
    },
  },
  {
    name: "get_transactions_by_customer_and_time_range",
    description: `Ambil transaksi dari customer TERTENTU dalam rentang tanggal custom.
Kombinasi filter customer + date range untuk analisis mendalam per pelanggan.

Trigger: "transaksi [customer] dari [tgl] sampai [tgl]", "history [customer] bulan lalu"`,
    input_schema: {
      type: "object",
      properties: {
        customer_identifier: {
          type: "string",
          description: "Nama atau email customer",
        },
        start_date: {
          type: "string",
          description: "Format YYYY-MM-DD",
        },
        end_date: {
          type: "string",
          description: "Format YYYY-MM-DD",
        },
      },
      required: ["customer_identifier", "start_date", "end_date"],
    },
  },
  {
    name: "get_transactions_by_customer_and_time_period",
    description: `Ambil transaksi dari customer TERTENTU dalam periode standar.
Ideal untuk analisis retensi dan pola pembelian per pelanggan.

Trigger: "beli berapa kali [customer] bulan ini", "analisis [customer] minggu ini"`,
    input_schema: {
      type: "object",
      properties: {
        customer_identifier: {
          type: "string",
          description: "Nama atau email customer",
        },
        period: {
          type: "string",
          enum: ["day", "week", "month", "year"],
          description: "Periode standar",
        },
      },
      required: ["customer_identifier", "period"],
    },
  },
  {
    name: "get_transactions_by_specific_product",
    description: `Analisis transaksi per produk TERTENTU.
Berguna untuk tracking performa produk individual, popularitas, dan tren.

Trigger: "performa produk [nama]", "berapa [produk] terjual", "produk [nama] laku gak"`,
    input_schema: {
      type: "object",
      properties: {
        product_name: {
          type: "string",
          description:
            "Nama produk. Contoh: 'Hampers Lebaran Premium' atau 'Kelas Memasak Online'",
        },
        limit: {
          type: "number",
          description: "Jumlah transaksi yang ditampilkan. Default: 20.",
          default: 20,
        },
      },
      required: ["product_name"],
    },
  },
  {
    name: "get_membership_customer_by_specific_product",
    description: `Ambil daftar semua member aktif dari produk membership tertentu.
Berguna untuk targeted marketing, broadcast, atau analisis segmen member.

Trigger: "daftar member [produk]", "siapa aja yang subscribe [produk]", "member aktif [nama membership]"`,
    input_schema: {
      type: "object",
      properties: {
        product_name: {
          type: "string",
          description: "Nama produk membership. Contoh: 'Komunitas Premium'",
        },
      },
      required: ["product_name"],
    },
  },
  {
    name: "get_membership_customer_by_specific_product_and_tier",
    description: `Ambil daftar member per produk DAN tier/level tertentu.
Ideal untuk segmentasi premium (misal: hanya tampilkan member tier Gold ke atas).

Trigger: "member [tier] dari [produk]", "daftar member [produk] tier [level]"`,
    input_schema: {
      type: "object",
      properties: {
        product_name: {
          type: "string",
          description: "Nama produk membership",
        },
        tier: {
          type: "string",
          description:
            "Nama tier/level membership. Contoh: 'Gold', 'Premium', 'VIP', 'Basic'",
        },
      },
      required: ["product_name", "tier"],
    },
  },
  {
    name: "get_latest_unpaid_transactions",
    description: `Ambil daftar invoice yang BELUM DIBAYAR.
Diurutkan dari yang paling lama (paling mendesak di-follow up duluan).
Kritis untuk cash flow management dan penagihan.

Trigger: "siapa belum bayar", "invoice pending", "piutang", "tagihan belum lunas", "unpaid"`,
    input_schema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Jumlah invoice yang ditampilkan. Default: 10.",
          default: 10,
        },
      },
      required: [],
    },
  },
  {
    name: "get_unpaid_transactions_by_time_range",
    description: `Ambil invoice BELUM DIBAYAR dalam rentang tanggal tertentu.
Lebih spesifik untuk analisis piutang per periode (misal: unpaid bulan ini saja).

Trigger: "unpaid dari [tgl] sampai [tgl]", "piutang [periode]", "belum bayar sejak [tgl]"`,
    input_schema: {
      type: "object",
      properties: {
        start_date: {
          type: "string",
          description: "Format YYYY-MM-DD. Contoh: '2026-03-01'",
        },
        end_date: {
          type: "string",
          description: "Format YYYY-MM-DD. Contoh: '2026-03-16'",
        },
      },
      required: ["start_date", "end_date"],
    },
  },
  {
    name: "get_products",
    description: `Ambil daftar semua produk aktif di akun Mayar.
Menampilkan: nama produk, harga, tipe produk, status aktif/nonaktif.

Trigger: "daftar produk", "produk apa aja yang saya jual", "list produk", "katalog saya"`,
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

