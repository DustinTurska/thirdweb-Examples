import { Engine } from "@thirdweb-dev/engine";
import * as dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";

dotenv.config();

const CHAIN_ID = "17000";
const BACKEND_WALLET_ADDRESS = process.env.BACKEND_WALLET as string;
const CONTRACT_ADDRESS = process.env.EDITION_CONTRACT_ADDRESS as string;

console.log("Environment Variables:");
console.log("CHAIN_ID:", CHAIN_ID);
console.log("BACKEND_WALLET_ADDRESS:", BACKEND_WALLET_ADDRESS);
console.log("CONTRACT_ADDRESS:", CONTRACT_ADDRESS);
console.log("ENGINE_URL:", process.env.ENGINE_URL);
console.log("ACCESS_TOKEN:", process.env.ACCESS_TOKEN ? "Set" : "Not Set");

const engine = new Engine({
  url: process.env.ENGINE_URL as string,
  accessToken: process.env.ACCESS_TOKEN as string,
});

interface ClaimResult {
  queueId: string;
  status: "mined" | "errored";
  transactionHash?: string | undefined | null;
  blockExplorerUrl?: string | undefined | null;
  errorMessage?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Request body:", body);

    const receiver = body.receiver || body.toAddress;
    const metadataWithSupply = body.metadataWithSupply;

    if (!receiver || !metadataWithSupply || !Array.isArray(metadataWithSupply)) {
      return NextResponse.json(
        { error: "Missing receiver or invalid metadataWithSupply" },
        { status: 400 }
      );
    }

    console.log(`Attempting to mint batch for receiver: ${receiver}, metadataWithSupply:`, metadataWithSupply);
    console.log("Using CONTRACT_ADDRESS:", CONTRACT_ADDRESS);

    const res = await engine.erc1155.mintBatchTo(
      CHAIN_ID,
      CONTRACT_ADDRESS,
      BACKEND_WALLET_ADDRESS,
      {
        receiver,
        metadataWithSupply: metadataWithSupply.map(item => ({
          metadata: item.metadata,
          supply: item.supply
        })),
      }
    );

    console.log("Batch mint initiated, queue ID:", res.result.queueId);
    const result = await pollToMine(res.result.queueId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error minting batch ERC1155 tokens", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Error minting batch ERC1155 tokens", details: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}

async function pollToMine(queueId: string): Promise<ClaimResult> {
    let attempts = 0;
    const maxAttempts = 10;
  
    while (attempts < maxAttempts) {
      try {
        const status = await engine.transaction.status(queueId);
  
        if (status.result.status === "mined") {
          console.log(
            "Transaction mined! 🥳 ERC1155 token has been minted",
            queueId
          );
          const transactionHash = status.result.transactionHash;
          const blockExplorerUrl = `https://holesky.beaconcha.in/tx/${transactionHash}`;
          console.log("View transaction on the blockexplorer:", blockExplorerUrl);
          return {
            queueId,
            status: "mined",
            transactionHash: transactionHash ?? undefined,
            blockExplorerUrl: blockExplorerUrl,
          };
        } else if (status.result.status === "errored") {
          console.error("Mint failed", queueId);
          console.error(status.result.errorMessage);
          return {
            queueId,
            status: "errored",
            errorMessage: status.result.errorMessage ?? "Unknown error occurred",
          };
        }
      } catch (error) {
        console.error("Error checking transaction status:", error);
      }
  
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before next attempt
    }
  
    return {
      queueId,
      status: "errored",
      errorMessage: "Transaction did not mine within the expected time",
    };
  }