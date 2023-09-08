import { ethers } from "ethers";

export type ActionProps = {
  isDisabled: boolean;
  wallet: string | null;
  provider: ethers.providers.Web3Provider;
  updateBalance: () => Promise<void>;
  mixerInterface: ethers.utils.Interface;
  mixerAddress: string;
};
