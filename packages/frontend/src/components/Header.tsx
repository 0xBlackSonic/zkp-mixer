import { Fragment } from "react";
import { ethers } from "ethers";
import { useListen } from "../hooks/useListen";
import { useMetamask } from "../hooks/useMetamask";
import { Menu, Transition } from "@headlessui/react";
import {
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { Loading } from "./Loading";

export default function Header() {
  const {
    dispatch,
    state: { status, isMetamaskInstalled, wallet, balance },
  } = useMetamask();
  const listen = useListen();

  const showConnectButton =
    status !== "pageNotLoaded" && isMetamaskInstalled && !wallet;

  const isConnected = status !== "pageNotLoaded" && typeof wallet === "string";
  const wrongNetwork = status === "wrongNetwork";

  const handleConnect = async () => {
    dispatch({ type: "loading" });
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const accounts = await provider.send("eth_requestAccounts", []);
    const chainId = await provider.send("eth_chainId", []);

    if (accounts.length > 0) {
      const balance = (await provider.getBalance(accounts[0])).toHexString();
      dispatch({ type: "connect", wallet: accounts[0], balance, chainId });

      listen();
    }
  };

  const handleDisconnect = () => {
    dispatch({ type: "disconnect" });
  };

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <nav>
      <div className="mx-auto max-w-5xl px-2 sm:px-6 lg:px-8 pt-3 font-mono">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-end">
              <img
                className="h-11 w-auto"
                src={"./logo.svg"}
                alt="Just a Mixer"
              />
              <span className="text-2xl font-thin text-teal-300">ixer</span>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {showConnectButton && (
              <div className="relative ml-3">
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    className="relative inline-flex items-center rounded-md py-2 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 border-2 border-teal-400 text-teal-400 px-7 font-thin hover:bg-teal-400 hover:bg-opacity-20 hover:text-teal-400 bg-teal-400 bg-opacity-10"
                    onClick={handleConnect}
                  >
                    {status === "loading" ? <Loading /> : "Connect Wallet"}
                  </button>
                </div>
              </div>
            )}

            {isConnected && (
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button
                    className={classNames(
                      wrongNetwork
                        ? "border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-yellow-300 bg-yellow-300"
                        : "border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-teal-400 bg-teal-400",
                      "relative inline-flex items-center rounded-md py-2 text-sm shadow-sm focus:outline-none border-2  px-6 font-thin  hover:bg-opacity-20  bg-opacity-10"
                    )}
                  >
                    {wrongNetwork && (
                      <ExclamationTriangleIcon className="mr-4 h-5 w-5" />
                    )}
                    {wallet.substring(0, 6) +
                      "..." +
                      wallet.substring(wallet.length - 6)}{" "}
                    <ChevronDownIcon className="ml-4 -mr-2 h-5 w-5" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-auto origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bg-teal-400 text-gray-900">
                    <Menu.Item>
                      <div
                        className="flex px-4 pt-1 pb-5 w-full items-baseline"
                        style={{ borderBottom: "2px solid #1a022c80" }}
                      >
                        {!wrongNetwork ? (
                          <>
                            <span className="text-sm mr-3">Balance: </span>
                            <span className="text-xs ml-auto font-thin">
                              {balance &&
                                (
                                  parseInt(balance) / 1000000000000000000
                                ).toFixed(4)}{" "}
                              ETH
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="text-xs p-1 text-center">
                              <p className="font-semibold">Wrong network!!</p>
                              <p className="mt-2">
                                Change to Sepolia or your local network.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={classNames(
                            active ? "bg-teal-500" : "",
                            "flex px-4 py-2 text-sm w-full justify-start"
                          )}
                          onClick={handleDisconnect}
                        >
                          Disconnect
                          <ArrowRightOnRectangleIcon className="h-5 w-5 ml-auto" />
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
