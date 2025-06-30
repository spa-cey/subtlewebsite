import crypto from 'crypto';

// Use environment variable or fallback to a default key (should be changed in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);
const IV_LENGTH = 16; // For AES, this is always 16
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts a text string using AES-256-CBC
 * @param text - The plain text to encrypt
 * @returns The encrypted text in format: iv:encryptedData (both hex encoded)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'utf-8'),
    iv
  );

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a text string that was encrypted with the encrypt function
 * @param text - The encrypted text in format: iv:encryptedData
 * @returns The decrypted plain text
 */
export function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'utf-8'),
    iv
  );

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

/**
 * Hash a string using SHA-256
 * @param text - The text to hash
 * @returns The hashed text in hex format
 */
export function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}