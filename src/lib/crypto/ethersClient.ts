import { BrowserProvider, JsonRpcProvider, Wallet, Contract, parseUnits } from 'ethers';

export type EvmNetworkConfig = {
  rpcUrl: string;
  chainId?: number;
};

export type TransferResult = {
  txHash: string;
};

const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 value) returns (bool)'
];

export function getJsonRpcProvider(config: EvmNetworkConfig) {
  return new JsonRpcProvider(config.rpcUrl, config.chainId);
}

export function getBrowserProvider(): BrowserProvider | null {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new BrowserProvider((window as any).ethereum);
  }
  return null;
}

export async function sendNativeToken(
  rpcConfig: EvmNetworkConfig,
  privateKey: string,
  to: string,
  amountEth: string
): Promise<TransferResult> {
  const provider = getJsonRpcProvider(rpcConfig);
  const wallet = new Wallet(privateKey, provider);
  const tx = await wallet.sendTransaction({ to, value: parseUnits(amountEth, 18) });
  const receipt = await tx.wait();
  return { txHash: receipt?.hash || tx.hash };
}

export async function sendErc20Token(
  rpcConfig: EvmNetworkConfig,
  privateKey: string,
  tokenAddress: string,
  to: string,
  amount: string
): Promise<TransferResult> {
  const provider = getJsonRpcProvider(rpcConfig);
  const wallet = new Wallet(privateKey, provider);
  const token = new Contract(tokenAddress, ERC20_ABI, wallet);
  const decimals: number = await token.decimals();
  const tx = await token.transfer(to, parseUnits(amount, decimals));
  const receipt = await tx.wait();
  return { txHash: receipt?.hash || tx.hash };
}


