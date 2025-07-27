import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY); // Check if API key is defined

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { productName, reviews } = req.body;

  if (!productName || !Array.isArray(reviews)) {
    return res.status(400).json({ error: 'Missing productName or reviews array' });
  }

  const prompt = `
You are an intelligent review summarizer. Based on the reviews provided for the product "${productName}", respond ONLY with a strict JSON object in the following format — no markdown, no commentary:

{
  "category": "string",
  "features": {
    "FeatureName": {
      "positive": [ "string" ],
      "negative": [ "string" ],
      "mentions": number
    }
  },
  "mostAppreciated": [ "string" ],
  "leastAppreciated": [ "string" ],
  "overallSentiment": "positive" | "neutral" | "negative"
}

Here are the reviews:

${reviews.map((r: any, i: number) => `${i + 1}. ${r.review_text}`).join("\n")}

REMEMBER: Respond ONLY with valid JSON. DO NOT include markdown or commentary. DO NOT explain anything.
`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    console.log('Raw Gemini response:', JSON.stringify(data, null, 2));
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let cleaned = text.trim();
    const jsonMatch = cleaned.match(/```json\s*([\s\S]*?)\s*```/);

    if (jsonMatch) {
      cleaned = jsonMatch[1].trim();
    } else {
      cleaned = cleaned.replace(/```/g, '').trim();
    }

    try {
      const parsed = JSON.parse(cleaned);
      return res.status(200).json({ analysis: parsed });
    } catch (err) {
      console.error('❌ Failed to parse JSON:', cleaned, err);
      return res.status(500).json({ error: 'Invalid JSON from Gemini' });
    }
  } catch (err) {
    console.error('❌ Gemini API fetch error:', err);
    return res.status(500).json({ error: 'Failed to generate analysis' });
  }
}
