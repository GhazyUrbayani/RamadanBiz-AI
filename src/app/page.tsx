"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

type Role = "user" | "assistant";
interface Message { role: Role; content: string; }

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:        "#0b1a10",
  surface:   "#0f2016",
  bubble:    "#1c3d26",
  border:    "#2d6840",
  amber:     "#f59e0b",
  amberHov:  "#fbbf24",
  green:     "#4ade80",
  greenDim:  "#86efac",
  white:     "#ffffff",
  mutedTxt:  "#1e4d2a",
};

// ── Markdown Renderer ─────────────────────────────────────────────────────────
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const els: React.ReactNode[] = [];
  let i = 0;

  const fmt = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const re = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|~~(.+?)~~)/g;
    let last = 0, m, k = 0;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      if (m[2]) parts.push(<strong key={k++}><em>{m[2]}</em></strong>);
      else if (m[3]) parts.push(<strong key={k++}>{m[3]}</strong>);
      else if (m[4]) parts.push(<em key={k++}>{m[4]}</em>);
      else if (m[5]) parts.push(<code key={k++} style={{ background:"#0a1a0d", color:C.amber, fontFamily:"monospace", fontSize:13, padding:"1px 6px", borderRadius:4 }}>{m[5]}</code>);
      else if (m[6]) parts.push(<del key={k++} style={{ opacity:.5 }}>{m[6]}</del>);
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  while (i < lines.length) {
    const line = lines[i];
    // code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { code.push(lines[i]); i++; }
      els.push(<pre key={i} style={{ background:"#0a1a0d", border:`1px solid ${C.border}`, borderRadius:10, padding:14, overflowX:"auto", fontSize:13, fontFamily:"monospace", color:"#fef3c7", lineHeight:1.6, margin:"10px 0" }}>
        {lang && <span style={{ display:"block", fontSize:11, color:C.amber, marginBottom:6, textTransform:"uppercase", letterSpacing:2 }}>{lang}</span>}
        {code.join("\n")}
      </pre>);
      i++; continue;
    }
    // headings
    const h1=line.match(/^# (.+)/), h2=line.match(/^## (.+)/), h3=line.match(/^### (.+)/);
    if (h1) { els.push(<h1 key={i} style={{ fontSize:18, fontWeight:700, color:C.amber, margin:"14px 0 6px" }}>{fmt(h1[1])}</h1>); i++; continue; }
    if (h2) { els.push(<h2 key={i} style={{ fontSize:16, fontWeight:700, color:C.amber, margin:"12px 0 5px" }}>{fmt(h2[1])}</h2>); i++; continue; }
    if (h3) { els.push(<h3 key={i} style={{ fontSize:14, fontWeight:600, color:C.amberHov, margin:"10px 0 4px" }}>{fmt(h3[1])}</h3>); i++; continue; }
    // ul
    if (/^[\-\*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[\-\*] /.test(lines[i])) { items.push(lines[i].replace(/^[\-\*] /,"")); i++; }
      els.push(<ul key={i} style={{ margin:"6px 0", padding:0, listStyle:"none" }}>{items.map((it,x)=>(
        <li key={x} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:4 }}>
          <span style={{ color:C.amber, fontSize:10, marginTop:3, flexShrink:0 }}>◆</span>
          <span>{fmt(it)}</span>
        </li>
      ))}</ul>);
      continue;
    }
    // ol
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /,"")); i++; }
      els.push(<ol key={i} style={{ margin:"6px 0", padding:0, listStyle:"none" }}>{items.map((it,x)=>(
        <li key={x} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:4 }}>
          <span style={{ color:C.amber, fontWeight:700, fontSize:13, flexShrink:0, width:20, textAlign:"right" }}>{x+1}.</span>
          <span>{fmt(it)}</span>
        </li>
      ))}</ol>);
      continue;
    }
    // table
    if (line.includes("|") && line.trim().startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim().startsWith("|")) {
        const row = lines[i].split("|").slice(1,-1).map(c=>c.trim());
        if (!row.every(c=>/^[-:\s]+$/.test(c))) rows.push(row);
        i++;
      }
      if (rows.length) els.push(
        <div key={i} style={{ overflowX:"auto", margin:"10px 0", borderRadius:10, border:`1px solid ${C.border}` }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead><tr style={{ background:"#0a1a0d" }}>
              {rows[0].map((c,ci)=><th key={ci} style={{ padding:"10px 14px", color:C.amber, fontWeight:600, textAlign:"left", borderBottom:`1px solid ${C.border}` }}>{fmt(c)}</th>)}
            </tr></thead>
            <tbody>{rows.slice(1).map((row,ri)=>(
              <tr key={ri} style={{ background: ri%2===0?"#112218":"#0d1c13" }}>
                {row.map((c,ci)=><td key={ci} style={{ padding:"9px 14px", color:C.greenDim, borderBottom:"1px solid #1a3a20" }}>{fmt(c)}</td>)}
              </tr>
            ))}</tbody>
          </table>
        </div>
      );
      continue;
    }
    // hr
    if (/^[-*_]{3,}$/.test(line.trim())) { els.push(<hr key={i} style={{ border:"none", borderTop:`1px solid ${C.border}`, margin:"10px 0" }}/>); i++; continue; }
    // blockquote
    if (line.startsWith("> ")) { els.push(<blockquote key={i} style={{ borderLeft:`2px solid ${C.amber}`, paddingLeft:12, margin:"6px 0", fontStyle:"italic", color:C.greenDim }}>{fmt(line.slice(2))}</blockquote>); i++; continue; }
    // blank
    if (line.trim()==="") { els.push(<div key={i} style={{ height:8 }}/>); i++; continue; }
    // paragraph
    els.push(<p key={i} style={{ margin:"3px 0", lineHeight:1.65 }}>{fmt(line)}</p>);
    i++;
  }
  return <div style={{ color:C.white, fontSize:14 }}>{els}</div>;
}

