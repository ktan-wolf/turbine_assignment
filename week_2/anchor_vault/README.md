# Anchor Vault

A Solana smart contract project built with [Anchor](https://www.anchor-lang.com/) framework for managing vault operations on the Solana blockchain.

## Overview

This is a Rust-based Solana program that demonstrates vault functionality using the Anchor framework. The project includes program logic, tests, and deployment configuration for the Solana blockchain.

## Project Structure

```
anchor_vault/
├── programs/              # Solana program source code
├── tests/                 # Test files for the program
├── migrations/            # Database migration scripts
├── Anchor.toml            # Anchor framework configuration
├── Cargo.toml             # Rust workspace and dependencies
├── Cargo.lock             # Locked Rust dependency versions
├── package.json           # Node.js/TypeScript dependencies
├── tsconfig.json          # TypeScript configuration
├── rust-toolchain.toml    # Rust toolchain specification
├── yarn.lock              # Locked Node.js dependency versions
└── .yarnrc.yml            # Yarn configuration
```

## Prerequisites

- **Rust**: Ensure you have Rust installed. The project uses a specific Rust toolchain defined in `rust-toolchain.toml`
- **Node.js**: Required for running tests and scripts
- **Solana CLI**: For interacting with the Solana blockchain
- **Anchor CLI**: Install via `npm install -g @coral-xyz/anchor`
- **Yarn**: Package manager specified in `.yarnrc.yml`

## Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Anchor

The project is configured to use:
- **Package Manager**: Yarn
- **Cluster**: Localnet (local Solana validator)
- **Wallet**: `~/.config/solana/id.json`

Edit `Anchor.toml` to change cluster settings if needed.

### 3. Build the Program

```bash
anchor build
```

This compiles the Rust program and generates TypeScript types.

## Development

### Running Tests

Run the test suite with:

```bash
yarn test
```

Or directly with:

```bash
anchor test
```

Tests are written in TypeScript and located in the `tests/` directory. The test configuration supports up to 1,000,000ms timeout.

### Linting

Check code formatting:

```bash
yarn run lint
```

Fix formatting issues:

```bash
yarn run lint:fix
```

The project uses **Prettier** for code formatting.

## Deployment

### Local Development (Localnet)

1. Start a local Solana validator:
   ```bash
   solana-test-validator
   ```

2. Deploy the program:
   ```bash
   anchor deploy
   ```

### Mainnet/Testnet

Update the cluster in `Anchor.toml`:

```toml
[provider]
cluster = "devnet"  # or "mainnet-beta"
wallet = "~/.config/solana/id.json"
```

Then deploy:

```bash
anchor deploy
```

## Configuration

### Anchor.toml

- **toolchain**: Yarn is the package manager
- **features**: Resolution enabled, linting enabled
- **programs**: Program IDs for different networks
- **provider**: RPC cluster and wallet configuration
- **scripts**: Test command configuration

### Cargo.toml

- **workspace**: Members point to `programs/` directory
- **release profile**: Optimized for production with LTO and overflow checks

## Dependencies

### Runtime Dependencies
- `@coral-xyz/anchor`: ^0.32.1 - Anchor framework for Solana

### Development Dependencies
- TypeScript 5.7.3
- Mocha (test framework)
- Chai (assertion library)
- ts-mocha (TypeScript mocha runner)
- Prettier (code formatter)
- Type definitions for Node.js libraries

## Program Details

- **Program ID (Localnet)**: `2MF7KsmAimFwLhvTCNW2sWHWRJXn9mmieu4KDvRguZ5y`

## Useful Commands

| Command | Description |
|---------|-------------|
| `yarn install` | Install all dependencies |
| `anchor build` | Build the Solana program |
| `anchor test` | Run test suite |
| `yarn run lint` | Check code formatting |
| `yarn run lint:fix` | Fix code formatting |
| `anchor deploy` | Deploy program to configured cluster |
| `solana-test-validator` | Start local Solana validator |

## Documentation

- [Anchor Documentation](https://www.anchor-lang.com/docs)
- [Solana Documentation](https://docs.solana.com/)
- [Solana Program Library](https://spl.solana.com/)

## License

ISC

## Notes

- Ensure your local Solana validator is running before running tests
- Update wallet configuration in `Anchor.toml` before deploying to mainnet
- The project uses Rust 2021 edition with specific toolchain versions
