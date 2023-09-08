import { Tab } from "@headlessui/react";
import { ethers } from "ethers";

import Deposit from "./Deposit";
import Withdraw from "./Withdraw";

import { useMetamask } from "../hooks/useMetamask";
import * as mixerAbi from "../json/Mixer.json";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Container() {
  const {
    dispatch,
    state: { status, wallet },
  } = useMetamask();

  const disabled =
    status === "pageNotLoaded" ||
    status === "wrongNetwork" ||
    typeof wallet !== "string";

  const updateBalance = async () => {
    if (wallet) {
      const balance = (await provider.getBalance(wallet)).toHexString();
      dispatch({ type: "update", balance });
    }
  };

  const mixerInterface = new ethers.utils.Interface(mixerAbi.abi);
  const mixerAddress = import.meta.env.VITE_MIXER_ADDRESS;

  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

  return (
    <div className="mx-auto max-w-3xl px-2 sm:px-6 lg:px-8 pt-8 pb-20 font-mono text-teal-400 text-sm ">
      <div className="px-2 sm:px-16 text-gray-300 text-xs mb-8 text-opacity-80 flex flex-col gap-4 text-center">
        <p>
          This is a test for educational purpose of how a mixer works. It's only
          required to deposit 0.1 ETH and save the generated proof in a safe
          place. Then with a different wallet than the one used to make the
          deposit, perform the withdrawal using the previously generated proof.
        </p>
      </div>
      <Tab.Group>
        <Tab.List className="flex space-x-1">
          <Tab
            className={({ selected }) =>
              classNames(
                "w-full rounded-t-md py-2.5 text-sm font-medium",
                "focus:outline-none",
                selected
                  ? "bg-teal-400 text-gray-900"
                  : "text-teal-400 bg-gray-500 bg-opacity-20"
              )
            }
          >
            Deposit
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                "w-full rounded-t-md py-2.5 text-sm font-medium",
                "focus:outline-none",
                selected
                  ? "bg-teal-400 text-gray-900"
                  : "text-teal-400 bg-gray-500 bg-opacity-20"
              )
            }
          >
            Withdraw
          </Tab>
        </Tab.List>
        <Tab.Panels className="border-2 border-teal-400 rounded-b-md">
          <Tab.Panel>
            <Deposit
              isDisabled={disabled}
              wallet={wallet}
              provider={provider}
              updateBalance={updateBalance}
              mixerInterface={mixerInterface}
              mixerAddress={mixerAddress}
            />
          </Tab.Panel>
          <Tab.Panel>
            <Withdraw
              isDisabled={disabled}
              wallet={wallet}
              provider={provider}
              updateBalance={updateBalance}
              mixerInterface={mixerInterface}
              mixerAddress={mixerAddress}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
