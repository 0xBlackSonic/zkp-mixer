// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Hasher} from "../src/MiMC5Sponge.sol";
import {Groth16Verifier} from "../src/Verifier.sol";

contract HelperConfig is Script {
    struct NetworkConfig {
        address hasher;
        address verifier;
    }

    NetworkConfig public activeNetworkConfig;

    constructor() {
        if (block.chainid == 11155111) {
            activeNetworkConfig = getOrCreateSepoliaEthConfig();
        } else {
            activeNetworkConfig = createAnvilEthConfig();
        }
    }

    function getOrCreateSepoliaEthConfig() public returns (NetworkConfig memory) {
        // Change this variable to true if you want to deploy all the contracts
        bool completeDeploy = true;

        address hasher;
        address verifier;

        if (completeDeploy) {
            vm.startBroadcast();
            Hasher hasherContract = new Hasher();
            Groth16Verifier verifierContract = new Groth16Verifier();
            vm.stopBroadcast();

            hasher = address(hasherContract);
            verifier = address(verifierContract);
        } else {
            // change this when first deploy is done
            hasher = 0xfF1c602135989F3De35336B9772ca99e554F9E5E;
            verifier = 0xaD86263B23B5FDe325d38E054E6B2b639DE15841;
        }

        NetworkConfig memory sepoliaConfig = NetworkConfig({hasher: hasher, verifier: verifier});

        return sepoliaConfig;
    }

    function createAnvilEthConfig() public returns (NetworkConfig memory) {
        vm.startBroadcast();
        Hasher hasher = new Hasher();
        Groth16Verifier verifier = new Groth16Verifier();
        vm.stopBroadcast();

        NetworkConfig memory anvilConfig = NetworkConfig({hasher: address(hasher), verifier: address(verifier)});

        return anvilConfig;
    }
}
