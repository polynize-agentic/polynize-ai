import { NO_EM_DASH_INSTRUCTION } from '../em-dash';
import { completeWithKimi } from './kimi';
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
 * Single entry point for LLM calls. Default provider is Kimi (Moonshot).
 *
 * Override via LLM_PROVIDER:
 *   - 'kimi'                   → Moonshot (default, model defaults to moonshot-v1-128k)
 *   - 'openai'                 → OpenAI (model defaults to gpt-4o)
 *   - 'minimax' | 'openrouter' → Minimax via OpenRouter
 *
 * Every call gets the em-dash prohibition appended to the system prompt
 * regardless of provider. The provider abstraction is one-file-thick so
 * future swaps (Anthropic, Mistral, etc.) are trivial.
 */
export async function complete(args: CompleteArgs): Promise<string> {
  const provider = process.env.LLM_PROVIDER ?? 'kimi';
  const system = `${args.system}\n\n${NO_EM_DASH_INSTRUCTION}`;

  switch (provider) {
    case 'kimi':
    case 'moonshot':
      return completeWithKimi({ ...args, system });
    case 'openai':
      return completeWithOpenAI({ ...args, system });
    case 'minimax':
    case 'openrouter':
      return completeWithOpenRouter({ ...args, system });
    default:
      throw new Error(`Unknown LLM_PROVIDER: ${provider}`);
  }
}
