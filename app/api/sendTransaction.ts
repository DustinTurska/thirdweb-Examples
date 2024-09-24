import type { NextApiRequest, NextApiResponse } from "next";
import { Engine } from "@thirdweb-dev/engine";
import dotenv from "dotenv";
dotenv.config();

const CHAIN_ID = "17000";
const BACKEND_WALLET_ADDRESS = process.env.BACKEND_WALLET as string;

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { data } = req.body as { data: TransactionData[] };

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
    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Error processing transactions",
      error: (error as Error).message,
    });
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