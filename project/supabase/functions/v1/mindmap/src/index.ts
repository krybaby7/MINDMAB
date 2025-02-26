import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { deepseekService } from './deepseek';
import { GenerateMindMapRequest, GenerateMindMapResponse } from './types';

console.log(`Function "mindmap" up and running!`);

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { pathname } = new URL(req.url);

    // Health check
    if (pathname === '/health' && req.method === 'GET') {
      return new Response(
        JSON.stringify({ status: 'ok' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Generate mind map
    if (pathname === '/generate' && req.method === 'POST') {
      const { topic, layout = 'hierarchical' } = await req.json() as GenerateMindMapRequest;

      if (!topic) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Topic is required',
          } as GenerateMindMapResponse),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      const mindMapData = await deepseekService.generateMindMap(topic);

      return new Response(
        JSON.stringify({
          success: true,
          data: mindMapData,
        } as GenerateMindMapResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Refine mind map
    if (pathname === '/refine' && req.method === 'POST') {
      const { topic, feedback } = await req.json();

      if (!topic || !feedback) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Topic and feedback are required',
          } as GenerateMindMapResponse),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      const mindMapData = await deepseekService.refineMindMap(topic, feedback);

      return new Response(
        JSON.stringify({
          success: true,
          data: mindMapData,
        } as GenerateMindMapResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Not Found',
      } as GenerateMindMapResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      } as GenerateMindMapResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
