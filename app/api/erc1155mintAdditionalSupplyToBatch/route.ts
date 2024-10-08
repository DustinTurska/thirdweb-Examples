import { NextRequest, NextResponse } from "next/server";
import { Engine } from "@thirdweb-dev/engine";
import dotenv from "dotenv";

dotenv.config();

const CHAIN_ID = "17000";
const BACKEND_WALLET_ADDRESS = process.env.BACKEND_WALLET as string;

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

export async function POST(req: NextRequest) {
  const { contractAddress, data } = await req.json() as { contractAddress: string, data: MintData[] };

  try {
    const result = await mintAdditionalSupplyBatch(contractAddress, data);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      message: "Error processing minting",
      error: (error as Error).message,
    }, { status: 500 });
  }
}

async function mintAdditionalSupplyBatch(contractAddress: string, mintData: MintData[]) {
  try {
    console.log("Minting data:", mintData);
    
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
    console.log("Minting queued, queue IDs:", queueIds);

    // Poll for each queue ID
    const pollResults = await Promise.all(queueIds.map((queueId, index) => 
      pollToMine(queueId, mintData[index].receiver, mintData[index].tokenId, mintData[index].additionalSupply)
    ));
    
    return pollResults;
    
  } catch (error) {
    console.log("Error minting additional supply", error);
    throw error;
  }
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

async function pollToMine(queueId: string, receiver: string, tokenId: string, additionalSupply: string): Promise<MineResult> {
  try {
    const status = await engine.transaction.status(queueId);

    if (status.result.status === "mined") {
      console.log(`Transaction mined! 🥳 Additional supply minted for receiver ${receiver}, tokenId ${tokenId}, amount ${additionalSupply}`, queueId);
      const transactionHash = status.result.transactionHash;
      const blockExplorerUrl = `https://holesky.beaconcha.in/tx/${transactionHash}`;
      console.log("View transaction on the blockexplorer:", blockExplorerUrl);
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

    // If the transaction is not mined or errored, wait and check again
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
    return pollToMine(queueId, receiver, tokenId, additionalSupply);
  } catch (error) {
    console.error("Error checking transaction status:", error);
    throw error;
  }
}