
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const togetherApiKey = Deno.env.get('TOGETHER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, userId } = await req.json();
    
    // Fetch stories from the vault for context
    let storiesContext = "";
    if (context?.vaultId && userId) {
      const { data: stories, error } = await supabase
        .from('stories')
        .select('title, content, author, created_at')
        .eq('vault_id', context.vaultId)
        .eq('user_id', userId);
      
      if (!error && stories && stories.length > 0) {
        storiesContext = `\n\nHere are the stories currently in the "${context.vaultName}" family vault:\n` +
        stories.map(story => 
          `Title: "${story.title}"\nAuthor: ${story.author}\nDate: ${new Date(story.created_at).toLocaleDateString()}\nContent: ${story.content.substring(0, 500)}${story.content.length > 500 ? '...' : ''}\n`
        ).join('\n---\n');
      }
    }

    const systemPrompt = `You are a helpful AI assistant specialized in family history and storytelling. You help families preserve their memories by:
    - Suggesting story ideas and memory prompts
    - Helping organize family history information
    - Providing creative writing assistance for family stories
    - Offering guidance on preserving family memories
    - Answering questions about existing stories in their vault
    
    Keep your responses warm, encouraging, and family-focused. Be concise but helpful.
    
    Context: The user is working with their family vault "${context?.vaultName || 'family memories'}".${storiesContext}`;

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${togetherApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'TogetherAI API error');
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
