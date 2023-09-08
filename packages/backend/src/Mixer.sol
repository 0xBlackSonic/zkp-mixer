// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Hasher} from "./MiMC5Sponge.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Errors} from "./libraries/Errors.sol";
import {Groth16Verifier} from "./Verifier.sol";

contract Mixer is ReentrancyGuard {
    Groth16Verifier verifier;
    Hasher hasher;

    uint8 public treeLevel = 10;
    uint256 public denomination = 0.1 ether;
    uint256 public nextLeafIdx = 0;

    mapping(uint256 => bool) public roots;
    mapping(uint8 => uint256) lastLevelHash;
    mapping(uint256 => bool) public nullifierHashes;
    mapping(uint256 => bool) private commitments;

    uint256[10] levelDefaults = [
        10743404813422566213810265938167437702127461516201222674448064898294038940299,
        70735641545887519915958103985255929727971262741956848692166476954535386434280,
        31279121419317992445067586500624897568069772033690152598465994000415979732675,
        39290719674426613021656083638863750573596787512156587996151539663895912223742,
        60715302013634620279562078643443940965481317558744800032483111295266908252001,
        14425213735138915338047929267951235316522897668841370511194343269989347760555,
        72051951690337201200119845553030809436309900161084863070192560066843051838251,
        85195535268388857280560978437974547683014948528301999669341414606440843531463,
        64610829910958927090267841233171064846513580936036363550988647886413898466569,
        72051951690337201200119845553030809436309900161084863070192560066843051838251
    ];

    event Deposit(uint256 root, uint256[10] hashPairings, uint8[10] hashDirections);
    event Withdrawal(address to, uint256 nullifierHash);

    constructor(address _hasher, address _verifier) {
        hasher = Hasher(_hasher);
        verifier = Groth16Verifier(_verifier);
    }

    function deposit(uint256 _commitment) external payable nonReentrant {
        if (msg.value != denomination) {
            revert Errors.Mixer_DepositIncorrectAmount();
        }

        if (commitments[_commitment]) {
            revert Errors.Mixer_DuplicatedCommitmentHash();
        }

        if (nextLeafIdx >= 2 ** treeLevel) {
            revert Errors.Mixer_TreeFull();
        }

        uint256 newRoot;
        uint256[10] memory hashPairings;
        uint8[10] memory hashDirections;

        uint256 currentIdx = nextLeafIdx;
        uint256 currentHash = _commitment;

        uint256 left;
        uint256 right;
        uint256[2] memory ins;

        for (uint8 i = 0; i < treeLevel; i++) {
            lastLevelHash[treeLevel] = currentHash;

            if (currentIdx % 2 == 0) {
                left = currentHash;
                right = levelDefaults[i];
                hashPairings[i] = levelDefaults[i];
                hashDirections[i] = 0;
            } else {
                left = lastLevelHash[i];
                right = currentHash;
                hashPairings[i] = lastLevelHash[i];
                hashDirections[i] = 1;
            }

            ins[0] = left;
            ins[1] = right;

            (uint256 h) = hasher.MiMC5Sponge{gas: 300000}(ins, _commitment);

            currentHash = h;
            currentIdx = currentIdx / 2;
        }

        newRoot = currentHash;
        roots[newRoot] = true;
        nextLeafIdx += 1;

        commitments[_commitment] = true;

        emit Deposit(newRoot, hashPairings, hashDirections);
    }

    function existsCommitment(uint256 _commitment) public view returns (bool) {
        return !!commitments[_commitment];
    }

    function withdraw(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[2] calldata _pubSignals
    ) external payable nonReentrant {
        uint256 _root = _pubSignals[0];
        uint256 _nullifierHash = _pubSignals[1];

        if (nullifierHashes[_nullifierHash]) {
            revert Errors.Mixer_AlreadySpent();
        }

        if (!roots[_root]) {
            revert Errors.Mixer_NotRoot();
        }

        uint256 _addr = uint256(uint160(msg.sender));

        bool verifyProof = verifier.verifyProof(_pA, _pB, _pC, [_root, _nullifierHash, _addr]);

        if (!verifyProof) {
            revert Errors.Mixer_InvalidProof();
        }

        nullifierHashes[_nullifierHash] = true;
        address payable target = payable(msg.sender);

        (bool ok,) = target.call{value: denomination}("");

        if (!ok) {
            revert Errors.Mixer_PaymentFailed();
        }

        emit Withdrawal(msg.sender, _nullifierHash);
    }
}
