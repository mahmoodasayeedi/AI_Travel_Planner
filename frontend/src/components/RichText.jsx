// Tiny, safe formatter for chat replies: paragraphs, "- " lists and **bold**.
// Builds React elements only (never raw HTML), so model output can't inject markup.
function inline(text, key) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={`${key}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

export default function RichText({ text }) {
  const blocks = [];
  let list = [];
  const flush = () => {
    if (list.length) {
      blocks.push(<ul key={`ul${blocks.length}`}>{list}</ul>);
      list = [];
    }
  };
  text.split("\n").forEach((raw, i) => {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)/);
    if (bullet) {
      list.push(<li key={i}>{inline(bullet[1], i)}</li>);
    } else {
      flush();
      if (line) blocks.push(<p key={i}>{inline(line.replace(/^#+\s*/, ""), i)}</p>);
    }
  });
  flush();
  return <div className="rich">{blocks}</div>;
}
