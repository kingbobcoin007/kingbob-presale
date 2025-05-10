// @ts-nocheck
import { ethers } from 'ethers';

// Contract address on BNB Chain
export const CONTRACT_ADDRESS = '0x1664a66d105B93d44F3B107a370648A5Bf68f0a5';

// ABI for the KingBob contract
export const CONTRACT_ABI = [
  // Package management
  'function buyPackage(string packageId) external payable',
  'function getPackage(string packageId) external view returns (uint256 price, uint256 tokenAmount, uint256 refillCount)',
  'function refill(string packageId) external',
  
  // User data
  'function getTokenBalance(address user) external view returns (uint256)',
  'function getRefillCount(address user) external view returns (uint256)',
  'function getReferral(address user) external view returns (address)',
  'function getClaimStatus(address user) external view returns (bool)',
  
  // Referrals
  'function referrals(address referrer) external view returns (uint256)',
  
  // Claiming
  'function claim() external',
  'function setClaimStatus(address user, bool status) external',
  'function setGlobalClaimStatus(bool status) external',
  'function getGlobalClaimStatus() external view returns (bool)'
];

// Get contract instance
export const getContract = (provider: ethers.Provider | ethers.Signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

// Buy package
export const buyPackage = async (
  signer: ethers.Signer,
  packageId: string,
  price: string,
  referrer?: string
) => {
  const contract = getContract(signer);
  
  // If referrer is provided, we need to set it first
  if (referrer && referrer !== '0x0000000000000000000000000000000000000000') {
    console.log(`Using referrer: ${referrer}`);
    // Implementation depends on contract design
  }
  
  // Execute the buyPackage transaction
  const tx = await contract.buyPackage(packageId, {
    value: ethers.parseEther(price)
  });
  
  return await tx.wait();
};

// Get token balance
export const getTokenBalance = async (provider: ethers.Provider, address: string) => {
  const contract = getContract(provider);
  const balance = await contract.getTokenBalance(address);
  return ethers.formatUnits(balance, 18); // Assuming 18 decimals
};

// Get refill count
export const getRefillCount = async (provider: ethers.Provider, address: string) => {
  const contract = getContract(provider);
  const count = await contract.getRefillCount(address);
  return count.toString();
};

// Get referrer address
export const getReferrer = async (provider: ethers.Provider, address: string) => {
  const contract = getContract(provider);
  return await contract.getReferral(address);
};

// Get claim status
export const getClaimStatus = async (provider: ethers.Provider, address: string) => {
  const contract = getContract(provider);
  return await contract.getClaimStatus(address);
};

// Get global claim status
export const getGlobalClaimStatus = async (provider: ethers.Provider) => {
  const contract = getContract(provider);
  return await contract.getGlobalClaimStatus();
};

// Set claim status (admin only)
export const setClaimStatus = async (signer: ethers.Signer, userAddress: string, status: boolean) => {
  const contract = getContract(signer);
  const tx = await contract.setClaimStatus(userAddress, status);
  return await tx.wait();
};

// Set global claim status (admin only)
export const setGlobalClaimStatus = async (signer: ethers.Signer, status: boolean) => {
  const contract = getContract(signer);
  const tx = await contract.setGlobalClaimStatus(status);
  return await tx.wait();
};

// Claim tokens
export const claimTokens = async (signer: ethers.Signer) => {
  const contract = getContract(signer);
  const tx = await contract.claim();
  return await tx.wait();
};

// Refill package
export const refillPackage = async (signer: ethers.Signer, packageId: string) => {
  const contract = getContract(signer);
  const tx = await contract.refill(packageId);
  return await tx.wait();
};

// Get referral count
export const getReferralCount = async (provider: ethers.Provider, address: string) => {
  const contract = getContract(provider);
  const count = await contract.referrals(address);
  return count.toString();
};

// Get package details
export const getPackageDetails = async (provider: ethers.Provider, packageId: string) => {
  const contract = getContract(provider);
  const [price, tokenAmount, refillCount] = await contract.getPackage(packageId);
  
  return {
    price: ethers.formatEther(price),
    tokenAmount: ethers.formatUnits(tokenAmount, 18), // Assuming 18 decimals
    refillCount: refillCount.toString()
  };
};
