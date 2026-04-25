// components/AudioExtractor.js
// Mengekstrak audio dari video URL menggunakan Web Audio API (browser-side)
// Tidak butuh FFmpeg, tidak butuh API berbayar.
// Cara kerja:
//   1. Fetch video lewat proxy /api/extract-audio (bypass CORS)
//   2. Decode audio track via AudioContext.decodeAudioData()
//   3. Encode ke WAV di memory
//   4. Trigger download ke user
//
// Keterbatasan: Output format WAV (bukan MP3). Ukuran lebih besar dari MP3
// tapi 100% browser-native tanpa library tambahan.

import { useState } from 'react';

// ── WAV Encoder (pure JS) ──────────────────────────────────────────────────
function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate  = buffer.sampleRate;
  const format      = 1; // PCM
  const bitDepth    = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign     = numChannels * bytesPerSample;
  const byteRate       = sampleRate * blockAlign;
  const dataSize       = buffer.length * blockAlign;
  const totalSize      = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);           // PCM chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave channels → 16-bit PCM
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 32768 : sample * 32767, true);
      offset += 2;
    }
  }
  return arrayBuffer;
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
// ────────────────────────────────────────────────────────────────────────────

export default function AudioExtractor({ videoUrl, filename = 'meg-audio', label = 'Extract Audio' }) {
  const [status, setStatus] = useState('idle'); // idle | fetching | decoding | done | error
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleExtract = async () => {
    if (!videoUrl) return;
    setStatus('fetching');
    setProgress(0);
    setErrorMsg('');

    try {
      // 1. Fetch via proxy (bypass CORS)
      const proxyUrl = `/api/extract-audio?url=${encodeURIComponent(videoUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`Gagal fetch video (${res.status})`);

      // Stream → Uint8Array dengan progress tracking
      const contentLength = res.headers.get('Content-Length');
      const total = contentLength ? parseInt(contentLength) : 0;
      const reader = res.body.getReader();
      const chunks = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total > 0) setProgress(Math.round((received / total) * 60)); // 0-60%
      }

      const videoData = new Uint8Array(received);
      let pos = 0;
      for (const chunk of chunks) { videoData.set(chunk, pos); pos += chunk.length; }

      setStatus('decoding');
      setProgress(70);

      // 2. Decode audio menggunakan Web Audio API
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(videoData.buffer.slice(0));
      audioCtx.close();

      setProgress(90);

      // 3. Encode ke WAV
      const wavBuffer = audioBufferToWav(audioBuffer);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);

      // 4. Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.wav`;
      a.click();
      URL.revokeObjectURL(url);

      setStatus('done');
      setProgress(100);
      setTimeout(() => { setStatus('idle'); setProgress(0); }, 3000);

    } catch (err) {
      console.error('[AudioExtractor]', err);
      setErrorMsg(err.message || 'Gagal mengekstrak audio.');
      setStatus('error');
    }
  };

  const isBusy = status === 'fetching' || status === 'decoding';

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        className="btn-outline"
        onClick={handleExtract}
        disabled={isBusy || !videoUrl}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {/* Progress bar background */}
        {isBusy && (
          <span style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${progress}%`,
            background: 'rgba(255,255,255,0.07)',
            transition: 'width 0.4s ease',
            pointerEvents: 'none',
          }} />
        )}

        {status === 'idle'    && <><i className="fa-solid fa-music" /> {label}</>}
        {status === 'fetching' && <><span className="spinner" /> Mengunduh... {progress}%</>}
        {status === 'decoding' && <><span className="spinner" /> Memproses audio...</>}
        {status === 'done'    && <><i className="fa-solid fa-check" style={{ color: '#50e0a0' }} /> Selesai!</>}
        {status === 'error'   && <><i className="fa-solid fa-triangle-exclamation" /> Coba lagi</>}
      </button>

      {status === 'error' && errorMsg && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#ff6060', marginTop: '0.3rem', maxWidth: '260px' }}>
          {errorMsg}
        </p>
      )}

      {status === 'done' && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#50e0a0', marginTop: '0.3rem' }}>
          Audio (.wav) berhasil didownload!
        </p>
      )}
    </div>
  );
}
