import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ESM (this file is in server/, so .. points to project root)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load .env from project root, regardless of which directory `node` is run from
dotenv.config({ path: path.join(__dirname, '..', '.env') });


const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50kb' })); // Allow full gameState payload

// Rate limit: 20 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', apiLimiter);

// Simple sanitization helper
const sanitize = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim().substring(0, 500);
};

const SYSTEM_PROMPT = `You are Star, a seasoned Indian election campaign manager 
with 25 years of experience across Lok Sabha and Vidhan Sabha 
elections. You have worked in Tamil Nadu, UP, Maharashtra and Delhi. 
You speak to first-time candidates with warmth, directness, and 
real experience.

Your personality:
- Warm but no-nonsense. You have seen booth capturing, 
  coalition collapses, and midnight counting drama.
- You explain Indian election laws clearly — RPA 1951, 
  ECI guidelines, Model Code of Conduct, NOTA, EVM process
- You cite real Indian elections: 2024 Lok Sabha, 2019 results,
  state elections, historic moments
- Keep every explanation under 80 words — punchy, not a lecture
- Always connect the game moment to the real Indian election parallel
- You are strictly nonpartisan — explain all parties fairly
- Reference the Election Commission of India (ECI) as the authority
- Use Indian currency (₹) and Indian terms throughout
- End each message with one practical tip the candidate can use now

Format every response as JSON only, no extra text:
{
  "message": "string",          // explanation under 80 words
  "realWorldFact": "string",    // one specific Indian election law or fact
  "tip": "string",              // one actionable tip for this moment
  "mood": "encouraging" | "urgent" | "warning" | "celebrating"
}`;

app.post('/api/campaign-manager', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    // Input sanitization
    const scene = sanitize(req.body.scene);
    const context = sanitize(req.body.context);
    const playerDecision = sanitize(req.body.playerDecision);
    // basic sanitization of gameState
    const gameStateStr = req.body.gameState ? JSON.stringify(req.body.gameState).substring(0, 1000) : '';

    const promptText = `
Scene: ${scene}
Context: ${context}
Player Decision: ${playerDecision}
Game State Summary: ${gameStateStr}

Respond with strictly valid JSON using the requested schema.
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`, {      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: promptText }] }
        ],
        systemInstruction: {
          role: 'system',
          parts: [{ text: SYSTEM_PROMPT }]
        },
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errTxt = await response.text();
      console.error('Gemini API Error:', errTxt);
      return res.status(response.status).json({ error: 'Failed to fetch from Gemini API' });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse the JSON string from Gemini
    let resultJson;
    try {
      resultJson = JSON.parse(generatedText);
    } catch (parseError) {
      // Sometimes Gemini might wrap in markdown ```json ... ```
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
      resultJson = JSON.parse(cleanedText);
    }

    res.json(resultJson);
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Request to Gemini API timed out' });
    }
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve the static React frontend from the 'dist' directory in production
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Fallback all other routes to the React app's index.html for client-side routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
