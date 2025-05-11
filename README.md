# SwitchWalk6 - Solana Price Oracle Integration

A Solana program demonstrating integration with Switchboard oracles to fetch and use real-time price data on-chain, with a specific implementation for SOL/USD price conversion.

## Overview

This project provides a Solana smart contract that:
- Connects to Switchboard on-demand price feeds
- Creates and manages price feeds for SOL/USD
- Provides a utility function to quote SOL amounts for USD values

## Prerequisites

- [Solana CLI tools](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor framework](https://www.anchor-lang.com/docs/installation)
- [Node.js](https://nodejs.org/) v16+ and bun/yarn
- A Solana wallet with devnet/mainnet SOL

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/switchwalk6.git
cd switchwalk6

# Install dependencies
bun install

# Build the program
anchor build
```

## Usage

### Setting up a Price Feed

Create a new SOL/USD price feed using Pyth and Chainlink oracles:

```bash
bun run scripts/createFeed.ts
```

The script will output the feed address to use in your applications.

### Getting SOL Quotes for USD Amounts

Once a price feed is set up, you can query how much SOL is needed for specific USD amounts:

```bash
bun run scripts/solusdquote.ts
```

This will quote SOL amounts for $1, $5, $10, $50, and $100.

## Smart Contract Functions

### `pricefeedtest`

A simple function to test reading from the price feed and displaying the current price.

### `quote_sol_for_usd`

Calculates the amount of SOL (in lamports) needed to meet a specified USD value.

**Parameters:**
- `usd_amount`: The amount in USD cents (e.g., 100 for $1.00)

**Returns:**
- Logs the equivalent SOL amount for the given USD value

## Architecture

The project consists of:

1. **Solana Program (smart contract)** - Written in Rust using the Anchor framework
2. **Helper Scripts** - TypeScript utilities for interacting with the contract
3. **Feed Management** - Scripts to create and update price feeds

### Key Components

- `programs/switchwalk6/src/lib.rs` - Main program logic
- `scripts/createFeed.ts` - Creates and initializes a new price feed
- `scripts/solusdquote.ts` - Demonstrates querying SOL quotes for USD amounts
- `scripts/utils.ts` - Helper functions and utilities

## Development

### Setting Up a Local Environment

For local development, you can use the Solana localnet:

```bash
solana-test-validator
```

### Testing

```bash
anchor test
```

## Deployment

To deploy to devnet:

```bash
anchor deploy --provider.cluster devnet
```

For mainnet:

```bash
anchor deploy --provider.cluster mainnet-beta
```

## License

[MIT License](LICENSE)

## Acknowledgements

- [Switchboard](https://switchboard.xyz/) for providing the oracle infrastructure and example script code
- [Pyth Network](https://pyth.network/) for price feed data
- [Chainlink](https://chain.link/) for price feed data 