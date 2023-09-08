# ZKP Mixer

This is a test for educational purpose of how a zero knowledge proof mixer works.

Live test [Here](https://zkp-mixer-0xblacksonic.vercel.app/)

### _- Work in Progress -_

### Requirements:

- [NodeJs](https://nodejs.org/)
- [Circom 2](https://docs.circom.io/getting-started/installation/)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)

## Build the project

1. Into the main directory execute:

```
$ bash build.sh
```

2. Into the `frontend/circuit` directory we need to modify the `witness_calculater.js`. Open this file and replace `module.exports =` for `export default`.

3. In a terminal window go to the backend directory and run a new `anvil` instance.

4. Open a new terminal window and deploy the contracts in your local network:

```
$ forge script script/DeployMixer.s.sol --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
```

5. Into the `frontend` directory rename `.env.example` for `.env` and change the mixer contract variable if your deployed contract address is different.

6. Install all the frontend dependencies and run the project

```
$ yarn install
$ yarn dev
```

## Manual build

### Circuits

Into the circuit folder build the `Deposit` circuit first

```
$ bash buildDeposit.sh
```

and then the `Whitdraw` circuit.

```
$ bash buildWhitdraw.sh
```

### Backend

1. Copy the `Verifier.sol` contract located in the `circuit/build` folder into the `src` directory.

2. In a terminal window run a new `anvil` instance.

3. Open a new terminal window and deploy the contracts in your local network:

```
$ forge script script/DeployMixer.s.sol --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
```

### Frontend

1. Create a folder named `circuit` into the frontend folder.

2. Copy the `witness_calculator.js` file located in the `circuit/build/deposit_js` folder into the previous folder created.

3. Modify the `witness_calculater.js` file replacing `module.exports =` for `export default`.

4. Copy the `deposit.wasm` file located in the `circuit/build/deposit_js` folder into the public folder.

5. Copy the `withdraw.wasm` file located in the `circuit/build/withdraw_js` folder into the public folder.

6. Copy the `withdraw_final.zkey` file located in the `circuit/build` folder into the public folder.

7. Install all the frontend dependencies and run the project

```
$ yarn install
$ yarn dev
```
