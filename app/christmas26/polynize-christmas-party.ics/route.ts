/**
 * The calendar file behind "Add to calendar" on /christmas26 (D128). Served as text/calendar and
 * inline, which is what makes an iPhone open its "Add to Calendar" sheet instead of saving a file.
 * The path has a dot, so middleware never sees it and it works on polynize.ai.
 */

import { icsFile } from '@/lib/christmas26/event';

export const dynamic = 'force-static';

export function GET() {
  return new Response(icsFile(), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="polynize-christmas-party.ics"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
