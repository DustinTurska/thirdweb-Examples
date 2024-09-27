"use client";

import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { ERC1155TransactionResults } from "./ERC1155TransactionResults";
import { useActiveAccount } from "thirdweb/react";

interface ClaimResult {
  queueId: string;
  status: "Mined ⛏️" | "error";
  transactionHash?: string;
  blockExplorerUrl?: string;
  errorMessage?: string;
  toAddress: string;
  metadataWithSupply: {
    metadata: {
      name: string;
      description: string;
      image: string;
    };
    supply: string;
  };
}

export default function ERC1155MintTo() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<ClaimResult[]>([]);

  const activeAccount = useActiveAccount();
  const [toAddress, setToAddress] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [supply, setSupply] = useState("1");

  useEffect(() => {
    if (activeAccount?.address) {
      setToAddress(activeAccount.address);
    }
  }, [activeAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toAddress || !name || !description || !image || !supply) {
      alert("Please fill in all fields.");
      return;
    }

    const supplyNum = parseInt(supply);
    if (isNaN(supplyNum) || supplyNum < 1) {
      alert("Supply must be a positive number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/erc1155mintTo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver: toAddress,
          metadataWithSupply: {
            metadata: {
              name,
              description,
              image,
            },
            supply,
          },
        }),
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
          metadataWithSupply: {
            metadata: { name, description, image },
            supply,
          },
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
          errorMessage: "Error minting tokens. Check console for details.",
          toAddress,
          metadataWithSupply: {
            metadata: { name, description, image },
            supply,
          },
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black flex flex-col items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Mint ERC1155
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                id="address"
                type="text"
                placeholder="Login to Mint"
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={toAddress}
                readOnly
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="NFT Name"
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                placeholder="NFT Description"
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                id="image"
                type="url"
                placeholder="ipfs://QmSvVdTWEzE1JExVYxwJHhaNDzAyzJEJWA1tWbHbnT6E9V/0.avif"
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="supply" className="block text-sm font-medium text-gray-700 mb-1">
                Supply
              </label>
              <input
                id="supply"
                type="number"
                min="1"
                placeholder="1"
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={supply}
                onChange={(e) => setSupply(e.target.value)}
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
            {isSubmitting ? "Minting..." : "Mint NFT"}
          </Button>
        </form>

        {results.length > 0 && (
          <div className="mt-8">
            <ERC1155TransactionResults results={results} />
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