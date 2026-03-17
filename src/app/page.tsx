"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

type Role = "user" | "assistant";
interface Message {
  role: Role;
  content: string;
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  const inlineFormat = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|~~(.+?)~~)/g;
    let last = 0, match, idx = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > last) parts.push(text.slice(last, match.index));
      if (match[2]) parts.push(<strong key={idx++}><em>{match[2]}</em></strong>);
      else if (match[3]) parts.push(<strong key={idx++}>{match[3]}</strong>);
      else if (match[4]) parts.push(<em key={idx++}>{match[4]}</em>);
      else if (match[5]) parts.push(
        <code key={idx++} style={{ background: "#0a1a0d", color: "#fbbf24" }} className="font-mono text-[13px] px-1.5 py-0.5 rounded">
          {match[5]}
        </code>
      );
      else if (match[6]) parts.push(<del key={idx++} className="opacity-50">{match[6]}</del>);
      last = match.index + match[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { codeLines.push(lines[i]); i++; }
      elements.push(
        <pre key={i} style={{ background: "#0a1a0d", border: "1px solid rgba(180,130,0,0.35)" }}
          className="my-3 rounded-xl p-4 overflow-x-auto text-sm font-mono text-amber-100 leading-relaxed">
          {lang && <span className="block text-xs text-amber-500 mb-2 font-sans uppercase tracking-widest">{lang}</span>}
          {codeLines.join("\n")}
        </pre>
      );
      i++; continue;
    }

    const h1 = line.match(/^# (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    if (h1) { elements.push(<h1 key={i} className="text-xl font-bold text-amber-300 mt-4 mb-2">{inlineFormat(h1[1])}</h1>); i++; continue; }
    if (h2) { elements.push(<h2 key={i} className="text-lg font-bold text-amber-300 mt-3 mb-1.5">{inlineFormat(h2[1])}</h2>); i++; continue; }
    if (h3) { elements.push(<h3 key={i} className="text-base font-semibold text-amber-200 mt-2.5 mb-1">{inlineFormat(h3[1])}</h3>); i++; continue; }

    if (/^[\-\*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[\-\*] /.test(lines[i])) { items.push(lines[i].replace(/^[\-\*] /, "")); i++; }
      elements.push(
        <ul key={i} className="my-2 space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 items-start">
              <span className="text-amber-400 mt-[3px] shrink-0 text-[10px]">◆</span>
              <span>{inlineFormat(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, "")); i++; }
      elements.push(
        <ol key={i} className="my-2 space-y-1 list-none">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 items-start">
              <span className="text-amber-400 font-bold shrink-0 w-5 text-right text-sm">{idx + 1}.</span>
              <span>{inlineFormat(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.includes("|") && line.trim().startsWith("|")) {
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim().startsWith("|")) {
        const row = lines[i].split("|").slice(1, -1).map((c) => c.trim());
        if (!row.every((c) => /^[-:\s]+$/.test(c))) tableRows.push(row);
        i++;
      }
      if (tableRows.length > 0) {
        elements.push(
          <div key={i} className="my-3 overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(180,130,0,0.4)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#0a1a0d" }}>
                  {tableRows[0].map((cell, ci) => (
                    <th key={ci} className="px-4 py-2.5 text-amber-300 font-semibold text-left" style={{ borderBottom: "1px solid rgba(180,130,0,0.35)" }}>
                      {inlineFormat(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, ri) => (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? "#112218" : "#0d1c13" }}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-2.5 text-green-100" style={{ borderBottom: "1px solid rgba(20,60,30,0.6)" }}>
                        {inlineFormat(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    if (/^[-*_]{3,}$/.test(line.trim())) {
      elements.push(<hr key={i} className="my-3" style={{ borderColor: "rgba(180,130,0,0.3)" }} />);
      i++; continue;
    }
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="my-2 pl-3 italic text-green-200" style={{ borderLeft: "2px solid #f59e0b" }}>
          {inlineFormat(line.slice(2))}
        </blockquote>
      );
      i++; continue;
    }
    if (line.trim() === "") { elements.push(<div key={i} className="h-2" />); i++; continue; }
    elements.push(<p key={i} className="leading-relaxed">{inlineFormat(line)}</p>);
    i++;
  }
  return <div className="space-y-0.5 text-white text-sm">{elements}</div>;
}

// ─── Loading Dots ─────────────────────────────────────────────────────────────
function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }} />
      ))}
    </div>
  );
}

