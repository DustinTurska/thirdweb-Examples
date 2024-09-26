// "use client";

// import { useState } from "react";
// import { Button, Input } from "@nextui-org/react";

// interface ClaimResult {
//   queueId: string;
//   status: "mined" | "errored" | "pending";
//   transactionHash?: string | null;
//   blockExplorerUrl?: string | null;
//   errorMessage?: string;
//   toAddress: string;
//   amount: string;
// }

// export default function ClaimTo() {
//   const [toAddress, setToAddress] = useState("");
//   const [amount, setAmount] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [result, setResult] = useState<ClaimResult | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!toAddress || !amount) {
//       alert("Please enter both address and amount.");
//       return;
//     }

//     setIsSubmitting(true);
//     setResult(null);

//     try {
//       const response = await fetch("/api/claimTo", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ receiver: toAddress, quantity: amount }),
//       });

//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }

//       const results = await response.json();
//       setResult(results[0]); // Assuming the API returns an array with a single result
//     } catch (error) {
//       console.error("Error:", error);
//       setResult({
//         queueId: "",
//         status: "errored",
//         errorMessage: "Error claiming tokens. Check console for details.",
//         toAddress,
//         amount,
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
//       <h1 className="text-3xl font-bold">Claim NFT</h1>
//       <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
//         <Input
//           label="Receiver Address"
//           placeholder="0x..."
//           value={toAddress}
//           onChange={(e) => setToAddress(e.target.value)}
//           required
//         />
//         <Input
//           label="Amount"
//           type="text"
//           placeholder="0.1"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//           required
//         />
//         <Button
//           type="submit"
//           color="primary"
//           isLoading={isSubmitting}
//         >
//           {isSubmitting ? "Submitting..." : "Claim Tokens"}
//         </Button>
//       </form>

//       {result && (
//         <div className="mt-4 p-4 border rounded">
//           <h2 className="text-xl font-semibold mb-2">Result:</h2>
//           {result.status === "errored" ? (
//             <p className="text-red-500">{result.errorMessage}</p>
//           ) : (
//             <>
//               <p>Status: {result.status}</p>
//               {result.transactionHash && (
//                 <p>Transaction Hash: {result.transactionHash}</p>
//               )}
//               {result.blockExplorerUrl && (
//                 <p>
//                   <a href={result.blockExplorerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
//                     View on Block Explorer
//                   </a>
//                 </p>
//               )}
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { Button, Input } from "@nextui-org/react";
import { NFTTransactionResults } from "./NFTTransactionResults";

interface ClaimResult {
  queueId: string;
  status: "Mined ⛏️" | "error";
  transactionHash?: string;
  blockExplorerUrl?: string;
  errorMessage?: string;
  toAddress: string;
  amount: string;
}

export default function ClaimTo() {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<ClaimResult[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toAddress || !amount) {
      alert("Please enter both address and amount.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/claimTo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiver: toAddress, quantity: amount }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setResults((prevResults) => [
        ...prevResults,
        {
          ...result,
          toAddress,
          amount,
          status: result.status === "mined" ? "Mined ⛏️" : "error",
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setResults((prevResults) => [
        ...prevResults,
        {
          queueId: "",
          status: "error",
          errorMessage: "Error claiming tokens. Check console for details.",
          toAddress,
          amount,
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setToAddress("");
    setAmount("");
  };

  return (
    <div className="bg-black flex flex-col items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Claim NFT
        </h1>
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <Input
            label="Receiver Address"
            placeholder="0x..."
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            required
          />
          <Input
            label="Amount"
            type="text"
            placeholder="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Claim NFT"}
          </Button>
        </form>

        {results.length > 0 && (
          <div className="mt-8 w-full max-w-4xl">
            <NFTTransactionResults results={results} />
            <Button
              onClick={() => setResults([])}
              color="secondary"
              className="mt-4"
            >
              Clear Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
