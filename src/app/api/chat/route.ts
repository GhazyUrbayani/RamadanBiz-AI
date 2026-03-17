import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { MAYAR_TOOLS } from "@/lib/mayar/tool-definitions";
import { executeMayarTool } from "@/lib/mayar/tool-executor";

type ChatRequestBody = {
  messages: MessageParam[];
  apiKey?: string;
};

export async function POST(req: Request) {
  const { messages, apiKey } = (await req.json()) as ChatRequestBody;

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Agentic loop — terus sampai tidak ada tool calls
  let currentMessages = messages;

  while (true) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5", // atau claude-opus-4-5 untuk analisis kompleks
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: MAYAR_TOOLS,
      messages: currentMessages,
    });

    // Jika tidak ada tool calls, return final response
    if (response.stop_reason === "end_turn") {
      return Response.json({
        response: (response.content[0] as { text?: string }).text ?? "",
        usage: response.usage,
      });
    }

    // Process tool calls
    if (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (block) => block.type === "tool_use"
      );

      // Execute tools (parallel if multiple)
      const toolResults = await Promise.all(
        toolUseBlocks.map(async (toolUse) => ({
          type: "tool_result" as const,
          tool_use_id: toolUse.id,
          content: await executeMayarTool(toolUse.name, toolUse.input, apiKey),
        }))
      );

      // Add assistant response + tool results to message history
      currentMessages = [
        ...currentMessages,
        { role: "assistant", content: response.content },
        { role: "user", content: toolResults },
      ];
    }
  }
}

