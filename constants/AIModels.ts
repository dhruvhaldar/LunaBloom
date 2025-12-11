export interface AIModel {
  id: string;
  name: string;
  provider: string;
  isFree: boolean;
  apiUrl?: string; // Optional override for API URL
  compatibility: 'openai' | 'huggingface'; // To handle different API formats if needed
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    isFree: false,
    compatibility: 'openai',
  },
  {
    id: 'meta-llama/Meta-Llama-3-8B-Instruct',
    name: 'Llama 3 8B (Hugging Face)',
    provider: 'Hugging Face',
    isFree: true,
    compatibility: 'huggingface',
    apiUrl: 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct',
  },
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.2',
    name: 'Mistral 7B (Hugging Face)',
    provider: 'Hugging Face',
    isFree: true,
    compatibility: 'huggingface',
    apiUrl: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
  }
];

export const DEFAULT_MODEL_ID = 'gpt-3.5-turbo';
