"use client";

import { useState, useEffect } from "react";
import { Button, Link } from "@nextui-org/react";
import { NFTTransactionResults } from "./NFTTransactionResults";
import { useActiveAccount } from "thirdweb/react";

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
  const [amount, setAmount] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<ClaimResult[]>([]);

  const activeAccount = useActiveAccount();
  const [toAddress, setToAddress] = useState("");

  useEffect(() => {
    if (activeAccount?.address) {
      setToAddress(activeAccount.address);
    }
  }, [activeAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toAddress || !amount) {
      alert("Please enter both address and amount.");
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum < 1 || amountNum > 5) {
      alert("Amount must be between 1 and 5.");
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseInt(value);
    if (value === "" || (numValue >= 1 && numValue <= 5)) {
      setAmount(value);
    }
  };

  return (
    <div className="bg-black flex flex-col items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Claim ERC721
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                placeholder="Login to Claim"
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                required
                readOnly
              />
            </div>
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount
              </label>
              <input
                id="amount"
                type="number"
                min="1"
                max="5"
                placeholder="1"
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={amount}
                onChange={handleAmountChange}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting || !activeAccount}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Claim NFT"}
          </Button>
        </form>

        {results.length > 0 && (
          <div className="mt-8">
            <NFTTransactionResults results={results} />
            <Button
              onClick={() => setResults([])}
              color="secondary"
              className="mt-4 w-full"
            >
              Clear Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}