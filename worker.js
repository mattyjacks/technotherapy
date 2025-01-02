// TechnoTherapy Cloudflare Worker

const API_KEY = "Matt";  // Authentication password
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,X-API-Key",
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: CORS_HEADERS,
      });
    }

    // Verify API key
    const apiKey = request.headers.get("X-API-Key");
    if (apiKey !== API_KEY) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS,
        },
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
            temperature: 0.7,
            max_tokens: 300,
          }),
        });

        const result = await completion.json();
        return new Response(JSON.stringify({ 
          response: result.choices[0].message.content 
        }), {
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
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
                content: "Analyze the emotional tone and key themes of this journal entry. Provide a brief, supportive response."
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
            ...CORS_HEADERS,
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
                content: "Generate a calming, mindful meditation prompt for relaxation and mental well-being."
              },
              { role: "user", content: "Generate a short meditation prompt" }
            ],
            temperature: 0.7,
            max_tokens: 200,
          }),
        });

        const result = await meditation.json();
        return new Response(JSON.stringify({ 
          prompt: result.choices[0].message.content 
        }), {
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
          },
        });
      }

      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS,
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS,
        },
      });
    }
  },
};
