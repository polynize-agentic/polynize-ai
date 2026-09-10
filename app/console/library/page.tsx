import { redirect } from 'next/navigation';

/**
 * pam.polynize.ai/library IS THE LEARNINGS LIBRARY (D115). Marrs: "a private page maybe at
 * pam.polynize.ai/library for the internal team." The pam host rewrites every path onto /console,
 * so this address lands here and goes straight to the library screen. The public one is
 * polynize.ai/library. Nothing else lives at this address.
 */
export default function ConsoleLibraryRedirect() {
  redirect('/console/marketing/learnings');
}
