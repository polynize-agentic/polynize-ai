import type { Metadata } from 'next';
import { ConsoleApp } from './_components/ConsoleApp';

export const metadata: Metadata = {
  title: 'Agent Team Console · polynize.ai',
  description:
    'A lifelike demo of the Polynize Agent Team Console. Multi-agent workspace for a mid-sized law firm.',
  robots: { index: false, follow: false },
};

export default function ConsolePage() {
  return <ConsoleApp />;
}
