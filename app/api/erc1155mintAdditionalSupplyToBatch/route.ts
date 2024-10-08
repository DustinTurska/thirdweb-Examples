// import { NextRequest, NextResponse } from "next/server";
// import { Engine } from "@thirdweb-dev/engine";
// import dotenv from "dotenv";

// dotenv.config();

// const CHAIN_ID = "17000";
// const BACKEND_WALLET_ADDRESS = process.env.BACKEND_WALLET as string;
// const BATCH_SIZE = 250;

// console.log("Environment Variables:");
// console.log("CHAIN_ID:", CHAIN_ID);
// console.log("BACKEND_WALLET_ADDRESS:", BACKEND_WALLET_ADDRESS);
// console.log("ENGINE_URL:", process.env.ENGINE_URL);
// console.log("ACCESS_TOKEN:", process.env.ACCESS_TOKEN ? "Set" : "Not Set");

// const engine = new Engine({
//   url: process.env.ENGINE_URL as string,
//   accessToken: process.env.ACCESS_TOKEN as string,
// });

// interface MintData {
//   receiver: string;
//   tokenId: string;
//   additionalSupply: string;
// }

// export async function POST(req: NextRequest) {
//   const { contractAddress, data } = await req.json() as { contractAddress: string, data: MintData[] };

//   try {
//     const result = await processBatches(contractAddress, data);
//     return NextResponse.json(result, { status: 200 });
//   } catch (error) {
//     console.error("Error:", error);
//     return NextResponse.json({
//       message: "Error processing minting",
//       error: (error as Error).message,
//     }, { status: 500 });
//   }
// }

// async function processBatches(contractAddress: string, mintData: MintData[]) {
//     const results = [];
//     const batches: MintData[][] = [];
    
//     // Create batches
//     for (let i = 0; i < mintData.length; i += BATCH_SIZE) {
//       batches.push(mintData.slice(i, i + BATCH_SIZE));
//     }
  
//     for (let i = 0; i < batches.length; i++) {
//       console.log(`Processing batch ${i + 1} of ${batches.length}`);
//       try {
//         const batchResults = await mintAdditionalSupplyBatch(contractAddress, batches[i]);
//         results.push(...batchResults);
//       } catch (error) {
//         console.error(`Error processing batch ${i + 1}:`, error);
//         // Optionally, you could push error information to results here
//       }
      
//       // Add a delay between batches to avoid rate limiting, except for the last batch
//       if (i < batches.length - 1) {
//         await new Promise(resolve => setTimeout(resolve, 5000));
//       }
//     }
    
//     return results;
//   }

// async function mintAdditionalSupplyBatch(contractAddress: string, mintData: MintData[]) {
//   try {
//     console.log("Minting data:", mintData);
    
//     const mintPromises = mintData.map(({ receiver, tokenId, additionalSupply }) =>
//       engine.erc1155.mintAdditionalSupplyTo(
//         CHAIN_ID,
//         contractAddress,
//         BACKEND_WALLET_ADDRESS,
//         {
//           receiver,
//           tokenId,
//           additionalSupply,
//           txOverrides: {
//             gas: "500000",
//             maxFeePerGas: "1000000000",
//             maxPriorityFeePerGas: "1000000000",
//           },
//         }
//       )
//     );

//     const results = await Promise.all(mintPromises);
//     const queueIds = results.map(res => res.result.queueId);
//     console.log("Minting queued, queue IDs:", queueIds);

//     // Poll for each queue ID
//     const pollResults = await Promise.all(queueIds.map((queueId, index) => 
//       pollToMine(queueId, mintData[index].receiver, mintData[index].tokenId, mintData[index].additionalSupply)
//     ));
    
//     return pollResults;
    
//   } catch (error) {
//     console.log("Error minting additional supply", error);
//     throw error;
//   }
// }

// interface MineResult {
//   queueId: string;
//   status: "mined" | "errored" | "pending";
//   transactionHash?: string | null;
//   blockExplorerUrl?: string | null;
//   errorMessage?: string;
//   receiver: string;
//   tokenId: string;
//   additionalSupply: string;
// }

// async function pollToMine(queueId: string, receiver: string, tokenId: string, additionalSupply: string): Promise<MineResult> {
//   try {
//     const status = await engine.transaction.status(queueId);

//     if (status.result.status === "mined") {
//       console.log(`Transaction mined! 🥳 Additional supply minted for receiver ${receiver}, tokenId ${tokenId}, amount ${additionalSupply}`, queueId);
//       const transactionHash = status.result.transactionHash;
//       const blockExplorerUrl = `https://holesky.beaconcha.in/tx/${transactionHash}`;
//       console.log("View transaction on the blockexplorer:", blockExplorerUrl);
//       return { 
//         queueId, 
//         status: "mined", 
//         transactionHash, 
//         blockExplorerUrl,
//         receiver,
//         tokenId,
//         additionalSupply
//       };
//     }

//     // If the transaction is not mined or errored, wait and check again
//     await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
//     return pollToMine(queueId, receiver, tokenId, additionalSupply);
//   } catch (error) {
//     console.error("Error checking transaction status:", error);
//     throw error;
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { Engine } from "@thirdweb-dev/engine";
import dotenv from "dotenv";
import pLimit from 'p-limit';

dotenv.config();

