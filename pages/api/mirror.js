// pages/api/mirror.js
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const PROMPT = `Create an image using the original face from the reference photo without changing facial structure, skin tone, or identity. The face must remain identical, natural, and realistic (not AI-generated looking).

Camera angle / shot composition:
Mirror selfie on a MacBook screen, medium close-up shot (chest-up framing), slightly tilted framing (subtle tilt), primary focus on the laptop screen, realistic perspective as if photographed with a phone from in front of the screen.

Outfit:
Oversized black cotton fleece hoodie, hood worn up, no large logos, relaxed loose fit.

Pose:
Head slightly lowered and tilted, hair partially covering the eyes, right hand relaxed naturally, left hand holding an iPhone as if taking a mirror selfie, cool and relaxed expression, not overly posed.

Environment:
Minimalist room with dim lighting, background featuring vertical wall panels and marble texture. On the MacBook screen, a Photo Booth window is visible, with the Spotify app open beside it.

Lighting:
Light coming from the MacBook screen (soft cool light) combined with subtle warm indoor ambient lighting. Natural look, no cinematic effects, no bokeh, facial details remain sharp and realistic.

Aspect ratio: 3:4

Negative prompt:
worst quality, low quality, lowres, blurry, ugly, distorted, deformed, watermark, text, signature, bad anatomy, bad hands, missing fingers, extra limbs, fused fingers, distorted face, plastic skin, unrealistic reflection.`;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

function getIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getIP(req);
  const today = new Date().toISOString().slice(0, 10);
  const rateKey = `mirror:${ip}:${today}`;

  try {
    // Rate limit check
    const count = await redis.get(rateKey);
    const used = parseInt(count || '0');

    if (used >= 3) {
      return res.status(429).json({
        error: 'Limit harian tercapai. Kamu sudah 3x hari ini. Coba lagi besok.',
        limit: 3,
        used,
      });
    }

    // Get base64 image from body
    const { image, mimeType } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Gambar tidak ditemukan.' });
    }

    // Call Gemini API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: mimeType || 'image/jpeg',
                  data: image,
                },
              },
              { text: PROMPT },
            ],
          }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json();
      throw new Error(err?.error?.message || `Gemini error: ${geminiRes.status}`);
    }

    const data = await geminiRes.json();
    const imagePart = data?.candidates?.[0]?.content?.parts?.find(
      p => p.inline_data?.mime_type?.startsWith('image/')
    );

    if (!imagePart) {
      throw new Error('Gemini tidak menghasilkan gambar. Coba lagi.');
    }

    await redis.set(rateKey, used + 1, { ex: 86400 });

    return res.status(200).json({
      result: `data:${imagePart.inline_data.mime_type};base64,${imagePart.inline_data.data}`,
      used: used + 1,
      limit: 3,
    });

  } catch (err) {
    console.error('[Mirror Error]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
