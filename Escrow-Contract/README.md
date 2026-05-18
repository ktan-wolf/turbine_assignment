# Escrow Contract

A Solana-based escrow contract built with [Anchor](https://www.anchor-lang.com/). This program enables trustless token swaps between two parties using an escrow mechanism.

## Overview

The Escrow Contract facilitates atomic token exchanges on Solana. A maker initiates an escrow by depositing tokens they wish to swap, specifying the amount they expect to receive in return. A taker can then complete the swap by transferring the expected tokens to the maker and receiving the escrowed tokens. The maker can also refund their tokens if no taker completes the swap.

## Features

- **Make Escrow**: Deposit tokens and specify the amount expected in return
- **Take Escrow**: Complete a swap by depositing the expected tokens and receiving the escrowed tokens
- **Refund Escrow**: Maker can reclaim deposited tokens if swap is not completed
- **Event Logging**: Emits events for all escrow operations
- **Secure Token Handling**: Uses Anchor SPL integrations for safe token transfers

## Project Structure

```
Escrow-Contract/
├── programs/
│   └── escrow/
│       ├── src/
│       │   ├── lib.rs              # Main program entry point
│       │   ├── state.rs            # Escrow account structure
│       │   ├── events.rs           # Event definitions
│       │   └── instructions/       # Transaction handlers
│       │       ├── mod.rs
│       │       ├── make.rs         # Initiate escrow
│       │       ├── take.rs         # Complete swap
│       │       └── refund.rs       # Refund escrow
│       ├── Cargo.toml
│       └── Cargo.lock
├── tests/                           # Test files
├── migrations/                      # Migration scripts
├── Anchor.toml                      # Anchor configuration
├── Cargo.toml                       # Workspace configuration
├── package.json                     # Node.js dependencies
├── tsconfig.json                    # TypeScript configuration
└── yarn.lock                        # Yarn lock file
```

## Key Components

### State (`state.rs`)

The `Escrow` account stores:
- **seed**: Unique identifier for the escrow
- **maker**: Public key of the escrow initiator
- **mint_a**: Token mint the maker is depositing
- **mint_b**: Token mint the maker expects to receive
- **receive_amt**: Amount of mint_b the maker expects
- **bump**: PDA bump seed for account derivation

### Instructions

#### **Make** (`make.rs`)
Initializes a new escrow agreement.

**Parameters:**
- `seed`: Unique identifier for this escrow
- `deposit_amt`: Amount of tokens to deposit (mint_a)
- `receive_amt`: Expected amount of tokens to receive (mint_b)

**Accounts Required:**
- Maker (signer)
- Mint A & Mint B token mints
- Maker's token account for Mint A
- Escrow PDA account (created)
- Vault token account (created, holds deposited tokens)
- Associated Token Program
- Token Program
- System Program

#### **Take** (`take.rs`)
Completes the escrow swap.

**Accounts Required:**
- Taker (signer)
- Maker (receiver of swapped tokens)
- Mint A & Mint B token mints
- Taker's token accounts for both mints
- Maker's token account for Mint B
- Escrow PDA account
- Vault token account
- Associated Token Program
- Token Program
- System Program

**Actions:**
1. Transfers expected tokens from taker to maker
2. Transfers escrowed tokens from vault to taker
3. Closes the vault account

#### **Refund** (`refund.rs`)
Allows the maker to reclaim escrowed tokens.

**Accounts Required:**
- Maker (signer)
- Mint A token mint
- Maker's token account for Mint A
- Escrow PDA account
- Vault token account
- Associated Token Program
- Token Program
- System Program

**Actions:**
1. Transfers tokens from vault back to maker
2. Closes the vault and escrow accounts

### Events (`events.rs`)

- **MakeEvent**: Emitted when escrow is created
- **TakeEvent**: Emitted when escrow is completed
- **RefundEvent**: Emitted when escrow is refunded

## Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (with the `wasm32-unknown-unknown` target)
- [Node.js](https://nodejs.org/) 14.0 or higher
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor](https://www.anchor-lang.com/docs/installation)

### Installation

1. Navigate to the project directory:
```bash
cd Escrow-Contract
```

2. Install dependencies:
```bash
yarn install
```

3. Build the program:
```bash
anchor build
```

### Configuration

Edit `Anchor.toml` to configure:
- Cluster (localnet, devnet, mainnet)
- Program address
- Wallet path
- Test runner settings

```toml
[toolchain]
package_manager = "yarn"

[programs.localnet]
escrow = "9VsG1W25CdPzJ2cZBeymL59cmBWKKtdKUt22tQy98qx5"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 \"tests/**/*.ts\""
```

### Testing

Run the test suite:
```bash
anchor test
```

Or use yarn:
```bash
yarn test
```

### Deployment

To deploy to localnet:
```bash
anchor deploy
```

For devnet or mainnet, update the cluster in `Anchor.toml` and redeploy.

## Program ID

**Localnet:** `9VsG1W25CdPzJ2cZBeymL59cmBWKKtdKUt22tQy98qx5`

## Security Considerations

- The escrow uses **PDA (Program Derived Address)** for the escrow account, making it deterministic and secure
- Token transfers use **transfer_checked** to ensure proper decimal handling
- The **vault** is owned by the escrow PDA, preventing unauthorized token access
- Proper constraints are applied to all accounts to prevent misuse

## Usage Example

### Creating an Escrow

```rust
let tx = await program.methods
  .make(
    new anchor.BN(123),        // seed
    new anchor.BN(1000000),     // deposit_amt (1 token with 6 decimals)
    new anchor.BN(500000)       // receive_amt (0.5 token with 6 decimals)
  )
  .accounts({
    maker: maker.publicKey,
    mintA: mintA,
    mintB: mintB,
    makerAccountA: makerAccountA,
    escrow: escrowAccount,
    vault: vaultAccount,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .signers([maker])
  .rpc();
```

### Completing the Swap

```rust
let tx = await program.methods
  .take()
  .accounts({
    taker: taker.publicKey,
    maker: maker.publicKey,
    mintA: mintA,
    mintB: mintB,
    takerAccountA: takerAccountA,
    takerAccountB: takerAccountB,
    makerAccountB: makerAccountB,
    escrow: escrowAccount,
    vault: vaultAccount,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .signers([taker])
  .rpc();
```

## Troubleshooting

### "Invalid Instruction" Error
- Verify all required accounts are included and in the correct order
- Check that account authorities are correct

### Token Transfer Fails
- Ensure accounts have sufficient balance
- Verify token account mints match the instruction mints
- Check decimal precision in transfer amounts

### Account Not Found
- Verify PDA derivation seeds and bump
- Ensure accounts are initialized on the correct network

## Dependencies

- **@coral-xyz/anchor**: ^0.31.1 - Anchor framework
- **@solana/spl-token**: ^0.4.13 - SPL Token integration
- **@solana/web3.js**: ^1.98.0 - Solana Web3 library

## License

ISC

## Contact

For questions or issues, please open an issue on the GitHub repository.
