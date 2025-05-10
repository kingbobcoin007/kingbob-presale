# Royal Presale DApp

A Web3 presale DApp built with React, TailwindCSS, Firebase, and Ethers.js.

## Features

- **Wallet Connect**: Seamless MetaMask integration using ethers.js
- **Purchase Packages**: Four tiers ($100, $200, $500, $1000) with BNB payment
- **Firebase Backend**: Store user data, packages, referrals, and more
- **Referral System**: Earn $20 worth of tokens for each successful referral
- **Leaderboard**: View top referrers by count and value
- **Dashboard**: Track your package, tokens, refills, and claim status
- **Admin Panel**: Manage users and enable claiming after launch
- **Royal UI**: Elegant deep red and gold gradient theme with crown icons

## Setup Instructions

### Prerequisites

- Node.js and npm
- Firebase account
- MetaMask wallet

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/royal-presale-dapp.git
cd royal-presale-dapp
```

2. Install dependencies
```
npm install
```

3. Configure Firebase

Create a Firebase project and enable Firestore and Authentication. Then update the Firebase configuration in `src/firebase.ts` with your project details.

4. Update the presale wallet address

In `src/utils/ethersHelpers.ts`, replace `0xYOUR_PRESALE_WALLET_ADDRESS` with your actual presale wallet address.

5. Start the development server
```
npm start
```

## Project Structure

- `/src/components`: UI components
- `/src/utils`: Helper functions for ethers.js and other utilities
- `/src/firebase.ts`: Firebase configuration and database references
- `/src/App.tsx`: Main application with routing

## Deployment

To deploy the application:

```
npm run build
```

Then deploy the build folder to your hosting provider of choice (Firebase Hosting, Netlify, Vercel, etc.).

## License

MIT
