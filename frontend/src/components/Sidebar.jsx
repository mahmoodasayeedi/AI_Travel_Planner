import { useState } from "react";
import { ArrowRightLeft, CloudRain, CloudSun, Loader2, Sun, X } from "lucide-react";
import { api } from "../api";

const CURRENCIES = ["EUR", "USD", "GBP", "INR", "CHF"];

function dayLabel(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d) ? iso : d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

function WeatherIcon({ rain }) {
  if (rain >= 50) return <CloudRain size={18} />;
  if (rain >= 20) return <CloudSun size={18} />;
  return <Sun size={18} />;
}

export default function Sidebar({ open, onClose, weather, currency, onWeather, onCurrency }) {
  const [city, setCity] = useState("");
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("CHF");
  const [wBusy, setWBusy] = useState(false);
  const [cBusy, setCBusy] = useState(false);
  const [wErr, setWErr] = useState("");
  const [cErr, setCErr] = useState("");

  async function getWeather(e) {
    e.preventDefault();
    if (!city.trim()) return setWErr("Enter a city to see its forecast.");
    setWBusy(true);
    setWErr("");
    try {
      const r = await api("/api/weather", { city: city.trim() });
      if (r.error) setWErr(r.error);
      else onWeather(r);
    } catch (err) {
      setWErr(err.message);
    }
    setWBusy(false);
  }

  async function convert(e) {
    e.preventDefault();
    setCBusy(true);
    setCErr("");
    try {
      const r = await api("/api/currency", { amount: Number(amount), from, to });
      if (r.error) setCErr(r.error);
      else onCurrency(r);
    } catch (err) {
      setCErr(err.message);
    }
    setCBusy(false);
  }

  const f = weather && !weather.error ? weather.forecast || {} : null;

  return (
    <aside className={`side ${open ? "open" : ""}`}>
      <div className="side-head">
        <h2>Trip tools</h2>
        <button className="icon-btn only-mobile" onClick={onClose} aria-label="Close tools">
          <X size={18} />
        </button>
      </div>
      <p className="fine">The advisor uses these results when you ask about weather or budget.</p>

      <form className="card" onSubmit={getWeather}>
        <h3>Forecast</h3>
        <label className="sr" htmlFor="city">City</label>
        <input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City, e.g. Lisbon" maxLength={80} />
        <button className="btn" disabled={wBusy}>
          {wBusy && <Loader2 size={16} className="spin" />} Get 7-day forecast
        </button>
        {wErr && <p className="error">{wErr}</p>}
        {f && (
          <div className="forecast">
            <p className="where">{weather.location}</p>
            {(f.time || []).map((d, i) => (
              <div className="wx" key={d}>
                <WeatherIcon rain={f.precipitation_probability_max?.[i] ?? 0} />
                <span className="wx-day">{dayLabel(d)}</span>
                <span className="wx-t">
                  {Math.round(f.temperature_2m_min?.[i])}° / {Math.round(f.temperature_2m_max?.[i])}°
                </span>
                <span className="wx-r">{f.precipitation_probability_max?.[i] ?? "–"}%</span>
              </div>
            ))}
            <p className="fine">Source: {weather.source}. °C and chance of rain.</p>
          </div>
        )}
      </form>

      <form className="card" onSubmit={convert}>
        <h3>Currency</h3>
        <label className="sr" htmlFor="amount">Amount</label>
        <input id="amount" type="number" min="0.01" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <div className="pair">
          <select aria-label="From currency" value={from} onChange={(e) => setFrom(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <ArrowRightLeft size={16} aria-hidden="true" />
          <select aria-label="To currency" value={to} onChange={(e) => setTo(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn" disabled={cBusy}>
          {cBusy && <Loader2 size={16} className="spin" />} Convert
        </button>
        {cErr && <p className="error">{cErr}</p>}
        {currency && !currency.error && (
          <div className="fx">
            <p className="fx-big">
              {Number(currency.converted_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency.to}
            </p>
            <p className="fine">
              1 {currency.from} = {currency.rate} {currency.to}. Rate date {currency.rate_date}, source {currency.source}. Reference rate, not a bank or card rate.
            </p>
          </div>
        )}
      </form>
    </aside>
  );
}
