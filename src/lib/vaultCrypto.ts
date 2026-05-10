// Vault client-side encryption helpers (Web Crypto API).
// Master key never leaves memory. Salt is per-user, stored in profiles.vault_salt
// (not secret). PBKDF2-SHA256 -> AES-GCM. Random IV per record.

const PBKDF2_ITERATIONS = 210_000;
const ENVELOPE_VERSION = 1;

export type EncryptedEnvelope = {
  v: number;
  alg: "AES-GCM";
  kdf: "PBKDF2-SHA256";
  iterations: number;
  iv: string; // base64
  ciphertext: string; // base64
};

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64encode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s);
}

function b64decode(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function deriveVaultKey(masterKey: string, saltB64: string): Promise<CryptoKey> {
  const salt = b64decode(saltB64);
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(masterKey),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptPassword(plain: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    enc.encode(plain) as BufferSource
  );
  const env: EncryptedEnvelope = {
    v: ENVELOPE_VERSION,
    alg: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iterations: PBKDF2_ITERATIONS,
    iv: b64encode(iv),
    ciphertext: b64encode(ciphertext),
  };
  return JSON.stringify(env);
}

export async function decryptPassword(payload: string, key: CryptoKey): Promise<string> {
  const env = JSON.parse(payload) as EncryptedEnvelope;
  const iv = b64decode(env.iv);
  const ct = b64decode(env.ciphertext);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, ct);
  return dec.decode(plain);
}

export function isEncryptedPayload(value: string | null | undefined): boolean {
  if (!value || typeof value !== "string") return false;
  if (value[0] !== "{") return false;
  try {
    const obj = JSON.parse(value);
    return (
      obj &&
      typeof obj === "object" &&
      obj.alg === "AES-GCM" &&
      typeof obj.iv === "string" &&
      typeof obj.ciphertext === "string"
    );
  } catch {
    return false;
  }
}
