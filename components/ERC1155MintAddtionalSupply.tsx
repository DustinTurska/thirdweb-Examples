"use client";

import { useState, useRef } from "react";
import { Button } from "@nextui-org/react";
import { ERC1155TransactionResults } from "./ERC1155TransactionResults";
import Papa from 'papaparse';

interface ClaimResult {
  queueId: string;
  status: "mined" | "errored" | "pending";
  transactionHash?: string;
  blockExplorerUrl?: string;
  errorMessage?: string;
  receiver: string;
  tokenId: string;
  additionalSupply: string;
}

export default function ERC1155MintAdditionalSupply() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<ClaimResult[]>([]);

  const [contractAddress, setContractAddress] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadExample = () => {
    const link = document.createElement("a");
    link.href = "/erc1155Example.csv";
    link.download = "erc1155Example.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !contractAddress) {
      alert("Please fill in all fields and upload a CSV file.");
      return;
    }

    setIsSubmitting(true);

    try {
      const csvData = await readCSVFile(file);
      
      const response = await fetch("/api/erc1155mintAdditionalSupplyToBatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractAddress,
          data: csvData,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setResults(result);
    } catch (error) {
      console.error("Error:", error);
      setResults([{
        queueId: "",
        status: "errored",
        errorMessage: "Error minting additional supply. Check console for details.",
        receiver: "",
        tokenId: "",
        additionalSupply: "",
      }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const readCSVFile = (file: File): Promise<{ receiver: string; tokenId: string; additionalSupply: string; }[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          const data = results.data.slice(1).map((row: any) => ({
            receiver: row[0],
            tokenId: row[1],
            additionalSupply: row[2],
          }));
          resolve(data);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  };

  return (
    <div className="bg-black flex flex-col items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Mint Additional Supply ERC1155
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Button
              color="primary"
              onClick={handleDownloadExample}
              className="mb-4"
            >
              Download Example CSV
            </Button>
            <div>
              <label htmlFor="contractAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Contract Address
              </label>
              <input
                id="contractAddress"
                type="text"
                placeholder="Contract Address"
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 mb-1">
                Upload CSV File (Receiver, Token ID, Additional Supply)
              </label>
              <input
                type="file"
                id="csvFile"
                accept=".csv"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting || !file}
            className="w-full"
          >
            {isSubmitting ? "Minting..." : "Mint Additional Supply"}
          </Button>
        </form>

        {results.length > 0 && (
          <div className="mt-8">
            {/* <ERC1155TransactionResults results={results} /> */}
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