#!/bin/bash

backendFolder="packages/backend"
frontendFolder="packages/frontend"
circuitFolder="packages/circuit"

cd ${circuitFolder}

# Build the circuits
bash buildDeposit.sh 
bash buildWithdraw.sh

cd ../..
mkdir -p ${frontendFolder}/circuit

# Copy all the generated files
cp ${circuitFolder}/build/deposit_js/witness_calculator.js ${frontendFolder}/circuit
cp ${circuitFolder}/build/deposit_js/deposit.wasm ${frontendFolder}/public
cp ${circuitFolder}/build/withdraw_js/withdraw.wasm ${frontendFolder}/public
cp ${circuitFolder}/build/withdraw_final.zkey ${frontendFolder}/public
cp ${circuitFolder}/build/Verifier.sol ${backendFolder}/src




