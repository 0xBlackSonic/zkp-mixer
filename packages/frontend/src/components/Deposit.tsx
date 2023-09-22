/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { ethers } from "ethers";

import { ActionProps } from "../types/actions.type";

import $u from "../utils/$u";
import { Loading } from "./Loading";
import Modal from "./Modal";

import wc from "../../circuit/witness_calculator";

export default function Deposit({
  isDisabled,
  wallet,
  provider,
  updateBalance,
  mixerInterface,
  mixerAddress,
}: ActionProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [proof, updateProof] = useState<string>();
  const [show, setShow] = useState<boolean>(false);

  const depositEther = async () => {
    setLoading(true);
    const secret = ethers.BigNumber.from(
      ethers.utils.randomBytes(32)
    ).toString();

    const nullifier = ethers.BigNumber.from(
      ethers.utils.randomBytes(32)
    ).toString();

    const input = {
      secret: $u.BN256ToBin(secret).split(""),
      nullifier: $u.BN256ToBin(nullifier).split(""),
    };

    const res = await fetch("/deposit.wasm");
    const buffer = await res.arrayBuffer();
    const depositWC = await wc(buffer);

    const r = await depositWC.calculateWitness(input, 0);

    const commitment = r[1];
    const nullifierHash = r[2];

    const value = ethers.BigNumber.from("100000000000000000").toHexString();

    const tx = {
      to: mixerAddress,
      from: wallet === null ? undefined : wallet,
      value: value,
      data: mixerInterface.encodeFunctionData("deposit", [commitment]),
      gasLimit: 3000000,
    };

    try {
      const signer = provider.getSigner();
      const txHash = await signer.sendTransaction(tx);

      await txHash.wait();

      const proofElements = {
        secret,
        nullifier,
        nullifierHash: `${nullifierHash}`,
        commitment: `${commitment}`,
      };

      updateProof(btoa(JSON.stringify(proofElements)));

      setShow(!show);
    } catch (e) {
      console.log(e);
    } finally {
      await updateBalance();
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-2 sm:px-6 lg:px-8 py-3 font-mono text-teal-400">
      <div className="mb-4">
        <p>Deposit 0.1 ETH and save the proof generated.</p>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          disabled={isDisabled}
          className="relative inline-flex items-center rounded-md py-2 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 border-2 border-teal-400 text-teal-400 px-7 font-thin hover:bg-teal-400 hover:bg-opacity-20 hover:text-teal-400 bg-teal-400 bg-opacity-10 w-fit"
          onClick={depositEther}
        >
          {loading ? <Loading /> : "Deposit 0.1 ETH"}
        </button>
      </div>
      <Modal proof={proof} show={show} setShow={() => setShow(!show)} />
    </div>
  );
}
