import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorVaultQ22026 } from "../target/types/anchor_vault_q2_2026";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";

describe("anchor-vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorVaultQ22026 as Program<AnchorVaultQ22026>;
  const user = provider.wallet.publicKey;

  // Derive PDAs
  const [vaultStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("state"), user.toBuffer()],
    program.programId
  );

  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), vaultStatePda.toBuffer()],
    program.programId
  );

  it("Initializes the vault state and vault account", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        user: user,
        vaultState: vaultStatePda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Initialize TX Signature:", tx);

    // Fetch and verify state account data
    const stateAccount = await program.account.vaultState.fetch(vaultStatePda);
    assert.isNotNull(stateAccount.vaultBump);
    assert.isNotNull(stateAccount.stateBump);
  });

  it("Deposits 1 SOL into the vault", async () => {
    const depositAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);

    const vaultBalanceBefore = await provider.connection.getBalance(vaultPda);

    const tx = await program.methods
      .deposit(depositAmount)
      .accounts({
        user: user,
        vaultState: vaultStatePda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Deposit TX Signature:", tx);

    const vaultBalanceAfter = await provider.connection.getBalance(vaultPda);
    assert.equal(
      vaultBalanceAfter - vaultBalanceBefore,
      depositAmount.toNumber(),
      "Vault did not receive the correct amount of lamports"
    );
  });

  it("Withdraws 0.5 SOL from the vault", async () => {
    const withdrawAmount = new anchor.BN(0.5 * LAMPORTS_PER_SOL);

    const vaultBalanceBefore = await provider.connection.getBalance(vaultPda);

    const tx = await program.methods
      .withdraw(withdrawAmount)
      .accounts({
        user: user,
        vaultState: vaultStatePda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Withdraw TX Signature:", tx);

    const vaultBalanceAfter = await provider.connection.getBalance(vaultPda);
    assert.equal(
      vaultBalanceBefore - vaultBalanceAfter,
      withdrawAmount.toNumber(),
      "Vault did not successfully release the lamports"
    );
  });

  it("Closes the vault and sweeps remaining balance", async () => {
    const vaultBalanceBeforeClose = await provider.connection.getBalance(vaultPda);
    const userBalanceBeforeClose = await provider.connection.getBalance(user);

    const tx = await program.methods
      .close()
      .accounts({
        user: user,
        vaultState: vaultStatePda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Close TX Signature:", tx);

    // Verify accounts are closed and hold 0 lamports (rent reclaims back to user)
    const vaultBalanceAfterClose = await provider.connection.getBalance(vaultPda);
    const userBalanceAfterClose = await provider.connection.getBalance(user);

    assert.equal(vaultBalanceAfterClose, 0, "Vault account should be closed");
    
    // Assert user balance increased by the remaining vault balance plus rent exemption fees
    assert.isTrue(
      userBalanceAfterClose > userBalanceBeforeClose,
      "User balance should have increased from remaining funds and closed account rent reclaim"
    );

    // Ensure state account is deleted from the network state
    try {
      await program.account.vaultState.fetch(vaultStatePda);
      assert.fail("The vault state account should have been closed.");
    } catch (err) {
      assert.include(err.message, "Account does not exist");
    }
  });
});
