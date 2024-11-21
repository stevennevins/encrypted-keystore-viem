import { expect, describe, it, beforeAll } from 'vitest';
import { createWalletClient, http, type WalletClient, verifyMessage, verifyTypedData, parseEther } from 'viem';
import { anvil } from 'viem/chains';
import { keystoreAccount, decryptKeystore } from '../src';

describe('Web3Signer Integration', () => {
  let client: WalletClient;

  beforeAll(() => {
    client = createWalletClient({
      chain: anvil,
      transport: http(),
      account: keystoreAccount,
    });
  });

  it('should sign a message using the client', async () => {
    const message = 'Hello Web3Signer';
    const signature = await client.signMessage({
      message,
      account: keystoreAccount
    });

    const isValid = await verifyMessage({
      address: keystoreAccount.address,
      message,
      signature
    });

    expect(isValid).toBe(true);
  });

  it('should sign and verify typed data', async () => {
    const domain = {
      name: 'Test App',
      version: '1',
      chainId: 1
    };

    const types = {
      Message: [
        { name: 'text', type: 'string' }
      ]
    };

    const message = {
      text: 'Hello Web3Signer!'
    };

    const signature = await client.signTypedData({
      account: keystoreAccount,
      domain,
      types,
      primaryType: 'Message',
      message
    });

    const isValid = await verifyTypedData({
      address: keystoreAccount.address,
      domain,
      types,
      primaryType: 'Message',
      message,
      signature
    });

    expect(isValid).toBe(true);
  });

  it('should send an ether transaction', async () => {
    const request = await client.prepareTransactionRequest({
      account: keystoreAccount,
      to: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      value: parseEther("0.01"),
      chain: anvil
    });

    const hash = await client.signTransaction(request);

    expect(typeof hash).toBe('string');

  });
});