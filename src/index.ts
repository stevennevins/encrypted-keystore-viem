import {
    signMessage,
    signTransaction,
    signTypedData,
    privateKeyToAddress,
    toAccount
  } from 'viem/accounts'
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { createDecipheriv, pbkdf2Sync,createHash} from 'node:crypto';
dotenv.config();

export async function decryptKeystore(
  keystorePath: string,
  password: string
): Promise<string> {
  const keystore = JSON.parse(readFileSync(keystorePath, 'utf-8'));

  const { crypto } = keystore;
  const { cipher, ciphertext, cipherparams, kdf, kdfparams, mac } = crypto;

  let derivedKey: Buffer;

  if (kdf === 'pbkdf2') {
    const prf = kdfparams.prf === 'hmac-sha256' ? 'sha256' : 'sha1';
    derivedKey = pbkdf2Sync(
      Buffer.from(password),
      Buffer.from(kdfparams.salt, 'hex'),
      kdfparams.c,
      kdfparams.dklen,
      prf
    );
  } else {
    throw new Error(`Unsupported kdf: ${kdf}`);
  }

  const cipherTextBuffer = Buffer.from(ciphertext, 'hex');

  const macCheck = createHash('sha256')
    .update(Buffer.concat([derivedKey.slice(16, 32), cipherTextBuffer]))
    .digest('hex');

  if (macCheck !== mac) {
    throw new Error('Invalid password or corrupt keystore');
  }

  const decipher = createDecipheriv(
    cipher,
    derivedKey.slice(0, 32),
    Buffer.from(cipherparams.iv, 'hex')
  );

  const decrypted = Buffer.concat([
    decipher.update(cipherTextBuffer),
    decipher.final()
  ]);

  return `0x${decrypted.toString('hex')}`;
}


const KEY_STORE_PATH = process.env.KEY_STORE_PATH as string;
const PASSWORD = process.env.PASSWORD as string;

export const keystoreAccount = toAccount({
  address: privateKeyToAddress(await decryptKeystore(KEY_STORE_PATH, PASSWORD) as `0x${string}`),
  async signMessage({ message }) {
    return signMessage(message);
  },
  async signTypedData(params) {
    return signTypedData(params);
  },
  async signTransaction(transaction, { serializer } = {}) {
    return signTransaction(transaction);
  }
});