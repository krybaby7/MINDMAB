const DEEPSEEK_API_KEY = 'sk-aa6acb0f4b134fc49e90d80d64f0f950';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface DeepseekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }[];
}

const systemPrompt = `Create a mind map structure for studying. Format the response as JSON with the following structure:
{
  "nodes": [
    { "id": "string", "label": "string" }
  ],
  "edges": [
    { "id": "string", "source": "string", "target": "string" }
  ]
}
Keep the content concise and focused on key concepts.`;

export const generateMindMap = async (topic: string) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Create a mind map for studying ${topic}. Include main concepts and their relationships.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data: DeepseekResponse = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse API response:', e);
      throw new Error('Invalid response format from API');
    }
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw error;
  }
};
