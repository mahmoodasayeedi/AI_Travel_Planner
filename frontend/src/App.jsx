import { useEffect, useRef, useState } from "react";
import { Compass, Loader2, Menu, RotateCcw, Send } from "lucide-react";
import { api } from "./api";
import Message from "./components/Message";
import Sidebar from "./components/Sidebar";

const GREETING =
  "Hi, I'm your travel advisor. Tell me where you want to go, for how many days, what you enjoy (food, museums, hiking, beaches, nightlife, shopping) and your budget. I'll ask about anything I'm missing, then build your itinerary.";

const STARTERS = [
  "3 days in Paris for two, food and viewpoints, around 600 EUR",
  "A relaxed weekend in Spain Beaches",
  "5 days hiking and lakes in Switzerland, solo traveller",
];

const STORAGE_KEY = "travel-advisor-v1";

const fresh = () => ({
  messages: [{ role: "assistant", content: GREETING }],
  summary: "",
  count: 0,
  usage: { req: 0, inp: 0, out: 0, cost: 0, hasCost: false },
  weather: null,
  currency: null,
});

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...fresh(), ...JSON.parse(raw) };
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return fresh();
}

export default function App() {
  const [S, setS] = useState(load);
  const [images, setImages] = useState({}); // kept in memory only (too large for storage)
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toolsOpen, setToolsOpen] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
    } catch {
      /* ignore */
    }
  }, [S]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [S.messages.length, busy]);

  async function send(raw) {
    const text = raw.trim();
    if (!text || busy) return;
    const before = S.messages;
    const msgs = [...before, { role: "user", content: text }];
    setS((s) => ({ ...s, messages: msgs }));
    setDraft("");
    setBusy(true);
    setError("");
    try {
      const d = await api("/api/chat", {
        messages: msgs,
        summary: S.summary,
        summarized_count: S.count,
        weather: S.weather,
        currency: S.currency,
      });
      setS((s) => ({
        ...s,
        messages: [...msgs, { role: "assistant", content: d.reply }],
        summary: d.summary,
        count: d.summarized_count,
        usage: {
          req: s.usage.req + 1,
          inp: s.usage.inp + d.usage.input_tokens,
          out: s.usage.out + d.usage.output_tokens,
          cost: s.usage.cost + (d.usage.cost_usd ?? 0),
          hasCost: s.usage.hasCost || d.usage.cost_usd != null,
        },
      }));
    } catch (e) {
      setS((s) => ({ ...s, messages: before }));
      setDraft(text);
      setError(e.message);
    }
    setBusy(false);
  }

  function reset() {
    setS(fresh());
    setImages({});
    setError("");
  }

  const onlyGreeting = S.messages.length === 1;
  const u = S.usage;

  return (
    <div className="app">
      <header className="top">
        <button className="icon-btn only-mobile" onClick={() => setToolsOpen(true)} aria-label="Open trip tools">
          <Menu size={20} />
        </button>
        <div className="brand">
          <span className="logo">
            <Compass size={20} />
          </span>
          <div>
            <h1>AI Travel Advisor</h1>
            <p>Itineraries built around what you actually enjoy</p>
          </div>
        </div>
        <button className="btn-ghost" onClick={reset}>
          <RotateCcw size={15} /> New trip
        </button>
      </header>

      <div className="body">
        {toolsOpen && <div className="scrim" onClick={() => setToolsOpen(false)} />}
        <Sidebar
          open={toolsOpen}
          onClose={() => setToolsOpen(false)}
          weather={S.weather}
          currency={S.currency}
          onWeather={(r) => setS((s) => ({ ...s, weather: r }))}
          onCurrency={(r) => setS((s) => ({ ...s, currency: r }))}
        />

        <main className="chat">
          <div className="log" aria-live="polite">
            {S.messages.map((m, i) => {
              const dest = (() => {
                try {
                  return JSON.parse(m.content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")).destination;
                } catch {
                  return undefined;
                }
              })();
              return (
                <Message
                  key={i}
                  msg={m}
                  image={dest ? images[dest] : undefined}
                  onImage={(img) => setImages((p) => ({ ...p, [dest]: img }))}
                />
              );
            })}

            {onlyGreeting && !busy && (
              <div className="starters">
                {STARTERS.map((s) => (
                  <button key={s} className="starter" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {busy && (
              <div className="row assistant">
                <div className="avatar" aria-hidden="true">
                  <Compass size={18} />
                </div>
                <div className="bubble typing" role="status" aria-label="Advisor is thinking">
                  <i /> <i /> <i />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {error && (
            <p className="error banner" role="alert">
              {error} Your message is back in the box, so you can send it again.
            </p>
          )}

          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Where do you want to go?"
              maxLength={2000}
              autoComplete="off"
              aria-label="Message"
            />
            <button className="send" disabled={busy || !draft.trim()} aria-label="Send message">
              {busy ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
            </button>
          </form>

          <p className="usage">
            {u.req} requests, {u.inp.toLocaleString()} tokens in, {u.out.toLocaleString()} out
            {u.hasCost ? `, about $${u.cost.toFixed(4)}` : ", cost not shown until prices are set in Vercel"}
          </p>
        </main>
      </div>
    </div>
  );
}
