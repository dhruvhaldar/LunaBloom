import axios from 'axios';
import { generateChatResponse } from '../aiService';
import { AIModel } from '@/constants/AIModels';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('generateChatResponse', () => {
  const mockMessages = [{ role: 'user' as const, content: 'Hello' }];

  it('should call OpenAI API correctly', async () => {
    const model: AIModel = {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5',
      provider: 'OpenAI',
      isFree: false,
      compatibility: 'openai',
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: 'Hello there!' } }]
      }
    });

    const response = await generateChatResponse(model, mockMessages, 'test-key', 'https://api.openai.com/v1');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: mockMessages,
        temperature: 0.7,
        max_tokens: 150,
      },
      expect.any(Object)
    );
    expect(response).toBe('Hello there!');
  });

  it('should call Hugging Face API correctly', async () => {
    const model: AIModel = {
      id: 'llama-3',
      name: 'Llama 3',
      provider: 'Hugging Face',
      isFree: true,
      compatibility: 'huggingface',
      apiUrl: 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct',
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: [{ generated_text: 'Hello there!' }]
    });

    const response = await generateChatResponse(model, mockMessages, 'test-key');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct',
      expect.objectContaining({
        inputs: expect.stringContaining('User: Hello'),
      }),
      expect.any(Object)
    );
    expect(response).toBe('Hello there!');
  });
});
