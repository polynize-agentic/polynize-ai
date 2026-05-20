export type BlueprintSection = {
  id: string;
  title: string;
  content: string;
};

export type ParsedBlueprint = {
  preamble: {
    title: string;
    intro: string;
  };
  sections: BlueprintSection[];
};

const SECTION_MARKER = /<!-- section:([a-z0-9-]+) -->/;

function extractPreamble(text: string): { title: string; intro: string } {
  const lines = text.split('\n');
  let title = '';
  let titleLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^# (.+)$/);
    if (m) {
      title = m[1].trim();
      titleLineIndex = i;
      break;
    }
  }

  if (titleLineIndex === -1) {
    return { title: '', intro: text.trim() };
  }

  const before = lines.slice(0, titleLineIndex);
  const after = lines.slice(titleLineIndex + 1);
  return { title, intro: [...before, ...after].join('\n').trim() };
}

function extractSection(id: string, body: string): BlueprintSection {
  const lines = body.split('\n');
  let title = id;
  let titleLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^## (.+)$/);
    if (m) {
      title = m[1].trim();
      titleLineIndex = i;
      break;
    }
  }

  const content =
    titleLineIndex === -1
      ? body.trim()
      : lines.slice(titleLineIndex + 1).join('\n').trim();

  return { id, title, content };
}

export function parseBlueprint(markdown: string): ParsedBlueprint {
  // String.split with a capture group returns [preamble, id1, body1, id2, body2, ...]
  const parts = markdown.split(SECTION_MARKER);

  const preamble = extractPreamble(parts[0] ?? '');

  const sections: BlueprintSection[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const id = parts[i];
    const body = parts[i + 1] ?? '';
    sections.push(extractSection(id, body));
  }

  return { preamble, sections };
}
