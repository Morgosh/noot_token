import { parseAbi } from "viem";

// Noot contract ABI
export const nootAbi = parseAbi([
  "function freeMint() public",
  "function paidMint() public payable",
  "function hasClaimedFreeMint(address) public view returns (bool)",
  "function FREE_MINT_AMOUNT() public view returns (uint256)",
  "function PAID_MINT_FEE() public view returns (uint256)"
]);

// Contract address - this should be the address where your Noot contract is deployed
export const NOOT_CONTRACT_ADDRESS = "0xe3d94b74131f3d831b407fcef76e7b8ee78f8096"; // Replace with actual contract address
export const PAYMASTER_ADDRESS = "0x5407B5040dec3D339A9247f3654E59EEccbb6391"; // Replace if needed 