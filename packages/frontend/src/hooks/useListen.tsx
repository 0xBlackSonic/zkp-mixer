/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from "ethers";
import { useMetamask } from "./useMetamask";

export const useListen = () => {
  const { dispatch } = useMetamask();

  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

  return () => {
    window.ethereum.on("accountsChanged", async (newAccounts: string[]) => {
      if (newAccounts.length > 0) {
        const newBalance = (
          await provider.getBalance(newAccounts[0])
        ).toHexString();
        const chainId = await provider.send("eth_chainId", []);

        dispatch({
          type: "connect",
          wallet: newAccounts[0],
          balance: newBalance,
          chainId,
        });
      } else {
        dispatch({ type: "disconnect" });
      }
    });

    window.ethereum.on("chainChanged", async (newChainId: string) => {
      if (newChainId) {
        const accounts = await provider.send("eth_requestAccounts", []);
        const newBalance = (
          await provider.getBalance(accounts[0])
        ).toHexString();

        dispatch({
          type: "changeNetwork",
          chainId: newChainId,
          balance: newBalance,
        });
      } else {
        dispatch({ type: "disconnect" });
      }
    });
  };
};
