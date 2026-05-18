// pages/api/mirror.js
// Gemini image editing + rate limit 3x/hari per IP via Upstash Redis

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
    bodyParser: false,
    responseLimit: false,
  },
};

async function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';
      const boundaryMatch = contentType.match(/boundary=(.+)$/);
      if (!boundaryMatch) return reject(new Error('Invalid content-type'));
      const boundary = '--' + boundaryMatch[1];
      const parts = [];
      const bodyStr = body.toString('binary');
      const rawParts = bodyStr.split(boundary);
      for (const part of rawParts) {
        if (!part || part === '--\r\n' || part.trim() === '--') continue;
        const [rawHeaders, ...rawBodyParts] = part.split('\r\n\r\n');
        if (!rawHeaders) continue;
        const bodyContent = rawBodyParts.join('\r\n\r\n').replace(/\r\n$/, '');
        const nameMatch = rawHeaders.match(/name="([^"]+)"/);
        const filenameMatch = rawHeaders.match(/filename="([^"]+)"/);
        const ctMatch = rawHeaders.match(/Content-Type:\s*([^\r\n]+)/i);
        if (!nameMatch) continue;
        parts.push({
          name: nameMatch[1],
          filename: filenameMatch?.[1] || null,
          contentType: ctMatch?.[1]?.trim() || 'text/plain',
          data: filenameMatch ? Buffer.from(bodyContent, 'binary') : bodyContent.trim(),
        });
      }
      resolve(parts);
    });
    req.on('error', reject);
  });
}

function getIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit check
  const ip = getIP(req);
  const today = new Date().toISOString().slice(0, 10);
  const rateKey = `mirror:${ip}:${today}`;

  try {
    const count = await redis.get(rateKey);
    const used = parseInt(count || '0');

    if (used >= 3) {
      return res.status(429).json({
        error: 'Limit harian tercapai. Kamu sudah menggunakan 3x hari ini. Coba lagi besok.',
        limit: 3,
        used,
      });
    }

    // Parse uploaded file
    const parts = await parseFormData(req);
    const filePart = parts.find(p => p.name === 'file');
    if (!filePart?.data) {
      return res.status(400).json({ error: 'File tidak ditemukan.' });
    }

    const base64Image = filePart.data.toString('base64');
    const mimeType = filePart.contentType || 'image/jpeg';

    // Call Gemini API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image,
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

    // Increment rate limit counter (TTL 24 jam)
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
