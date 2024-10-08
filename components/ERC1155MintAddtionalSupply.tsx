"use client";

import { useState, useRef } from "react";
import { Button } from "@nextui-org/react";
import { ERC1155TransactionResults } from "./ERC1155TransactionResults";
import Papa from "papaparse";

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

interface ParsedData {
  receiver: string;
  tokenId: string;
  additionalSupply: string;
}

export default function ERC1155MintAdditionalSupply() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<ClaimResult[]>([]);
  const [contractAddress, setContractAddress] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData[] | null>(null);
  const [fileUploadStatus, setFileUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDownloadExample = () => {
    const link = document.createElement("a");
    link.href = "/addresses.csv";
    link.download = "addresses.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileUploadStatus("uploading");

      try {
        const data = await readCSVFile(selectedFile);
        setParsedData(data);
        setFileUploadStatus("success");
        setCurrentPage(1); // Reset to first page when new file is uploaded
      } catch (error) {
        console.error("Error parsing CSV:", error);
        setFileUploadStatus("error");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedData || !contractAddress) {
      alert("Please fill in all fields and upload a valid CSV file.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/erc1155mintAdditionalSupplyToBatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractAddress,
          data: parsedData,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setResults(result);
    } catch (error) {
      console.error("Error:", error);
      setResults([
        {
          queueId: "",
          status: "errored",
          errorMessage:
            "Error minting additional supply. Check console for details.",
          receiver: "",
          tokenId: "",
          additionalSupply: "",
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const readCSVFile = (file: File): Promise<ParsedData[]> => {
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

  const totalPages = parsedData
    ? Math.ceil(parsedData.length / itemsPerPage)
    : 0;
  const currentData = parsedData
    ? parsedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : [];

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
              <label
                htmlFor="contractAddress"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="csvFile"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              {fileUploadStatus === "uploading" && (
                <p className="mt-2 text-blue-600">
                  Uploading and parsing file...
                </p>
              )}
              {fileUploadStatus === "success" && (
                <p className="mt-2 text-green-600">
                  File uploaded and parsed successfully!
                </p>
              )}
              {fileUploadStatus === "error" && (
                <p className="mt-2 text-red-600">
                  Error uploading or parsing file. Please try again.
                </p>
              )}
            </div>
          </div>

          {parsedData && parsedData.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Airdrop List
            </h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Receiver
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Token ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Additional Supply
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.receiver}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.tokenId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.additionalSupply}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-between items-center">
              <Button
                color="primary"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                color="primary"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

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
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting || !parsedData}
            className="w-full"
          >
            {isSubmitting ? "Minting..." : "Mint Additional Supply"}
          </Button>
        </form>
      </div>
    </div>
  );
}
