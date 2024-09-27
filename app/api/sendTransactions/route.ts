import type { NextApiRequest, NextApiResponse } from "next";
import { Engine } from "@thirdweb-dev/engine";
import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";
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

interface TransactionData {
  toAddress: string;
  amount: string;
}

interface Receiver {
  toAddress: string;
  value: string;
  data: string;
  txOverrides: {
    gas: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    value: string;
  };
}
const jobQueue = new Map<string, any>();

export async function POST(req: NextRequest) {
  const { data } = await req.json() as { data: TransactionData[] };

  const receivers: Receiver[] = data.map((entry) => ({
    toAddress: entry.toAddress,
    value: entry.amount,
    data: "0x",
    txOverrides: {
      gas: "530000",
      maxFeePerGas: "1000000000",
      maxPriorityFeePerGas: "1000000000",
      value: entry.amount,
    },
  }));

  try {
    const result = await sendTransactionBatch(receivers);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      message: "Error processing transactions",
      error: (error as Error).message,
    }, { status: 500 });
  }
}

async function sendTransactionBatch(receivers: Receiver[]) {
  try {
    console.log("Receivers:", receivers);
    
    const res = await engine.backendWallet.sendTransactionBatch(
      CHAIN_ID,
      BACKEND_WALLET_ADDRESS,
      undefined,
      receivers.map((receiver) => ({
        toAddress: receiver.toAddress,
        value: receiver.value,
        data: receiver.data,
        txOverrides: receiver.txOverrides,
      }))
    );

    const queueIds = res.result.queueIds;
    console.log("Transactions queued, queue IDs:", queueIds);

    // Poll for each queue ID
    const results = await Promise.all(queueIds.map((queueId, index) => 
      pollToMine(queueId, receivers[index].toAddress, receivers[index].value)
    ));
    
    return results;
    
  } catch (error) {
    console.log("Error transferring Native", error);
    throw error;
  }
}

interface MineResult {
    queueId: string;
    status: "mined" | "errored" | "pending";
    transactionHash?: string | null;
    blockExplorerUrl?: string | null;
    errorMessage?: string;
    toAddress: string;
    amount: string;
  }
  
  async function pollToMine(queueId: string, toAddress: string, amount: string): Promise<MineResult> {
    try {
      const status = await engine.transaction.status(queueId);
  
      if (status.result.status === "mined") {
        console.log(`Transaction mined! 🥳 Native has been sent to ${toAddress} with amount ${amount}`, queueId);
        const transactionHash = status.result.transactionHash;
        const blockExplorerUrl = `https://holesky.beaconcha.in/tx/${transactionHash}`;
        console.log("View transaction on the blockexplorer:", blockExplorerUrl);
        return { 
          queueId, 
          status: "mined", 
          transactionHash, 
          blockExplorerUrl,
          toAddress,
          amount
        };
      }
  
      // If the transaction is not mined or errored, wait and check again
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
      return pollToMine(queueId, toAddress, amount);
    } catch (error) {
      console.error("Error checking transaction status:", error);
      throw error;
    }
  }
