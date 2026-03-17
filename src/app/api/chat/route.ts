import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { executeMayarToolMock } from "@/lib/mayar/mock-executor";

type Message = {
  role: "user" | "assistant" | "tool";
  content: string | ToolCall[];
};

type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type HFResponse = {
  choices: { message: { role: string; content: string | null; tool_calls?: ToolCall[] } }[];
};

const HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct";

// Tool definitions dalam format OpenAI / HuggingFace
const HF_TOOLS = [
  { type: "function", function: { name: "get_balance", description: "Ambil saldo Mayar saat ini.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "get_products", description: "Daftar semua produk aktif.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "get_latest_transactions", description: "Transaksi terbaru (paid).", parameters: { type: "object", properties: { limit: { type: "number", description: "Jumlah transaksi, default 10." } } } } },
  { type: "function", function: { name: "get_latest_unpaid_transactions", description: "Invoice yang belum dibayar.", parameters: { type: "object", properties: { limit: { type: "number", description: "Jumlah invoice, default 10." } } } } },
  { type: "function", function: { name: "get_transactions_by_time_period", description: "Omzet/transaksi berdasarkan periode standar.", parameters: { type: "object", properties: { period: { type: "string", enum: ["day","week","month","year"] } }, required: ["period"] } } },
  { type: "function", function: { name: "get_transactions_by_time_range", description: "Transaksi dalam rentang tanggal custom.", parameters: { type: "object", properties: { start_date: { type: "string" }, end_date: { type: "string" } }, required: ["start_date","end_date"] } } },
  { type: "function", function: { name: "get_latest_transactions_by_customer", description: "History transaksi per customer.", parameters: { type: "object", properties: { customer_identifier: { type: "string" }, limit: { type: "number" } }, required: ["customer_identifier"] } } },
  { type: "function", function: { name: "get_transactions_by_customer_and_time_period", description: "Transaksi customer tertentu dalam periode standar.", parameters: { type: "object", properties: { customer_identifier: { type: "string" }, period: { type: "string", enum: ["day","week","month","year"] } }, required: ["customer_identifier","period"] } } },
  { type: "function", function: { name: "get_transactions_by_customer_and_time_range", description: "Transaksi customer tertentu dalam rentang tanggal.", parameters: { type: "object", properties: { customer_identifier: { type: "string" }, start_date: { type: "string" }, end_date: { type: "string" } }, required: ["customer_identifier","start_date","end_date"] } } },
  { type: "function", function: { name: "get_transactions_by_specific_product", description: "Performa transaksi per produk.", parameters: { type: "object", properties: { product_name: { type: "string" }, limit: { type: "number" } }, required: ["product_name"] } } },
  { type: "function", function: { name: "get_customer_detail", description: "Cari detail customer berdasarkan nama atau email.", parameters: { type: "object", properties: { name: { type: "string" }, email: { type: "string" } } } } },
  { type: "function", function: { name: "send_portal_link", description: "Kirim customer portal link ke email customer.", parameters: { type: "object", properties: { customer_email: { type: "string" } }, required: ["customer_email"] } } },
  { type: "function", function: { name: "create_invoice", description: "Buat invoice baru untuk customer (HANYA setelah konfirmasi user).", parameters: { type: "object", properties: { customer_name: { type: "string" }, customer_email: { type: "string" }, amount: { type: "number" }, product_name: { type: "string" }, notes: { type: "string" } }, required: ["customer_name","amount","product_name"] } } },
  { type: "function", function: { name: "get_membership_customer_by_specific_product", description: "Daftar member aktif suatu produk membership.", parameters: { type: "object", properties: { product_name: { type: "string" } }, required: ["product_name"] } } },
  { type: "function", function: { name: "get_membership_customer_by_specific_product_and_tier", description: "Daftar member per produk dan tier.", parameters: { type: "object", properties: { product_name: { type: "string" }, tier: { type: "string" } }, required: ["product_name","tier"] } } },
  { type: "function", function: { name: "get_unpaid_transactions_by_time_range", description: "Invoice belum bayar dalam rentang tanggal.", parameters: { type: "object", properties: { start_date: { type: "string" }, end_date: { type: "string" } }, required: ["start_date","end_date"] } } },
];

export async function POST(req: Request) {
  const { messages } = await req.json() as { messages: ChatMessage[] };
  const HF_TOKEN = process.env.HF_TOKEN;

  let currentMessages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT + "\n\n[MODE: DEMO — Semua data adalah data sintetis. Selalu sertakan catatan kecil '*(Demo mode — data sintetis)*' di akhir respons yang menampilkan data bisnis.]" },
    ...messages,
  ];

  // Agentic loop — max 5 iterasi
  for (let i = 0; i < 5; i++) {
    const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_TOKEN}`,
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: currentMessages,
        tools: HF_TOOLS,
        tool_choice: "auto",
        max_tokens: 1024,
        temperature: 0.5,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ response: `⚠️ Error LLM: ${err}` }, { status: 500 });
    }

    const data = await res.json() as HFResponse;
    const choice = data.choices[0];
    const assistantMsg = choice.message;

    // Tidak ada tool call → return final response
    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      return Response.json({ response: assistantMsg.content ?? "Tidak ada respons." });
    }

    // Ada tool call → eksekusi mock tools
    const toolResults = await Promise.all(
      assistantMsg.tool_calls.map(async (tc) => {
        const args = JSON.parse(tc.function.arguments || "{}");
        const result = await executeMayarToolMock(tc.function.name, args);
        return {
          role: "tool" as const,
          tool_call_id: tc.id,
          content: result,
        };
      })
    );

    // Tambah ke message history
    currentMessages = [
      ...currentMessages,
      { role: "assistant", content: assistantMsg.content ?? "", ...( assistantMsg.tool_calls ? { tool_calls: assistantMsg.tool_calls } : {}) } as unknown as ChatMessage,
      ...toolResults as unknown as ChatMessage[],
    ];
  }

  return Response.json({ response: "Maaf, terlalu banyak langkah yang dibutuhkan. Coba pertanyaan yang lebih spesifik." });
}
