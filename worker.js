// TechnoTherapy Cloudflare Worker

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://technotherapy.pages.dev",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Chat endpoint
      if (path === "/api/chat" && request.method === "POST") {
        const { message } = await request.json();
        
        const completion = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "You are an empathetic and supportive AI therapy assistant. Your responses should be compassionate, non-judgmental, and focused on helping the user process their thoughts and feelings. Never provide medical advice or diagnoses."
              },
              { role: "user", content: message }
            ],
          }),
        });

        const result = await completion.json();
        return new Response(JSON.stringify({ 
          response: result.choices[0].message.content 
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }

      // Journal endpoint
      if (path === "/api/journal" && request.method === "POST") {
        const { content, mood } = await request.json();
        
        const analysis = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: `You are an empathetic AI therapist analyzing a journal entry. 
                The user's current mood is: ${mood || 'not specified'}. 
                Provide a thoughtful, supportive response that:
                1. Acknowledges their current emotional state
                2. Identifies key themes or patterns
                3. Offers gentle validation and support
                4. If appropriate, suggests a simple coping strategy
                Keep your response concise but meaningful, even for short entries.`
              },
              { role: "user", content }
            ],
            temperature: 0.7,
            max_tokens: 150,
          }),
        });

        const result = await analysis.json();
        return new Response(JSON.stringify({ 
          success: true,
          analysis: result.choices[0].message.content 
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }

      // Meditation endpoint
      if (path === "/api/meditation" && request.method === "GET") {
        const meditation = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "Generate a very brief, calming meditation prompt. Focus on immediate, present-moment awareness. Use simple, soothing language. Keep it under 50 words."
              },
              { role: "user", content: "Generate a short, peaceful meditation prompt for the present moment." }
            ],
            temperature: 0.7,
            max_tokens: 50,
          }),
        });

        const result = await meditation.json();
        return new Response(JSON.stringify({ 
          prompt: result.choices[0].message.content 
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }

      // Return 404 for any other paths
      return new Response("Not Found", { 
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
  },
};
