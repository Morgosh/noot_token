import React, { useState, useEffect } from "react";
import { useWriteContractSponsored } from "@abstract-foundation/agw-react";
import { useWaitForTransactionReceipt, useAccount, useWriteContract, usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import { getGeneralPaymasterInput } from "viem/zksync";
import { nootAbi, NOOT_CONTRACT_ADDRESS, PAYMASTER_ADDRESS } from "@/contract/NootABI";

export function NootMint() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [freeMintAmount, setFreeMintAmount] = useState<string>("100,000");
  const [hasFreeMint, setHasFreeMint] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [paidMintFee, setPaidMintFee] = useState<bigint | null>(null);
  
  // Free mint transaction handling
  const {
    writeContractSponsored: writeFreeMint,
    data: freeMintTxHash,
    isPending: freeMintPending,
    error: freeMintError
  } = useWriteContractSponsored();

  // Paid mint transaction handling
  const {
    writeContract: writePaidMint,
    data: paidMintTxHash,
    isPending: paidMintPending,
    error: paidMintError
  } = useWriteContract();

  // Transaction receipt for free mint
  const { data: freeMintReceipt } = useWaitForTransactionReceipt({
    hash: freeMintTxHash,
  });

  // Transaction receipt for paid mint
  const { data: paidMintReceipt } = useWaitForTransactionReceipt({
    hash: paidMintTxHash,
  });

  // Read contract data directly in useEffect
  useEffect(() => {
    const fetchContractData = async () => {
      if (!address || !publicClient) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Get free mint status
        const hasClaimedFreeMint = await publicClient.readContract({
          address: NOOT_CONTRACT_ADDRESS,
          abi: nootAbi,
          functionName: 'hasClaimedFreeMint',
          args: [address],
        });
        
        console.log("hasClaimedFreeMint", hasClaimedFreeMint);
        // If hasClaimedFreeMint is true, user can't do free mint
        setHasFreeMint(!hasClaimedFreeMint);
        
        // Get free mint amount
        const mintAmount = await publicClient.readContract({
          address: NOOT_CONTRACT_ADDRESS,
          abi: nootAbi,
          functionName: 'FREE_MINT_AMOUNT',
        });
        
        // Format with commas
        setFreeMintAmount(Number(formatUnits(mintAmount as bigint, 18)).toLocaleString());
        
        // Get paid mint fee
        const fee = await publicClient.readContract({
          address: NOOT_CONTRACT_ADDRESS,
          abi: nootAbi,
          functionName: 'PAID_MINT_FEE',
        });
        
        setPaidMintFee(fee as bigint);
      } catch (error) {
        console.error("Error reading contract:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContractData();
  }, [address, publicClient]);

  // Handle free mint
  const handleFreeMint = () => {
    if (!address) return;

    writeFreeMint({
      abi: nootAbi,
      address: NOOT_CONTRACT_ADDRESS,
      functionName: "freeMint",
      paymaster: PAYMASTER_ADDRESS,
      paymasterInput: getGeneralPaymasterInput({
        innerInput: "0x",
      }),
      account: address,
    });
  };

  // Handle paid mint
  const handlePaidMint = () => {
    if (!address || !paidMintFee) return;

    writePaidMint({
      abi: nootAbi,
      address: NOOT_CONTRACT_ADDRESS,
      functionName: "paidMint",
      args: [],
      value: paidMintFee,
      account: address,
    });
  };

  // Shows if a transaction was successful 
  //@ts-ignore
  const renderTransactionStatus = (txReceipt: any, txType: string) => {
    if (!txReceipt) return null;
    
    return (
      <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg text-center w-full">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)]">
            {txType} Success
            <span className="ml-1 text-green-500">✅</span>
          </p>

          <a
            href={`https://sepolia.abscan.org/tx/${txReceipt.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 underline"
          >
            View on Explorer
          </a>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="text-center mb-2">
        <h2 className="text-lg font-bold font-[family-name:var(--font-roobert)]">Noot Token</h2>
        <p className="text-sm text-gray-400">Mint your Noot tokens</p>
      </div>

      {/* Show free mint button only if user hasn't claimed it yet */}
      {hasFreeMint && (
        <div className="flex flex-col gap-2">
          <button
            className={`rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] w-full
              ${
                freeMintPending
                  ? "bg-gray-500 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 hover:cursor-pointer border-transparent"
              }`}
            onClick={handleFreeMint}
            disabled={freeMintPending || !!freeMintReceipt}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="w-full text-center">Free Mint ({freeMintAmount} Tokens)</span>
          </button>

          {renderTransactionStatus(freeMintReceipt, "Free Mint")}
          
          {freeMintError && (
            <p className="text-red-500 text-sm mt-2">Error: {freeMintError.message}</p>
          )}
        </div>
      )}

      {/* Always show paid mint button */}
      <div className="flex flex-col gap-3">
        <button
          className={`rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] w-full
            ${
              paidMintPending
                ? "bg-gray-500 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 hover:cursor-pointer border-transparent"
            }`}
          onClick={handlePaidMint}
          disabled={paidMintPending || !!paidMintReceipt}
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="w-full text-center">Paid Mint ({freeMintAmount} Tokens)</span>
        </button>
        <p className="text-xs text-gray-400 text-center">
          Fee: {paidMintFee ? Number(formatUnits(paidMintFee, 18)) : 0.01} ETH
        </p>

        {renderTransactionStatus(paidMintReceipt, "Paid Mint")}
        
        {paidMintError && (
          <p className="text-red-500 text-sm mt-2">Error: {paidMintError.message}</p>
        )}
      </div>
    </div>
  );
} 