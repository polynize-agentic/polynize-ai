import { NO_EM_DASH_INSTRUCTION } from '../em-dash';
import { completeWithOpenAI } from './openai';
import { completeWithOpenRouter } from './minimax';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export type CompleteArgs = {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
};

/**
 * Single entry point for LLM calls. Default provider is OpenAI (GPT-5.4).
 * Override via LLM_PROVIDER=minimax (or openrouter) to fall back to the
 * Minimax via OpenRouter path; the Minimax provider stays in the tree
 * in case we need to flip back.
 *
 * Every call gets the em-dash prohibition appended to the system prompt
 * regardless of provider. The provider abstraction is one-file-thick so
 * future swaps (Anthropic, Mistral, etc.) are trivial.
 */
export async function complete(args: CompleteArgs): Promise<string> {
  const provider = process.env.LLM_PROVIDER ?? 'openai';
  const system = `${args.system}\n\n${NO_EM_DASH_INSTRUCTION}`;

  switch (provider) {
    case 'openai':
      return completeWithOpenAI({ ...args, system });
    case 'minimax':
    case 'openrouter':
      return completeWithOpenRouter({ ...args, system });
    default:
      throw new Error(`Unknown LLM_PROVIDER: ${provider}`);
  }
}
