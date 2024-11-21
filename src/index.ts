import {
    signMessage,
    signTransaction,
    signTypedData,
    privateKeyToAddress,
    toAccount
} from 'viem/accounts';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { Wallet } from '@ethereumjs/wallet';
dotenv.config();

export async function decryptKeystore(
    keystorePath: string,
    password: string
): Promise<string> {
    const keyStoreFile = readFileSync(keystorePath, 'utf-8');
    const keystoreJson = JSON.parse(keyStoreFile);

    const wallet = await Wallet.fromV3(keystoreJson, password);
    return wallet.getPrivateKeyString();
}

const KEY_STORE_PATH = process.env.KEY_STORE_PATH as string;
const PASSWORD = process.env.PASSWORD as string;

export const keystoreAccount = async () => {
    const privateKey = await decryptKeystore(KEY_STORE_PATH, PASSWORD) as `0x${string}`;
    return toAccount({
        address: privateKeyToAddress(privateKey),
        async signMessage({ message }) {
            return signMessage({ message, privateKey });
        },
        async signTransaction(transaction) {
            return signTransaction({ transaction, privateKey });
        },
        async signTypedData(typedData) {
            return signTypedData({ ...typedData, privateKey });
        }
    })
}
