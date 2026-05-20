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

// ============================================================
// Section-specific parsers — return null if structure doesn't match
// ============================================================

export type CapabilityRow = {
  id: string;
  capability: string;
  human: boolean;
  hybrid: boolean;
  agent: boolean;
  owner: string;
};

export type CapabilityGroup = {
  title: string;
  rows: CapabilityRow[];
};

export type CapabilityMapUnit = {
  groups: CapabilityGroup[];
};

export type AgentCapabilityCard = {
  name: string;
  roleParts: string[];
  description: string;
  capabilities: string[];
  isHuman: boolean;
};

export type GapRegisterRow = {
  id: string;
  question: string;
  owner: string;
  blocks: string;
  status: string;
};

export type GapRegisterParsed = {
  rows: GapRegisterRow[];
  openCount: number;
  blockingCount: number;
};

export type AgentDescription = {
  name: string;
  role: string;
  description: string;
};

export type TeamOrgParsed = {
  agents: AgentDescription[];
  asciiChart: string | null;
};

function parseRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|\s*$/g, '')
    .split('|')
    .map((c) => c.trim());
}

function isSeparator(line: string): boolean {
  return /^\|[\s\-:|]+\|?\s*$/.test(line.trim());
}

type ParsedTable = { headers: string[]; rows: string[][] };

function parseMarkdownTable(text: string): ParsedTable | null {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|'));
  if (lines.length < 2 || !isSeparator(lines[1])) return null;
  return {
    headers: parseRow(lines[0]),
    rows: lines.slice(2).map(parseRow),
  };
}

export function parseCapabilityMapUnit(content: string): CapabilityMapUnit | null {
  const chunks = content.split(/\n(?=### )/);
  const groups: CapabilityGroup[] = [];

  for (const chunk of chunks) {
    if (!chunk.trim().startsWith('### ')) continue;
    const lines = chunk.split('\n');
    const title = lines[0].replace(/^### /, '').trim();
    const tableText = lines.slice(1).join('\n');
    const table = parseMarkdownTable(tableText);
    if (!table || table.rows.length === 0) continue;

    const rows: CapabilityRow[] = table.rows.map((cells) => ({
      id: cells[0] ?? '',
      capability: cells[1] ?? '',
      human: (cells[2] ?? '').includes('●'),
      hybrid: (cells[3] ?? '').includes('●'),
      agent: (cells[4] ?? '').includes('●'),
      owner: cells[5] ?? '',
    }));

    groups.push({ title, rows });
  }

  if (groups.length === 0) return null;
  return { groups };
}

export function parseCapabilityMapAgent(content: string): AgentCapabilityCard[] | null {
  const chunks = content.split(/\n(?=### )/);
  const cards: AgentCapabilityCard[] = [];

  for (const chunk of chunks) {
    if (!chunk.trim().startsWith('### ')) continue;
    const lines = chunk.split('\n');
    const headerText = lines[0].replace(/^### /, '').trim();
    const parts = headerText.split(/\s*·\s*/);
    const name = parts[0] ?? '';
    const roleParts = parts.slice(1);
    const isHuman = roleParts.some((p) => /human/i.test(p));

    const descriptionLines: string[] = [];
    const capLines: string[] = [];
    let sawList = false;

    for (const raw of lines.slice(1)) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('- ')) {
        sawList = true;
        capLines.push(trimmed.slice(2).trim());
      } else if (!sawList) {
        descriptionLines.push(trimmed);
      }
    }

    if (!name) continue;

    cards.push({
      name,
      roleParts,
      description: descriptionLines.join(' '),
      capabilities: capLines,
      isHuman,
    });
  }

  if (cards.length === 0) return null;
  return cards;
}

export function parseGapRegister(content: string): GapRegisterParsed | null {
  const table = parseMarkdownTable(content);
  if (!table || table.rows.length === 0) return null;

  const rows: GapRegisterRow[] = table.rows.map((cells) => ({
    id: cells[0] ?? '',
    question: cells[1] ?? '',
    owner: cells[2] ?? '',
    blocks: cells[3] ?? '',
    status: (cells[4] ?? '').toLowerCase(),
  }));

  // Footer line: "**Status:** 11 gaps open · 5 blocking sign-off."
  const footerMatch = content.match(
    /\*\*Status:\*\*\s*(\d+)\s+gaps?\s+open\s*[·•]\s*(\d+)\s+blocking/i
  );
  const openCount = footerMatch
    ? Number(footerMatch[1])
    : rows.filter((r) => r.status === 'open').length;
  const blockingCount = footerMatch ? Number(footerMatch[2]) : 0;

  return { rows, openCount, blockingCount };
}

export function parseTeamOrg(content: string): TeamOrgParsed | null {
  // Extract first triple-backtick code block as the ASCII chart, if any.
  const codeFenceMatch = content.match(/```(?:\w*)?\n([\s\S]*?)```/);
  const asciiChart = codeFenceMatch ? codeFenceMatch[1].replace(/\n+$/, '') : null;

  // Match paragraphs starting with **Name** — Role. Description...
  // Em-dash, en-dash, or hyphen surrounded by spaces.
  const pattern = /^\*\*([^*]+)\*\*\s+[—–-]\s+([^.]+?)\.\s*(.+)$/gm;
  const agents: AgentDescription[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    agents.push({
      name: match[1].trim(),
      role: match[2].trim(),
      description: match[3].trim(),
    });
  }

  if (agents.length === 0) return null;
  return { agents, asciiChart };
}

export function extractBlueprintVersion(introMarkdown: string): string | null {
  const m = introMarkdown.match(/Auto-generated\s+(v\d+(?:\.\d+)?)/i);
  return m ? m[1] : null;
}