const CHAIN_ID = "17000";
const BACKEND_WALLET_ADDRESS = process.env.BACKEND_WALLET as string;
const BATCH_SIZE = 250;
const CONCURRENT_BATCHES = 5;
const MAX_RETRIES = 3;

console.log("Environment Variables:");
console.log("CHAIN_ID:", CHAIN_ID);
console.log("BACKEND_WALLET_ADDRESS:", BACKEND_WALLET_ADDRESS);
console.log("ENGINE_URL:", process.env.ENGINE_URL);
console.log("ACCESS_TOKEN:", process.env.ACCESS_TOKEN ? "Set" : "Not Set");

const engine = new Engine({
  url: process.env.ENGINE_URL as string,
  accessToken: process.env.ACCESS_TOKEN as string,
});

interface MintData {
  receiver: string;
  tokenId: string;
  additionalSupply: string;
}

interface MineResult {
  queueId: string;
  status: "mined" | "errored" | "pending";
  transactionHash?: string | null;
  blockExplorerUrl?: string | null;
  errorMessage?: string;
  receiver: string;
  tokenId: string;
  additionalSupply: string;
}

export async function POST(req: NextRequest) {
  const { contractAddress, data } = await req.json() as { contractAddress: string, data: MintData[] };

  try {
    const result = await processBatches(contractAddress, data);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      message: "Error processing minting",
      error: (error as Error).message,
    }, { status: 500 });
  }
}

async function processBatches(contractAddress: string, mintData: MintData[]) {
  const results: MineResult[] = [];
  const batches: MintData[][] = [];
  
  for (let i = 0; i < mintData.length; i += BATCH_SIZE) {
    batches.push(mintData.slice(i, i + BATCH_SIZE));
  }

  const limit = pLimit(CONCURRENT_BATCHES);
  const batchPromises = batches.map((batch, index) => 
    limit(() => processBatch(contractAddress, batch, index, batches.length))
  );

  const batchResults = await Promise.all(batchPromises);
  results.push(...batchResults.flat());
  
  return results;
}

async function processBatch(contractAddress: string, batch: MintData[], batchIndex: number, totalBatches: number): Promise<MineResult[]> {
  console.log(`Processing batch ${batchIndex + 1} of ${totalBatches}`);
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      const batchResults = await mintAdditionalSupplyBatch(contractAddress, batch);
      console.log(`Batch ${batchIndex + 1} processed successfully`);
      return batchResults;
    } catch (error) {
      console.error(`Error processing batch ${batchIndex + 1}:`, error);
      retries++;
      if (retries >= MAX_RETRIES) {
        console.error(`Max retries reached for batch ${batchIndex + 1}`);
        return batch.map(data => ({
          queueId: "",
          status: "errored",
          errorMessage: `Failed after ${MAX_RETRIES} retries`,
          receiver: data.receiver,
          tokenId: data.tokenId,
          additionalSupply: data.additionalSupply
        }));
      }
      await new Promise(resolve => setTimeout(resolve, 5000 * retries)); // Exponential backoff
    }
  }
  return []; // This line should never be reached due to the while loop, but TypeScript needs it
}

async function mintAdditionalSupplyBatch(contractAddress: string, mintData: MintData[]): Promise<MineResult[]> {
  const mintPromises = mintData.map(({ receiver, tokenId, additionalSupply }) =>
    engine.erc1155.mintAdditionalSupplyTo(
      CHAIN_ID,
      contractAddress,
      BACKEND_WALLET_ADDRESS,
      {
        receiver,
        tokenId,
        additionalSupply,
        txOverrides: {
          gas: "500000",
          maxFeePerGas: "1000000000",
          maxPriorityFeePerGas: "1000000000",
        },
      }
    )
  );

  const results = await Promise.all(mintPromises);
  const queueIds = results.map(res => res.result.queueId);

  const pollResults = await Promise.all(queueIds.map((queueId, index) => 
    pollToMine(queueId, mintData[index].receiver, mintData[index].tokenId, mintData[index].additionalSupply)
  ));
  
  return pollResults;
}

async function pollToMine(queueId: string, receiver: string, tokenId: string, additionalSupply: string, attempts = 0): Promise<MineResult> {
  if (attempts >= 30) { // Max 30 attempts (2.5 minutes)
    return { 
      queueId, 
      status: "errored", 
      errorMessage: "Transaction mining timeout",
      receiver,
      tokenId,
      additionalSupply
    };
  }

  try {
    const status = await engine.transaction.status(queueId);

    if (status.result.status === "mined") {
      console.log(`Transaction mined! 🥳 Additional supply minted for receiver ${receiver}, tokenId ${tokenId}, amount ${additionalSupply}`, queueId);
      const transactionHash = status.result.transactionHash;
      const blockExplorerUrl = `https://holesky.beaconcha.in/tx/${transactionHash}`;
      return { 
        queueId, 
        status: "mined", 
        transactionHash, 
        blockExplorerUrl,
        receiver,
        tokenId,
        additionalSupply
      };
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
    return pollToMine(queueId, receiver, tokenId, additionalSupply, attempts + 1);
  } catch (error) {
    console.error("Error checking transaction status:", error);
    await new Promise(resolve => setTimeout(resolve, 5000));
    return pollToMine(queueId, receiver, tokenId, additionalSupply, attempts + 1);
  }
}