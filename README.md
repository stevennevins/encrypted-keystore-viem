# Web3Signer Custom Account for Viem

This package demonstrates how to create a custom Viem account that uses Web3Signer for transaction and message signing.

## Prerequisites

- Node.js
- Docker and Docker Compose
- Anvil (local Ethereum testnet)

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

## Running

To start the Web3Signer service using Docker Compose, run the following command:

1. Start Web3Signer:

   ```bash
   docker compose up
   ```

2. In a separate terminal, start Anvil:

   ```bash
   anvil
   ```

3. Run the tests:

   ```bash
   npm run test
   ```
