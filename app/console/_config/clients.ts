export const CONSOLE_CLIENTS = [
  'newkind',
  'remynd',
  'everstock',
  'roxburys',
] as const;

export type ClientSlug = (typeof CONSOLE_CLIENTS)[number];
