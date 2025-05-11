import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as sb from "@switchboard-xyz/on-demand";
import { AnchorUtils } from "@switchboard-xyz/on-demand";
import { TX_CONFIG, sleep } from "./utils";
import * as anchor from "@coral-xyz/anchor";

(async function main() {
  try {
    console.log("Starting SOL/USD quote test...");
    
    // Get connection and keypair from AnchorUtils
    const { keypair, connection } = await sb.AnchorUtils.loadEnv();
    
    // Create provider
    const provider = new anchor.AnchorProvider(
      connection,
      new anchor.Wallet(keypair),
      { commitment: "confirmed" }
    );
    anchor.setProvider(provider);
    
    // Load the program using Anchor workspace
    const workspace = anchor.workspace as any;
    const program = workspace.sbOnDemandSolana;
    
    // Debug: Verify we have the right methods
    console.log("Available program methods:", Object.keys(program.methods));
    
    // Feed address from your createFeed script output
    const feedAccount = new PublicKey("9qSUHitBBUrh6k1DyBqR38M2tmzW7aPYuTZ13qNdYzo3");
    console.log(`Using Feed Account: ${feedAccount.toString()}`);
    
    // Test different USD amounts (in cents)
    const testAmounts = [100, 500, 1000, 5000, 10000]; // 1, 5, 10, 50, 100 USD
    
    for (const usdAmount of testAmounts) {
      try {
        console.log(`\nQuoting for $${usdAmount/100} USD...`);
        
        // Convert to BN for u64 compatibility
        const usdAmountBN = new anchor.BN(usdAmount);
        
        const ix = await program.methods
          .quoteSolForUsd(usdAmountBN)
          .accounts({
            feed: feedAccount,
            user: keypair.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .instruction();
        
        const tx = await sb.asV0Tx({
          connection,
          ixs: [ix],
          payer: keypair.publicKey,
          signers: [keypair],
          computeUnitPrice: 200_000,
          computeUnitLimitMultiple: 1.3,
        });
        
        // Simulate the transaction to see the logs
        const sim = await connection.simulateTransaction(tx, TX_CONFIG);
        
        if (sim.value.logs) {
          const resultLog = sim.value.logs.find(log => 
            log.includes("For") && log.includes("USD cents"));
          
          if (resultLog) {
            console.log(`Result: ${resultLog}`);
          } else {
            console.log("Simulation logs:", sim.value.logs);
          }
        }
        
        // Send the actual transaction
        const sig = await connection.sendTransaction(tx, TX_CONFIG);
        console.log(`Transaction signature: ${sig}`);
        
        // Get the latest blockhash first
        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
          signature: sig,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });
        
      } catch (error) {
        console.error(`Error quoting $${usdAmount/100} USD:`, error);
      }
    }
  } catch (error) {
    console.error("Top-level error:", error);
  }
})();