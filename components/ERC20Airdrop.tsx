"use client";

import { useState } from "react";
import {
  button,
  buttonGroup,
  Table,
  Pagination,
  Button,
} from "@nextui-org/react";
import { NextUIProvider } from "@nextui-org/react";
import { TransactionResults } from "./TransactionResults";
import Papa from "papaparse";
import { ethers } from "ethers";

interface CSVRow {
  toAddress: string;
  amount: string;
}

interface TransactionData {
  toAddress: string;
  amount: string;
}

interface TransactionResult {
  queueId: string;
  status: "Mined ⛏️" | "error";
  transactionHash?: string;
  blockExplorerUrl?: string;
  errorMessage?: string;
  toAddress: string;
  amount: string;
}

interface ERC20AirdropProps {
  isDisabled?: boolean;
}

function formatEthAmount(weiAmount: string): string {
  return ethers.formatEther(weiAmount);
}

export default function ERC20Airdrop({
  isDisabled = false,
}: ERC20AirdropProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<TransactionResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDownloadExample = () => {
    const link = document.createElement("a");
    link.href = "/example.csv";
    link.download = "example.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target?.result;
        if (typeof csv === "string") {
          const results = Papa.parse<CSVRow>(csv, { header: true });
          console.log("Parsed CSV results:", results);

          if (results.errors.length > 0) {
            console.error("CSV parsing errors:", results.errors);
            alert(
              "Error parsing CSV file. Please check the console for details."
            );
            setCsvData([]);
            return;
          }

          const validRows = results.data.filter(
            (row) => row.toAddress && row.amount
          );
          console.log("Valid rows:", validRows);

          if (validRows.length === 0) {
            alert(
              "No valid data found in the CSV. Please ensure it contains 'toAddress' and 'amount' columns."
            );
            setCsvData([]);
          } else {
            setCsvData(validRows);
            setCurrentPage(1); // Reset to first page
          }
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    if (csvData.length === 0) {
      alert(
        "No valid data found in the CSV. Please ensure it contains 'toAddress' and 'amount' columns."
      );
      return;
    }

    setIsUploading(true);
    setResults([]);

    const data: TransactionData[] = csvData.map((row) => ({
      toAddress: row.toAddress,
      amount: row.amount,
    }));

    console.log("Data to send:", data);

    try {
      const response = await fetch("/api/sendTransactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setResults(result);
      console.log("API response:", result);
    } catch (error) {
      console.error("Error:", error);
      alert("Error sending transactions. Check console for details.");
    } finally {
      setIsUploading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = csvData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(csvData.length / itemsPerPage);

  const pageRange = 5; // Number of tabs to show
  let startPage = Math.max(currentPage - Math.floor(pageRange / 2), 1);
  let endPage = startPage + pageRange - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - pageRange + 1, 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="bg-black flex flex-col items-center p-4">
      <div className={isDisabled ? "opacity-50 pointer-events-none" : ""}>
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Airdrop ERC20 Tokens
          </h1>

          <div className="flex justify-center mb-6"></div>

          <div className="mb-6">
            <Button
              color="primary"
              onClick={handleDownloadExample}
              className="mb-4"
            >
              Download Example CSV
            </Button>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
          </div>

          {csvData.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Airdrop List
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase border-b">
                        Address
                      </th>
                      <br />
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase border-b">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((row, index) => (
                      <tr
                        key={`${row.toAddress}-${index}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 text-sm text-gray-700 border-b">
                          {row.toAddress}
                        </td>
                        <br />
                        <td className="px-4 py-2 text-sm text-gray-700 border-b">
                          {formatEthAmount(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center mt-4 mb-4">
                <Button
                  color="primary"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
                  className={`px-4 py-2 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  Next
                </Button>
              </div>

              <div className="flex justify-center items-center mt-4 mb-4">
                <Button
                  color="primary"
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className={`w-full py-3 mt-4 rounded-lg text-lg font-semibold ${
                    !file || isUploading
                      ? "bg-gray-300 cursor-not-allowed text-gray-500"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {isUploading ? "Uploading..." : "Send Transactions"}
                </Button>
              </div>
            </div>
          )}

          {results.length > 0 && <TransactionResults results={results} />}
        </div>
      </div>
    </div>
  );
}
