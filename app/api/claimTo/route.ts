// import { Engine } from "@thirdweb-dev/engine";
// import * as dotenv from "dotenv";
// import { NextRequest, NextResponse } from "next/server";

// dotenv.config();

// const CHAIN_ID = "17000";
// const BACKEND_WALLET_ADDRESS = process.env.BACKEND_WALLET as string;
// const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS as string;

// const engine = new Engine({
//   url: process.env.ENGINE_URL as string,
//   accessToken: process.env.ACCESS_TOKEN as string,
// });

// interface ClaimRequest {
//   receiver: string;
//   quantity: number;
// }

// interface ClaimResult {
//   queueId: string;
//   status: "mined" | "errored";
//   transactionHash?: string | undefined | null;
//   blockExplorerUrl?: string | undefined | null;
//   errorMessage?: string;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     console.log("Request body:", body);

//     let receiver, quantity;

//     if (Array.isArray(body.data) && body.data.length > 0) {
//       // Handle the case where data is sent as an array
//       receiver = body.data[0].toAddress;
//       quantity = body.data[0].amount;
//     } else {
//       // Handle the case where data is sent directly
//       receiver = body.receiver || body.toAddress;
//       quantity = body.quantity || body.amount;
//     }

//     if (!receiver || quantity === undefined) {
//       return NextResponse.json(
//         { error: "Missing receiver or quantity" },
//         { status: 400 }
//       );
//     }

//     const res = await engine.erc721.claimTo(
//       CHAIN_ID,
//       CONTRACT_ADDRESS,
//       BACKEND_WALLET_ADDRESS,
//       {
//         receiver,
//         quantity: quantity.toString(),
//         // txOverrides: {
//         //   gas: "530000",
//         //   maxFeePerGas: "1000000000",
//         //   maxPriorityFeePerGas: "1000000000",
//         // },
//       }
//     );

//     console.log("Claim initiated, queue ID:", res.result.queueId);
//     const result = await pollToMine(res.result.queueId);
//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("Error claiming ERC721 tokens", error);
//     return NextResponse.json(
//       { error: "Error claiming ERC721 tokens" },
//       { status: 500 }
//     );
//   }
// }
// async function pollToMine(queueId: string): Promise<ClaimResult> {
//   let attempts = 0;
//   const maxAttempts = 10;

//   while (attempts < maxAttempts) {
//     try {
//       const status = await engine.transaction.status(queueId);

//       if (status.result.status === "mined") {
//         console.log(
//           "Transaction mined! 🥳 ERC721 token has been claimed",
//           queueId
//         );
//         const transactionHash = status.result.transactionHash;
//         const blockExplorerUrl = `https://holesky.beaconcha.in/tx/${transactionHash}`;
//         console.log("View transaction on the blockexplorer:", blockExplorerUrl);
//         return {
//           queueId,
//           status: "mined",
//           transactionHash: transactionHash ?? undefined,
//           blockExplorerUrl: blockExplorerUrl,
//         };
//       } else if (status.result.status === "errored") {
//         console.error("Claim failed", queueId);
//         console.error(status.result.errorMessage);
//         return {
//           queueId,
//           status: "errored",
//           errorMessage: status.result.errorMessage ?? "Unknown error occurred",
//         };
//       }
//     } catch (error) {
//       console.error("Error checking transaction status:", error);
//     }

//     attempts++;
//     await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before next attempt
//   }

//   return {
//     queueId,
//     status: "errored",
//     errorMessage: "Transaction did not mine within the expected time",
//   };
// }
import { Engine } from "@thirdweb-dev/engine";
import * as dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";

dotenv.config();

const CHAIN_ID = "17000";
const BACKEND_WALLET_ADDRESS = process.env.BACKEND_WALLET as string;
const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS as string;

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
    const quantity = body.quantity || body.amount;

    if (!receiver || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing receiver or quantity" },
        { status: 400 }
      );
    }

    console.log(`Attempting to claim for receiver: ${receiver}, quantity: ${quantity}`);

    const res = await engine.erc721.claimTo(
      CHAIN_ID,
      CONTRACT_ADDRESS,
      BACKEND_WALLET_ADDRESS,
      {
        receiver,
        quantity: quantity.toString(),
      }
    );

    console.log("Claim initiated, queue ID:", res.result.queueId);
    const result = await pollToMine(res.result.queueId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error claiming ERC721 tokens", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Error claiming ERC721 tokens", details: error.message },
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
          "Transaction mined! 🥳 ERC721 token has been claimed",
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
        console.error("Claim failed", queueId);
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