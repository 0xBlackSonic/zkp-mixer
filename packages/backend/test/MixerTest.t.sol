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
    uint256 public constant AMOUNT_TO_MIX = 0.1 ether;
    uint256 public constant _commitment = 2007634826500347288560380066454485684764345236883944333174236827696241407853;

    uint256[2] _pA = [0x2a32b35fc557e6109335c3d75131db7f49d86d5c2feea7d36979f0555394f397, 0x1584929ded2d108af8f73138e62c6432521f81e1dbd784129a056f0532844320];
    uint256[2][2] _pB = [
        [0x28e93229c1a1f02d7551b947e10667d26e431f295817cc8f0967a9692de0d4c8, 0x0111d78e5bf32426da87740aee4bf6cc445461abee30680ad153ea033fc53dab],
        [0x2339559e83eb1b6e5975cc5ed1568c16617ae1ef19b03e6cfea9d4527e0aaa31, 0x11fbe7f19e28f8abf7ae455dedb698d1f1043bdc1c86215d264a5631c1e10f19]
    ];
    uint256[2] _pC = [0x14bf995ca224a0bbac0dc0e2020f5e39ff656b75cbdb406577388ab19dc7628b, 0x1133b5e71fe31ae3d4753bda793e5fba1b9f07e5c7f02989da5c345b8dcf9ceb];
    uint256[2] _pubSignals = [0x0369462118df35f48b582d16d805915deca5a6d759747e99918ce55be63a3acd, 0x13ec3750aa7d23081bef32b193e294af9172efe9b020cd69523fd04d5400e932];
    
    uint256 _root = 1542941502093363457024366931750970880463690003344735934593470950032411343565;
    uint256 _nullifierHash = 9011301801169134828738630806485784610075687143355287607372773611803980654898;
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
        assert(address(mixer).balance == 1 ether);
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
        
        assert(address(_recipient).balance == STARTING_USER_BALANCE + 0.1 ether);
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
