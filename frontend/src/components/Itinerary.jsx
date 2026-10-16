import { useState } from "react";
import { Clock, ImagePlus, Lightbulb, Loader2, MapPin, Wallet } from "lucide-react";
import { api } from "../api";

export default function Itinerary({ data, image, onImage }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function makeImage() {
    setBusy(true);
    setError("");
    try {
      const d = await api("/api/image", {
        destination: data.destination || data.title || "travel destination",
        itinerary_summary: JSON.stringify(data.itinerary),
      });
      onImage({ b64: d.image_b64, mime: d.mime });
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

  const budget = data.estimated_budget;
  const breakdown = budget?.breakdown && typeof budget.breakdown === "object" ? Object.entries(budget.breakdown) : [];
  const max = Math.max(1, ...breakdown.map(([, v]) => Number(v) || 0));
  const cur = budget?.currency || "EUR";

  return (
    <article className="trip">
      <header className="trip-head">
        <div className="trip-meta">
          {data.destination && (
            <span className="chip">
              <MapPin size={14} /> {data.destination}
            </span>
          )}
          {data.duration && <span className="chip">{data.duration}</span>}
        </div>
        <h2>{data.title || "Your itinerary"}</h2>
        {data.summary && <p className="trip-summary">{data.summary}</p>}

        {image ? (
          <img className="trip-image" src={`data:${image.mime};base64,${image.b64}`} alt={`Travel illustration of ${data.destination || "the destination"}`} />
        ) : (
          <button className="btn-ghost" onClick={makeImage} disabled={busy}>
            {busy ? <Loader2 size={16} className="spin" /> : <ImagePlus size={16} />}
            {busy ? "Creating your image..." : "Create trip image"}
          </button>
        )}
        {error && <p className="error">{error}</p>}
      </header>

      <div className="days">
        {data.itinerary.map((day, i) => (
          <section className="ticket" key={i}>
            <div className="ticket-top">
              <span className="day-no">Day {day.day ?? i + 1}</span>
              <h3>{day.title}</h3>
            </div>
            <ol className="timeline">
              {(day.activities || []).map((a, j) => (
                <li key={j}>
                  <span className="time">
                    <Clock size={12} /> {a.time}
                  </span>
                  <div className="stop">
                    <strong>{a.activity}</strong>
                    {a.location && (
                      <span className="loc">
                        <MapPin size={13} /> {a.location}
                      </span>
                    )}
                    {a.tips && <span className="tip">{a.tips}</span>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      {Array.isArray(data.travel_tips) && data.travel_tips.length > 0 && (
        <section className="panel">
          <h4>
            <Lightbulb size={16} /> Travel tips
          </h4>
          <ul>
            {data.travel_tips.map((t, i) => (
              <li key={i}>{String(t)}</li>
            ))}
          </ul>
        </section>
      )}

      {budget && (
        <section className="panel">
          <h4>
            <Wallet size={16} /> Estimated budget
          </h4>
          {budget.total != null && (
            <p className="total">
              {cur} {budget.total}
              <span> estimated total</span>
            </p>
          )}
          <div className="bars">
            {breakdown.map(([k, v]) => (
              <div className="bar-row" key={k}>
                <span className="bar-label">{k.replace(/_/g, " ")}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${((Number(v) || 0) / max) * 100}%` }} />
                </span>
                <span className="bar-val">
                  {cur} {v}
                </span>
              </div>
            ))}
          </div>
          <p className="fine">Estimates only. Check current prices before booking.</p>
        </section>
      )}
    </article>
  );
}