// ── Loading Dots ──────────────────────────────────────────────────────────────
function LoadingDots() {
  return (
    <div style={{ display:"flex", gap:6, alignItems:"center", padding:"4px 0" }}>
      {[0,1,2].map(i=>(
        <span key={i} className="animate-bounce" style={{ width:8, height:8, borderRadius:"50%", background:C.amber, display:"inline-block", animationDelay:`${i*0.15}s`, animationDuration:"0.9s" }}/>
      ))}
    </div>
  );
}

// ── Crescent Icon ─────────────────────────────────────────────────────────────
function CrescentIcon({ size=20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string|null>(null);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  useEffect(()=>{
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160)+"px";
  }, [input]);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const next: Message[] = [...messages, { role:"user", content:trimmed }];
    setMessages(next); setInput(""); setLoading(true); setError(null);
    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) throw new Error((await res.text())||`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data?.response ?? data?.message ?? data?.content ?? "No response received.";
      setMessages([...next, { role:"assistant", content:reply }]);
    } catch(e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setLoading(false); }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const SUGGESTIONS = [
    "What businesses thrive during Ramadan?",
    "Give me a marketing plan for Lebaran",
    "How to price food products this Ramadan?",
    "Ideas for a Ramadan gift hamper business",
  ];

  return (
    // Root: full viewport, dark background, column flex
    <div style={{
      position:"fixed", inset:0,
      display:"flex", flexDirection:"column",
      background: C.bg,
      color: C.white,
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{
        flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 24px",
        background: C.surface,
        borderBottom: `2px solid rgba(245,158,11,0.45)`,
      }}>
        {/* Left: logo + title */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{
            width:40, height:40, borderRadius:"50%",
            background: C.amber, color: C.bg,
            display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0,
            boxShadow:"0 4px 12px rgba(245,158,11,0.3)",
          }}>
            <CrescentIcon size={22}/>
          </div>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:C.amber, lineHeight:1.2 }}>RamadanBiz AI</div>
            <div style={{ fontSize:12, color:C.green, letterSpacing:1 }}>رمضان مبارك · Blessed Ramadan</div>
          </div>
        </div>
        {/* Right: online badge */}
        <div style={{
          display:"flex", alignItems:"center", gap:6,
          fontSize:12, color:C.green,
          background:"#0a1a0d", border:`1px solid ${C.border}`,
          padding:"6px 12px", borderRadius:99,
        }}>
          <span className="animate-pulse" style={{ width:6, height:6, borderRadius:"50%", background:"#34d399", display:"inline-block" }}/>
          Online
        </div>
      </div>

      {/* ── CHAT AREA ──────────────────────────────────────────────────── */}
      <div style={{ flex:1, overflowY:"auto", padding:"24px 16px" }}>

        {/* Welcome screen */}
        {messages.length===0 && !loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60%", gap:20, textAlign:"center", padding:"0 16px" }}>
            {/* Big icon */}
            <div style={{ width:64, height:64, borderRadius:"50%", background:C.amber, color:C.bg, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(245,158,11,0.35)" }}>
              <CrescentIcon size={34}/>
            </div>
            <div>
              <div style={{ fontSize:24, fontWeight:700, color:C.amber, marginBottom:8 }}>Selamat Ramadan! 🌙</div>
              <div style={{ fontSize:14, color:C.greenDim, maxWidth:440, lineHeight:1.65 }}>
                Asisten bisnis Ramadan siap membantu. Tanyakan strategi, produk, pemasaran,
                atau ide untuk mengembangkan usahamu di bulan suci ini.
              </div>
            </div>
            {/* Suggestion grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, width:"100%", maxWidth:520, marginTop:4 }}>
              {SUGGESTIONS.map(s=>(
                <button key={s}
                  onClick={()=>{ setInput(s); textareaRef.current?.focus(); }}
                  style={{
                    textAlign:"left", padding:"12px 16px", borderRadius:12,
                    background:C.surface, border:`1px solid ${C.border}`,
                    color:C.greenDim, fontSize:13, lineHeight:1.4,
                    cursor:"pointer", transition:"all 0.15s",
                  }}
                  onMouseEnter={e=>{ const b=e.currentTarget; b.style.borderColor=C.amber; b.style.color=C.amberHov; }}
                  onMouseLeave={e=>{ const b=e.currentTarget; b.style.borderColor=C.border; b.style.color=C.greenDim; }}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        <div style={{ display:"flex", flexDirection:"column", gap:16, maxWidth:768, margin:"0 auto" }}>
          {messages.map((msg, idx)=>(
            <div key={idx} style={{ display:"flex", alignItems:"flex-end", gap:10, justifyContent: msg.role==="user"?"flex-end":"flex-start" }}>

              {/* Assistant avatar */}
              {msg.role==="assistant" && (
                <div style={{ width:32, height:32, borderRadius:"50%", background:C.amber, color:C.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginBottom:2, boxShadow:"0 2px 8px rgba(245,158,11,0.3)" }}>
                  <CrescentIcon size={16}/>
                </div>
              )}

              {/* Bubble */}
              <div style={{
                maxWidth:"75%",
                padding:"10px 16px",
                borderRadius: msg.role==="user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.role==="user" ? C.amber : C.bubble,
                color:       msg.role==="user" ? C.bg   : C.white,
                border:      msg.role==="user" ? "none" : `1px solid ${C.border}`,
                boxShadow:   "0 4px 16px rgba(0,0,0,0.4)",
              }}>
                {msg.role==="user"
                  ? <p style={{ fontSize:14, fontWeight:500, lineHeight:1.6, margin:0, whiteSpace:"pre-wrap" }}>{msg.content}</p>
                  : <MarkdownRenderer content={msg.content}/>
                }
              </div>

              {/* User avatar */}
              {msg.role==="user" && (
                <div style={{ width:32, height:32, borderRadius:"50%", background:C.bubble, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginBottom:2, fontSize:16 }}>
                  👤
                </div>
              )}
            </div>
          ))}

          {/* Loading bubble */}
          {loading && (
            <div style={{ display:"flex", alignItems:"flex-end", gap:10, justifyContent:"flex-start" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:C.amber, color:C.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginBottom:2 }}>
                <CrescentIcon size={16}/>
              </div>
              <div style={{ padding:"12px 18px", borderRadius:"16px 16px 16px 4px", background:C.bubble, border:`1px solid ${C.border}` }}>
                <LoadingDots/>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ display:"flex", justifyContent:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", borderRadius:12, background:"#2d0a0a", border:"1px solid #7f1d1d", color:"#fca5a5", fontSize:14, maxWidth:400 }}>
                <span style={{ fontSize:18, flexShrink:0 }}>⚠</span>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        <div ref={bottomRef}/>
      </div>

      {/* ── INPUT BAR ──────────────────────────────────────────────────── */}
      <div style={{
        flexShrink:0,
        padding:"12px 16px 18px",
        background: C.surface,
        borderTop: `2px solid rgba(245,158,11,0.35)`,
      }}>
        <div style={{ display:"flex", alignItems:"flex-end", gap:10, maxWidth:768, margin:"0 auto" }}>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={onKey}
            disabled={loading}
            placeholder="Tanyakan ide bisnis Ramadan..."
            rows={1}
            style={{
              flex:1,
              resize:"none",
              background: C.bg,
              border: `1.5px solid ${C.border}`,
              borderRadius:14,
              color: C.white,
              fontSize:14,
              padding:"13px 16px",
              outline:"none",
              lineHeight:1.5,
              minHeight:50,
              maxHeight:160,
              overflowY:"auto",
              fontFamily:"inherit",
              transition:"border-color 0.2s",
            }}
            onFocus={e=>(e.currentTarget.style.borderColor=C.amber)}
            onBlur={e=>(e.currentTarget.style.borderColor=C.border)}
          />

          {/* Send button */}
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            style={{
              width:48, height:48, borderRadius:14, flexShrink:0,
              background: (loading || !input.trim()) ? C.bubble : C.amber,
              color:       (loading || !input.trim()) ? C.border  : C.bg,
              border: "none",
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor: (loading || !input.trim()) ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(245,158,11,0.25)",
              transition:"all 0.15s",
              fontSize:0,
            }}
            onMouseEnter={e=>{ if (!loading && input.trim()) (e.currentTarget as HTMLButtonElement).style.background=C.amberHov; }}
            onMouseLeave={e=>{ if (!loading && input.trim()) (e.currentTarget as HTMLButtonElement).style.background=C.amber; }}
          >
            {loading ? (
              <svg style={{ width:18, height:18 }} className="animate-spin" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity:.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path style={{ opacity:.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            ) : (
              <svg style={{ width:20, height:20 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.269 20.875L5.999 12zm0 0h7.5"/>
              </svg>
            )}
          </button>
        </div>
        <div style={{ textAlign:"center", fontSize:11, color:C.mutedTxt, marginTop:8, letterSpacing:0.5 }}>
          Enter untuk kirim · Shift+Enter untuk baris baru
        </div>
      </div>
    </div>
  );
}
