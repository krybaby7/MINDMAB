import { DeepseekMessage, DeepseekResponse, MindMapData } from './types';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-aa6acb0f4b134fc49e90d80d64f0f950';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

const systemPrompt = `Create a mind map structure for studying. Format the response as JSON with the following structure:
{
  "nodes": [
    { "id": "string", "label": "string" }
  ],
  "edges": [
    { "id": "string", "source": "string", "target": "string" }
  ]
}
Follow these guidelines:
1. Keep node labels concise and clear
2. Create a hierarchical structure
3. Use meaningful relationships
4. Include 5-10 key concepts
5. Ensure all node IDs are unique
6. Ensure all edges connect existing nodes`;

export class DeepseekService {
  private async makeRequest(messages: DeepseekMessage[]): Promise<DeepseekResponse> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  public async generateMindMap(topic: string): Promise<MindMapData> {
    try {
      const messages: DeepseekMessage[] = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Create a mind map for studying ${topic}. Include main concepts and their relationships.`,
        },
      ];

      const response = await this.makeRequest(messages);
      const content = response.choices[0].message.content;

      try {
        const parsedData = JSON.parse(content);
        
        // Validate the response structure
        if (!Array.isArray(parsedData.nodes) || !Array.isArray(parsedData.edges)) {
          throw new Error('Invalid mind map data structure');
        }

        // Ensure all required fields are present
        parsedData.nodes.forEach((node: any) => {
          if (!node.id || !node.label) {
            throw new Error('Invalid node data');
          }
        });

        parsedData.edges.forEach((edge: any) => {
          if (!edge.id || !edge.source || !edge.target) {
            throw new Error('Invalid edge data');
          }
        });

        return parsedData as MindMapData;
      } catch (e) {
        console.error('Failed to parse API response:', e);
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error generating mind map:', error);
      throw error;
    }
  }

  public async refineMindMap(topic: string, feedback: string): Promise<MindMapData> {
    try {
      const messages: DeepseekMessage[] = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Create a mind map for studying ${topic}. ${feedback}`,
        },
      ];

      const response = await this.makeRequest(messages);
      const content = response.choices[0].message.content;

      try {
        return JSON.parse(content) as MindMapData;
      } catch (e) {
        console.error('Failed to parse API response:', e);
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error refining mind map:', error);
      throw error;
    }
  }
}

export const deepseekService = new DeepseekService();
