import axios from 'axios';
import { AIModel } from '@/constants/AIModels';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const generateChatResponse = async (
  model: AIModel,
  messages: ChatMessage[],
  apiKey?: string,
  baseUrl?: string
): Promise<string> => {
  if (model.compatibility === 'openai') {
    return generateOpenAIResponse(model, messages, apiKey, baseUrl);
  } else if (model.compatibility === 'huggingface') {
    return generateHuggingFaceResponse(model, messages, apiKey);
  }
  throw new Error('Unsupported model compatibility');
};

const generateOpenAIResponse = async (
  model: AIModel,
  messages: ChatMessage[],
  apiKey?: string,
  baseUrl?: string
): Promise<string> => {
  const url = `${baseUrl || 'https://api.openai.com/v1'}/chat/completions`;
  const response = await axios.post(
    url,
    {
      model: model.id,
      messages: messages,
      temperature: 0.7,
      max_tokens: 150,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0]?.message?.content?.trim() || '';
};

const generateHuggingFaceResponse = async (
  model: AIModel,
  messages: ChatMessage[],
  apiKey?: string
): Promise<string> => {
  const url = model.apiUrl;
  if (!url) throw new Error('Model API URL is missing');

  // Hugging Face Inference API often expects a single string input for simple models,
  // or a specific chat template. For simplicity with "Instruct" models, we can construct a prompt.
  // However, some newer models on HF support the OpenAI format if running via TGI, but the public Inference API
  // usually takes inputs: { inputs: "string" }

  // Constructing a simple prompt from messages
  const prompt = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n') + '\nAssistant:';

  const response = await axios.post(
    url,
    {
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        return_full_text: false,
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // HF Inference API returns an array of objects
  if (Array.isArray(response.data) && response.data.length > 0) {
    return response.data[0].generated_text?.trim() || '';
  } else if (typeof response.data === 'object' && response.data.generated_text) {
     return response.data.generated_text.trim();
  }

  return '';
};
