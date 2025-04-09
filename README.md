# Noot Token Mint with Abstract Global Wallet and Next.js

This example shows how to interact with the Noot ERC20 token contract using the [Abstract Global Wallet](https://abs.xyz/) SDK inside a [Next.js](https://nextjs.org/) application.

## Features

- Connect with Abstract Global Wallet
- Free mint functionality (100,000 tokens, once per wallet)
- Paid mint functionality (0.01 ETH per mint)
- Transaction status tracking

## Noot Contract

The application interacts with the Noot ERC20 token contract which has the following features:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Noot is ERC20 {
    address public owner;
    mapping(address => bool) public admins;
    mapping(address => uint256) public freeMintAmount;
    
    uint256 public constant FREE_MINT_LIMIT = 100000;
    uint256 public constant PAID_MINT_FEE = 0.01 ether;

    // Contract functions include:
    // - freeMint(): Allows users to mint FREE_MINT_LIMIT tokens once per wallet
    // - paidMint(uint256 amount): Allows users to mint tokens by paying PAID_MINT_FEE
}
```

## Local Development

1. Get a copy of the repository:

   ```bash
   git clone https://github.com/yourusername/noot-mint.git
   cd noot-mint
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Update the contract address in `src/contract/NootABI.ts` with your deployed Noot contract address

4. Run the development server

   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Useful Links

- [Docs](https://docs.abs.xyz/)
- [Official Site](https://abs.xyz/)
- [GitHub](https://github.com/Abstract-Foundation)
- [X](https://x.com/AbstractChain)
- [Discord](https://discord.com/invite/abstractchain)
