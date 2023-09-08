#!/bin/bash

CIRCUIT=withdraw
buildDir="build"
ceremonyFinalName="ceremony_final"
#inputFileName="../input.json"
#witnessFileName="witness.wtns"
#outputFileName="output.json"

get_rand_num() {
    contrib=""
    for i in {0..15}
    do
        contrib="${contrib}${RANDOM}"
    done
}

mkdir -p ${buildDir}

# Compile the circuit
circom ${CIRCUIT}.circom --r1cs --wasm -o ${buildDir}

cd ${buildDir}

# Phase 1 powers of tau
snarkjs powersoftau new bn128 12 ceremony_0000.ptau -v

for i in {0..4}
do
    tempFileName0="ceremony_000$((i)).ptau"
    tempFileName1="ceremony_000$((i + 1)).ptau"
    touch ${tempFileName1}
    get_rand_num
    snarkjs powersoftau contribute ${tempFileName0} ${tempFileName1} --name="Contribution ${i}" -v -e="${contrib}"
done

snarkjs powersoftau prepare phase2 ${tempFileName1} ${ceremonyFinalName}.ptau -v

# Generate a .zkey file that will contain the proving and verification keys together with all phase 2 contributions
snarkjs groth16 setup ${CIRCUIT}.r1cs ${ceremonyFinalName}.ptau ${CIRCUIT}_0000.zkey

# Contribute to the phase 2 of the ceremony
get_rand_num
touch ${CIRCUIT}_0001.zkey
snarkjs zkey contribute ${CIRCUIT}_0000.zkey ${CIRCUIT}_final.zkey --name="Contribution 1" -v -e="${contrib}"


# Export the verification key
snarkjs zkey export solidityverifier ${CIRCUIT}_final.zkey Verifier.sol

rm ceremony_000*
rm withdraw_0000.zkey