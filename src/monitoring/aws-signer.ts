/**
 * Minimal AWS SigV4 signer for Cloudflare Workers.
 * Uses Web Crypto API (crypto.subtle) — no Node.js dependencies.
 */

const ALGORITHM = 'AWS4-HMAC-SHA256';

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmac(
  key: ArrayBuffer | string,
  data: string
): Promise<ArrayBuffer> {
  const keyBuffer =
    typeof key === 'string' ? new TextEncoder().encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
}

async function sha256(data: string): Promise<string> {
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(data)
  );
  return toHex(hash);
}

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export async function signAndFetch(
  url: string,
  body: string,
  credentials: AwsCredentials
): Promise<Response> {
  const { accessKeyId, secretAccessKey, region } = credentials;
  const service = 'sns';
  const parsedUrl = new URL(url);
  const host = parsedUrl.host;
  const path = parsedUrl.pathname || '/';

  const now = new Date();
  const dateStamp = now
    .toISOString()
    .replace(/[:-]|\.\d{3}/g, '')
    .slice(0, 8);
  const amzDate =
    now
      .toISOString()
      .replace(/[:-]|\.\d{3}/g, '')
      .slice(0, 15) + 'Z';

  const payloadHash = await sha256(body);

  const canonicalHeaders = `content-type:application/x-www-form-urlencoded\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-date';

  const canonicalRequest = [
    'POST',
    path,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    ALGORITHM,
    amzDate,
    credentialScope,
    await sha256(canonicalRequest),
  ].join('\n');

  const kDate = await hmac(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, 'aws4_request');
  const signature = toHex(await hmac(kSigning, stringToSign));

  const authorization = `${ALGORITHM} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Amz-Date': amzDate,
      Authorization: authorization,
    },
    body,
  });
}
