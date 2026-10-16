import { useEffect, useState } from "react";

const LINES = [
  "Itineraries built around what you actually enjoy",
  "Day-by-day plans with a budget you can plan around",
  "Weather and exchange rates, checked for you",
  "Food, museums, hiking, beaches: tell me what you love",
  "Tell me where you are headed and I will plan the rest",
];

// Rotates the header tagline. Stays still for people who prefer reduced motion.
export default function Tagline() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setI((n) => (n + 1) % LINES.length), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <p className="tagline">
      <span key={i}>{LINES[i]}</span>
    </p>
  );
}
