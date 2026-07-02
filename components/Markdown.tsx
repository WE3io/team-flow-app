import type { CSSProperties, ReactNode } from 'react';

/**
 * Minimal markdown renderer for unit bodies: paragraphs, bullet/numbered
 * lists, **bold**, *italic*, and `inline code`. Deliberately small — the seed
 * bodies only use these, and adding a full markdown lib isn't warranted.
 */

const codeStyle: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.88em',
  background: 'rgba(22,21,15,0.06)',
  padding: '1px 5px',
  borderRadius: 5,
};

function inline(text: string, keyBase: string): ReactNode[] {
  // Tokenise on `code`, **bold**, *italic* / _italic_.
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  const parts = text.split(re).filter((p) => p !== '');
  return parts.map((p, i) => {
    const key = `${keyBase}-${i}`;
    if (p.startsWith('`') && p.endsWith('`')) {
      return (
        <code key={key} style={codeStyle}>
          {p.slice(1, -1)}
        </code>
      );
    }
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={key} style={{ fontWeight: 800 }}>
          {p.slice(2, -2)}
        </strong>
      );
    }
    if ((p.startsWith('*') && p.endsWith('*')) || (p.startsWith('_') && p.endsWith('_'))) {
      return (
        <em key={key} style={{ fontStyle: 'italic' }}>
          {p.slice(1, -1)}
        </em>
      );
    }
    return <span key={key}>{p}</span>;
  });
}

type Block =
  | { kind: 'p'; lines: string[] }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] };

function toBlocks(md: string): Block[] {
  const blocks: Block[] = [];
  for (const rawLine of md.split('\n')) {
    const line = rawLine.replace(/\s+$/, '');
    if (!line.trim()) continue;
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    const last = blocks[blocks.length - 1];
    if (bullet) {
      if (last?.kind === 'ul') last.items.push(bullet[1]);
      else blocks.push({ kind: 'ul', items: [bullet[1]] });
    } else if (numbered) {
      if (last?.kind === 'ol') last.items.push(numbered[1]);
      else blocks.push({ kind: 'ol', items: [numbered[1]] });
    } else {
      if (last?.kind === 'p') last.lines.push(line);
      else blocks.push({ kind: 'p', lines: [line] });
    }
  }
  return blocks;
}

export default function Markdown({ children, style }: { children: string; style?: CSSProperties }) {
  const blocks = toBlocks(children || '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {blocks.map((b, i) => {
        if (b.kind === 'ul') {
          return (
            <ul key={i} style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {b.items.map((it, j) => (
                <li key={j}>{inline(it, `${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (b.kind === 'ol') {
          return (
            <ol key={i} style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {b.items.map((it, j) => (
                <li key={j}>{inline(it, `${i}-${j}`)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} style={{ margin: 0 }}>
            {b.lines.map((ln, j) => (
              <span key={j}>
                {inline(ln, `${i}-${j}`)}
                {j < b.lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
