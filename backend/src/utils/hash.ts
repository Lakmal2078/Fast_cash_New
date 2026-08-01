import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  const visible = accountNumber.slice(-4);
  const masked = '*'.repeat(Math.min(accountNumber.length - 4, 8));
  return masked + visible;
}

export function encryptAccountNumber(accountNumber: string): string {
  // Simple reversible encoding (in production use proper encryption like AES-256)
  return Buffer.from(accountNumber).toString('base64');
}

export function decryptAccountNumber(encrypted: string): string {
  return Buffer.from(encrypted, 'base64').toString('utf-8');
}
