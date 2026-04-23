import { NO_EM_DASH_INSTRUCTION } from '../em-dash';
import { completeWithOpenRouter } from './minimax';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export type CompleteArgs = {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
};

/**
 * Single entry point for LLM calls. Swap providers by flipping LLM_PROVIDER.
 * Every call gets the em-dash prohibition appended to the system prompt.
 */
export async function complete(args: CompleteArgs): Promise<string> {
  const provider = process.env.LLM_PROVIDER ?? 'minimax';
  const system = `${args.system}\n\n${NO_EM_DASH_INSTRUCTION}`;

  switch (provider) {
    case 'minimax':
    case 'openrouter':
      return completeWithOpenRouter({ ...args, system });
    default:
      throw new Error(`Unknown LLM_PROVIDER: ${provider}`);
  }
}
