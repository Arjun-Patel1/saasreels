import WebSocket from 'ws';
import { randomUUID } from 'crypto';

export interface TTSResult {
  audioBuffer: Buffer;
  mimeType: string;
}

export async function synthesizeEdgeNeuralTTS(
  text: string,
  voice = 'en-US-ChristopherNeural',
  rate = '+5%'
): Promise<TTSResult> {
  return new Promise((resolve, reject) => {
    const endpoint =
      'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4';

    const ws = new WebSocket(endpoint, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
      },
    });

    const audioChunks: Buffer[] = [];
    const reqId = randomUUID().replace(/-/g, '');

    const timeout = setTimeout(() => {
      ws.close();
      if (audioChunks.length > 0) {
        resolve({
          audioBuffer: Buffer.concat(audioChunks),
          mimeType: 'audio/mp3',
        });
      } else {
        reject(new Error('Edge Neural TTS timed out'));
      }
    }, 10000);

    ws.on('open', () => {
      // 1. Send speech config
      const configMsg =
        `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
        JSON.stringify({
          context: {
            synthesis: {
              audio: {
                metadataoptions: {
                  sentenceBoundaryEnabled: 'false',
                  wordBoundaryEnabled: 'true',
                },
                outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
              },
            },
          },
        });
      ws.send(configMsg);

      // 2. Send SSML payload
      const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const ssml =
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>` +
        `<voice name='${voice}'>` +
        `<prosody rate='${rate}' pitch='+0Hz'>${escapedText}</prosody>` +
        `</voice></speak>`;

      const ssmlMsg =
        `X-RequestId:${reqId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`;
      ws.send(ssmlMsg);
    });

    ws.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
      if (isBinary && Buffer.isBuffer(data)) {
        // Binary message format: 2 bytes header length + header text + raw binary audio
        const headerLen = data.readUInt16BE(0);
        if (data.length > headerLen + 2) {
          const header = data.subarray(2, headerLen + 2).toString('utf-8');
          if (header.includes('Path:audio')) {
            const audioData = data.subarray(headerLen + 2);
            audioChunks.push(audioData);
          }
        }
      } else {
        const textMsg = data.toString('utf-8');
        if (textMsg.includes('Path:turn.end')) {
          clearTimeout(timeout);
          ws.close();
          const fullAudio = Buffer.concat(audioChunks);
          resolve({
            audioBuffer: fullAudio,
            mimeType: 'audio/mp3',
          });
        }
      }
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      if (audioChunks.length > 0) {
        resolve({
          audioBuffer: Buffer.concat(audioChunks),
          mimeType: 'audio/mp3',
        });
      } else {
        reject(err);
      }
    });
  });
}
