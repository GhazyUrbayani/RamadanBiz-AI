type JsonRecord = Record<string, unknown>;

function getMayarMcpBaseUrl(): string {
  return (
    process.env.MAYAR_MCP_BASE_URL ??
    process.env.MAYAR_MCP_URL ??
    "https://api.mayar.id/mcp"
  );
}

export async function executeMayarTool(
  toolName: string,
  toolInput: unknown,
  apiKey: string
): Promise<string> {
  const baseUrl = getMayarMcpBaseUrl().replace(/\/+$/, "");
  const url = `${baseUrl}/tools/${encodeURIComponent(toolName)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify((toolInput ?? {}) as JsonRecord),
  });

  const text = await res.text();
  if (!res.ok) {
    return JSON.stringify(
      {
        error: true,
        status: res.status,
        statusText: res.statusText,
        body: text,
      },
      null,
      2
    );
  }

  return text;
}

