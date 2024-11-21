import { expect, describe, it, beforeAll } from 'vitest';
import { createWalletClient, http, type WalletClient, verifyMessage, verifyTypedData, parseEther } from 'viem';
import { anvil } from 'viem/chains';
import { keystoreAccount } from '../src';

describe('Keystore Integration', () => {
  let client: WalletClient;

  beforeAll(async () => {
    client = createWalletClient({
      chain: anvil,
      transport: http(),
      account: await keystoreAccount(),
    });
  });

  it('should sign a message using the client', async () => {
    const message = 'Hello Keystore';
    const signature = await client.signMessage({
      message,
      account: await keystoreAccount()
    });

    const isValid = await verifyMessage({
      address: (await keystoreAccount()).address,
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
      text: 'Hello Keystore!'
    };

    const signature = await client.signTypedData({
      account: await keystoreAccount(),
      domain,
      types,
      primaryType: 'Message',
      message
    });

    const isValid = await verifyTypedData({
      address: (await keystoreAccount()).address,
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
      account: await keystoreAccount(),
      to: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      value: parseEther("0.01"),
      chain: anvil
    });

    const hash = await client.signTransaction(request);

    expect(typeof hash).toBe('string');

  });
});