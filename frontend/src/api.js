export async function api(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON error page */
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// The model is told to return raw JSON for itineraries, but may add code fences.
export function parseItinerary(text) {
  const t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const o = JSON.parse(t);
    if (o && typeof o === "object" && Array.isArray(o.itinerary)) return o;
  } catch {
    /* plain text reply */
  }
  return null;
}
