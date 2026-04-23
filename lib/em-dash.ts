const EM_DASH = /\u2014/g;

export function stripEmDashes(input: string): string {
  return input.replace(EM_DASH, ', ');
}

export const NO_EM_DASH_INSTRUCTION =
  'Never use the em-dash character (U+2014). Use a comma, a period, or a pair of commas instead. This is a strict brand voice rule.';
