/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { toast } from "react-toastify";

import { ActionProps } from "../types/actions.type";

import { Loading } from "./Loading";
import $u from "../utils/$u";
import { ethers } from "ethers";

import { MerkleTree } from "../utils/merkleTree";

export default function Withdraw({
  isDisabled,
  wallet,
  provider,
  updateBalance,
  mixerInterface,
  mixerAddress,
}: ActionProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [userProof, setUserProof] = useState<string>("");

  const withdraw = async () => {
    if (userProof) {
      try {
        setLoading(true);
        const proofElements = JSON.parse(atob(userProof));
        const SnarkJS = window["snarkjs"];

        const contract = new ethers.Contract(
          mixerAddress,
          mixerInterface,
          provider
        );

        // Get all past events
        const events = await contract.queryFilter(
          contract.filters.Deposit(),
          0,
          "latest"
        );

        // leaves array
        const leaves: bigint[] = events
          .sort((a: any, b: any) => a.args.leafIndex - b.args.leafIndex)
          .map((e: any) => BigInt(e.args.commitment));

        const lastLeaf = leaves.length - 1;

        // Our commitment leaf
        const leafIndex: any = Number(
          events.find(
            (e: any) =>
              e.args.commitment.toString() === proofElements.commitment
          )?.args?.leafIndex
        );

        if (leafIndex < 0 || leafIndex === undefined) {
          toast.error("Invalid proof!");
          return;
        }

        // Recreate merkle tree
        const tree = new MerkleTree(leaves, 10);

        const root = tree.getRoot();

        if (!(await contract.roots(root))) {
          toast.error("Merkle tree is corrupted!");
          return;
        }

        const isSpent = await contract.nullifierHashes(
          proofElements.nullifierHash
        );

        if (isSpent) {
          toast.error("Proof already spent!");
          return;
        }

        // Regenerate the hash pairings
        const { hashPairings, hashDirections, commitments } =
          tree.getHashElements(leafIndex, lastLeaf);

        const proofInput = {
          root,
          nullifierHash: proofElements.nullifierHash,
          recipient: wallet,
          secret: $u.BN256ToBin(proofElements.secret).split(""),
          nullifier: $u.BN256ToBin(proofElements.nullifier).split(""),
          hashPairings,
          hashDirections,
          commitments,
        };

        const { proof, publicSignals } = await SnarkJS.groth16.fullProve(
          proofInput,
          "/withdraw.wasm",
          "/withdraw_final.zkey"
        );

        const callInputs = [
          proof.pi_a.slice(0, 2).map($u.BN256ToHex),
          proof.pi_b
            .slice(0, 2)
            .map((row: any) => $u.reverseCoordinate(row.map($u.BN256ToHex))),
          proof.pi_c.slice(0, 2).map($u.BN256ToHex),
          publicSignals.slice(0, 2).map($u.BN256ToHex),
        ];

        const callData = mixerInterface.encodeFunctionData(
          "withdraw",
          callInputs
        );

        const tx = {
          to: mixerAddress,
          from: wallet === null ? undefined : wallet,
          gasLimit: 3000000,
          data: callData,
        };

        const signer = provider.getSigner();
        const txHash = await signer.sendTransaction(tx);

        await txHash.wait();

        setUserProof("");
        toast("Successful withdrawal!");
      } catch (e) {
        toast.error("Something went wrong");
        console.log(e);
      } finally {
        await updateBalance();
        setLoading(false);
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-2 sm:px-6 lg:px-8 py-3 font-mono text-teal-400">
      <div className="flex flex-col">
        <label htmlFor="proof-area" className="mb-2">
          Your Secret Proof
        </label>
        <textarea
          id="proof-area"
          rows={10}
          className="p-5 text-xs text-gray-300 bg-gray-500 bg-opacity-20 rounded-md w-full focus:outline-none"
          style={{
            scrollbarColor: "rgb(45,212,191) rgb(45,212,191,0.05)",
            scrollbarWidth: "auto",
            resize: "none",
          }}
          onChange={(event) => setUserProof(event.target.value)}
          value={userProof}
        />
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          disabled={isDisabled || !userProof}
          className="relative inline-flex items-center rounded-md py-2 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 border-2 border-teal-400 text-teal-400 px-7 font-thin hover:bg-teal-400 hover:bg-opacity-20 hover:text-teal-400 bg-teal-400 bg-opacity-10 mt-4"
          onClick={withdraw}
        >
          {loading ? <Loading /> : "Withdraw 0.1 ETH"}
        </button>
      </div>
    </div>
  );
}