// ─── Crescent Icon ────────────────────────────────────────────────────────────
function CrescentIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const newMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      const data = await res.json();
      const reply = data?.message ?? data?.content ?? data?.reply ?? data?.text ?? "No response received.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // All critical backgrounds use inline style to override any global CSS
  const BG_PAGE    = "#0b1a10";
  const BG_SURFACE = "#0f2016";
  const BG_BUBBLE  = "#1c3d26";

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100vh", background: BG_PAGE, color: "#fff" }}
    >
      {/* Header */}
      <header
        className="shrink-0 flex items-center justify-between px-6 py-4"
        style={{ background: BG_SURFACE, borderBottom: "2px solid rgba(245,158,11,0.45)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg"
            style={{ background: "#f59e0b", color: BG_PAGE }}>
            <CrescentIcon size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide" style={{ color: "#f59e0b" }}>RamadanBiz AI</h1>
            <p className="text-xs tracking-wider" style={{ color: "#4ade80" }}>رمضان مبارك · Blessed Ramadan</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
          style={{ background: "#0a1a0d", border: "1px solid #1a4a25", color: "#4ade80" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Online
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">

        {/* Welcome */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[240px] gap-5 text-center px-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full shadow-xl"
              style={{ background: "#f59e0b", color: BG_PAGE }}>
              <CrescentIcon size={34} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#f59e0b" }}>Selamat Ramadan! 🌙</h2>
              <p className="text-sm max-w-md leading-relaxed" style={{ color: "#86efac" }}>
                Asisten bisnis Ramadan siap membantu. Tanyakan strategi, produk,
                pemasaran, atau ide untuk mengembangkan usahamu di bulan suci ini.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg mt-1">
              {[
                "What businesses thrive during Ramadan?",
                "Give me a marketing plan for Lebaran",
                "How to price food products this Ramadan?",
                "Ideas for a Ramadan gift hamper business",
              ].map((s) => (
                <button key={s}
                  onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                  className="text-left px-4 py-3 rounded-xl text-xs leading-snug transition-all duration-150"
                  style={{ background: BG_SURFACE, border: "1px solid #1e4d2a", color: "#86efac" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#f59e0b"; (e.currentTarget as HTMLButtonElement).style.color = "#fcd34d"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e4d2a"; (e.currentTarget as HTMLButtonElement).style.color = "#86efac"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-5 max-w-3xl mx-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-end gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>

              {msg.role === "assistant" && (
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full shadow-md mb-0.5"
                  style={{ background: "#f59e0b", color: BG_PAGE }}>
                  <CrescentIcon size={16} />
                </div>
              )}

              <div
                className="max-w-[80%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-xl"
                style={msg.role === "user"
                  ? { background: "#f59e0b", color: BG_PAGE, borderRadius: "1rem 1rem 0.25rem 1rem" }
                  : { background: BG_BUBBLE, border: "1px solid #2d6840", color: "#fff", borderRadius: "1rem 1rem 1rem 0.25rem" }
                }
              >
                {msg.role === "user"
                  ? <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  : <MarkdownRenderer content={msg.content} />
                }
              </div>

              {msg.role === "user" && (
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full shadow-md mb-0.5 text-base"
                  style={{ background: BG_BUBBLE, border: "1px solid #2d6840" }}>
                  👤
                </div>
              )}
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex items-end gap-2.5 justify-start">
              <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full shadow-md mb-0.5"
                style={{ background: "#f59e0b", color: BG_PAGE }}>
                <CrescentIcon size={16} />
              </div>
              <div className="rounded-2xl px-5 py-3.5" style={{ background: BG_BUBBLE, border: "1px solid #2d6840" }}>
                <LoadingDots />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm max-w-md"
                style={{ background: "#2d0a0a", border: "1px solid #7f1d1d", color: "#fca5a5" }}>
                <span className="text-lg shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        <div ref={bottomRef} />
      </main>

      {/* Input bar */}
      <footer
        className="shrink-0 px-4 pb-5 pt-3"
        style={{ background: BG_SURFACE, borderTop: "2px solid rgba(245,158,11,0.35)" }}
      >
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Tanyakan ide bisnis Ramadan..."
              rows={1}
              className="w-full resize-none text-sm px-4 py-3.5 outline-none leading-relaxed transition-all duration-200"
              style={{
                background: BG_PAGE,
                border: "1.5px solid #1e4d2a",
                borderRadius: "1rem",
                color: "#fff",
                minHeight: "52px",
                maxHeight: "160px",
                overflowY: "auto",
                scrollbarWidth: "none",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "#f59e0b")}
              onBlur={e => (e.currentTarget.style.borderColor = "#1e4d2a")}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            aria-label="Send"
            className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg transition-all duration-150 hover:scale-105 active:scale-95"
            style={{
              background: loading || !input.trim() ? BG_BUBBLE : "#f59e0b",
              color: loading || !input.trim() ? "#2d6840" : BG_PAGE,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.269 20.875L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-center text-[10px] mt-2.5 tracking-wide" style={{ color: "#1e4d2a" }}>
          Enter untuk kirim · Shift+Enter untuk baris baru
        </p>
      </footer>
    </div>
  );
}
