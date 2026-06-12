/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to convert base64 PCM to AudioBuffer for playback inside a 24000Hz browser context
export async function playRawPcmBase64(
  base64Data: string, 
  sampleRate: number = 24000
): Promise<AudioBufferSourceNode> {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate
  });

  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Raw PCM is 16-bit signed integer little-endian (2 bytes per sample value)
  const bufferLen = len / 2;
  const floatData = new Float32Array(bufferLen);
  const dataView = new DataView(bytes.buffer);

  for (let i = 0; i < bufferLen; i++) {
    // 16-bit signed integer takes 2 bytes. Convert from -32768..32767 to -1.0..1.0 float range
    const int16Sample = dataView.getInt16(i * 2, true);
    floatData[i] = int16Sample / 32768.0;
  }

  const audioBuffer = audioCtx.createBuffer(1, bufferLen, sampleRate);
  audioBuffer.copyToChannel(floatData, 0);

  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.start(0);

  return source;
}
