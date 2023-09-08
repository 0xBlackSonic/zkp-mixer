// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Script} from "forge-std/Script.sol";
import {Mixer} from "../src/Mixer.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployMixer is Script {
    function run() external returns (Mixer) {
        HelperConfig helperConfig = new HelperConfig();
        (address hasher, address verifier) = helperConfig.activeNetworkConfig();
        
        vm.startBroadcast();
        Mixer mixer = new Mixer(hasher, verifier);
        vm.stopBroadcast();

        return mixer;
    }
}
