import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distServerUrl = pathToFileURL(join(__dirname, '../dist/server/server.js')).href;

function normalizeHeaders(headers) {
  const normalized = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        normalized.append(key, item);
      }
    } else {
      normalized.set(key, value);
    }
  }
  return normalized;
}

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const headers = normalizeHeaders(req.headers);
  const requestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    requestInit.body = req;
  }

  const request = new Request(url.toString(), requestInit);
  const serverModule = await import(distServerUrl);
  const response = await serverModule.default.fetch(request, undefined, undefined);

  res.statusCode = response.status;
  for (const [key, value] of response.headers) {
    if (key.toLowerCase() === 'transfer-encoding') continue;
    res.setHeader(key, value);
  }

  const bodyBuffer = Buffer.from(await response.arrayBuffer());
  res.end(bodyBuffer);
}
