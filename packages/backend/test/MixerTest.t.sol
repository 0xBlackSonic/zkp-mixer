// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {DeployMixer} from "../script/DeployMixer.s.sol";
import {Mixer} from "../src/Mixer.sol";
import {Test, console} from "forge-std/Test.sol";
import "forge-std/StdStorage.sol";
import {Errors} from "../src/libraries/Errors.sol";

contract MixerTest is Test {
    using stdStorage for StdStorage;

    Mixer mixer;

    address USER = makeAddr("user");
    uint256 public constant STARTING_USER_BALANCE = 10 ether;
    uint256 public constant AMOUNT_TO_MIX = 1 ether;
    uint256 public constant _commitment = 17879328282226301877439992096066063816311620879615344576643209992617454820288;

    uint256[2] _pA = [0x1ccef610e39e01096a42cdf4fbf2386f6d6433e1ee6fdca5f54869d5e4af277b, 0x01d01c5db8a94763377a8ea1cd256be7c52fd424d3c262c7ee66f4b2396c8194];
    uint256[2][2] _pB = [
        [0x107aee81689e11252eb759143a2ff8cfcc5145b3e6e79a2741a14d2ca39f2b02, 0x0f6e84f03e424c3b3771490d9eb5bf561e5f8b396a56d8336d4a148fb4d96764],
        [0x2bb87c79f5134aefaddc3d775199b1e24e07ed299b57cac1ba3e605f680f01f9, 0x0e787958a134ad7e8315ac103c01a1e4016fcb0af266f9edbcfef4d7bf44ba50]
    ];
    uint256[2] _pC = [0x048a7b62e434f479898e5d919e5794ecfc49791ec7f2a6a9602f4a0776a09487, 0x09f88f00214d2f9f900cb2abb86e909a8300d68c3a35a19cafe8f6d7dc2f4bbc];
    uint256[2] _pubSignals = [0x00d4975fd069aec337350f52ef4a483c25b0f6b306d4a5e0f81f2e283bda6aec, 0x1b5328bbb0457bf3bb1bd3af8779ad42c27f0c66b2e7df3bf33499a2e20d915b];
    
    uint256 _root = 375616324574748226612136368959974177615366861412660131597095524695117818604;
    uint256 _nullifierHash = 12359376348052244235739218173995697224051149308561270493321433319048857096539;
    address _recipient = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    function setUp() external {
        DeployMixer deployer = new DeployMixer();
        (mixer) = deployer.run();
        vm.deal(USER, STARTING_USER_BALANCE);
    }

    /////////////////////
    //  Deposit Tests  //
    /////////////////////

    function testDepositEthIntoMixer() public {
        vm.prank(USER);
        mixer.deposit{value: AMOUNT_TO_MIX}(_commitment);
        assert(mixer.existsCommitment(_commitment) == true);
    }

    function testMultipleDepositsIntoMixer() public {
        for (uint160 i = 0; i < 10; i++) {
            hoax(address(i), 1 ether);
            mixer.deposit{value: AMOUNT_TO_MIX}(uint256(i));
        }
        assert(address(mixer).balance == 10 ether);
    }

    function testDepositShouldFailIfDepositedAmountIsDifferent() public {
        vm.expectRevert(Errors.Mixer_DepositIncorrectAmount.selector);
        vm.prank(USER);
        mixer.deposit{value: 0.5 ether}(_commitment);
    }

    function testDepositShouldFailIfCommitmentIsDuplicated() public {
        vm.prank(USER);
        mixer.deposit{value: AMOUNT_TO_MIX}(_commitment);
        vm.expectRevert(Errors.Mixer_DuplicatedCommitmentHash.selector);
        vm.prank(USER);
        mixer.deposit{value: AMOUNT_TO_MIX}(_commitment);
    }

    function testDepositShouldFailIsMerkleTreeIsFull() public {
        uint256 slot = stdstore.target(address(mixer)).sig("nextLeafIdx()").find();
        vm.store(address(mixer), bytes32(slot), bytes32(uint256(2 ** 10)));
        vm.expectRevert(Errors.Mixer_TreeFull.selector);
        vm.prank(USER);
        mixer.deposit{value: AMOUNT_TO_MIX}(_commitment);
    }

    //////////////////////
    //  Withdraw Tests  //
    //////////////////////

    modifier alreadyDeposited() {
        vm.prank(USER);
        mixer.deposit{value: AMOUNT_TO_MIX}(_commitment);
        _;
    }

    modifier fakeData() {
        uint256 slot = stdstore.target(address(mixer)).sig(mixer.roots.selector).with_key(
            _root
        ).find();
        vm.store(address(mixer), bytes32(slot), bytes32(uint256(1)));

        _;
    }

    function testWithdrawPreviousDeposit() public alreadyDeposited fakeData {
        hoax(_recipient, STARTING_USER_BALANCE);
        mixer.withdraw(_pA, _pB, _pC, _pubSignals);
        
        assert(address(_recipient).balance == STARTING_USER_BALANCE + 1 ether);
    }

    function testWithdrawShouldFailIfNullifierAlreadySpent() public {
        uint256 slot = stdstore.target(address(mixer)).sig(mixer.nullifierHashes.selector).with_key(
            _nullifierHash
        ).find();
        vm.store(address(mixer), bytes32(slot), bytes32(uint256(1)));
        hoax(_recipient, STARTING_USER_BALANCE);
        vm.expectRevert(Errors.Mixer_AlreadySpent.selector);
        mixer.withdraw(_pA, _pB, _pC, _pubSignals);
    }

    function testWithdrawShouldFailIfRootDoesNotExists() public {
        hoax(_recipient, STARTING_USER_BALANCE);
        vm.expectRevert(Errors.Mixer_NotRoot.selector);
        mixer.withdraw(_pA, _pB, _pC, _pubSignals);
    }

    function testWithdrawShouldFailIfProofIsInvalid() public fakeData{
        hoax(_recipient, STARTING_USER_BALANCE);
        vm.expectRevert(Errors.Mixer_InvalidProof.selector);
        mixer.withdraw([uint256(0), uint256(0)], _pB, _pC, _pubSignals);
    }

    function testWithdrawShouldFailIfMixerCanNotPayToTheRecipient() public fakeData {
        hoax(_recipient, STARTING_USER_BALANCE);
        vm.expectRevert(Errors.Mixer_PaymentFailed.selector);
        mixer.withdraw(_pA, _pB, _pC, _pubSignals);
    }
}
