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
    uint256 public constant _commitment = 19165890806313555524705334147302096061822381694322696261512399129851813389226;

    uint256[2] _pA = [0x134c8a59db013d2e07b539521d4b47ecbf1086bf7dfa2cc7ba9a5e39a45a9d22, 0x155c43139249dfbb998c25f1acf25b0fcb53f3acb523ac61961ee80a25914c75];
    uint256[2][2] _pB = [
        [0x261e77fcfd720d17439bb07c8a1947974c6c36547a021bbe2f8b47431bc0f670, 0x24fedaadef8b175a9abfbf4888eb4e14c64b4a268513a5416fe04170860cf6af],
        [0x2b1d6429eace7c1c2e09e25c1a768ba0288e7b59eb83646447d023d27a246915, 0x132e53cb8ba9445094d92e962f324a16091a8dff236f51fc1b38b104d4130c56]
    ];
    uint256[2] _pC = [0x15ecd94586723017c5e2237e5776341fccd06783f4cac56ac2c8e3cfe7161ede, 0x24ec2a6cfad6fdeece323616fac9b8e7dc134e52875fe700940568ca7da23e7b];
    uint256[2] _pubSignals = [0x3033707c9134a16582bad3fc80e4349217408e54c7ec3354b3fdeecbe599967c, 0x1de0c2be36cd0cde66a4c4384994a6e733e8e00d1f4f0e9a029c8387d3d9cd09];
    
    uint256 _root = 21801902286216644717955689113438874825822319351837855176225131132780661020284;
    uint256 _nullifierHash = 13514190418377444018604113086683764585758424600378075315019551520215403187465;
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
