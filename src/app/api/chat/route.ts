import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  messages: Message[];
};

export async function POST(req: Request) {
  const { messages } = (await req.json()) as ChatRequestBody;

  const HF_TOKEN = process.env.HF_TOKEN;

  const response = await fetch(
    "https://router.huggingface.co/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_TOKEN}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    return Response.json({ response: `Error: ${err}` }, { status: 500 });
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content ?? "Tidak ada respons.";

  return Response.json({ response: text });
}
