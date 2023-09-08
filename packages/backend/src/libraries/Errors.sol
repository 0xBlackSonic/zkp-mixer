// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

library Errors {
    error Mixer_DepositIncorrectAmount();
    error Mixer_DuplicatedCommitmentHash();
    error Mixer_TreeFull();
    error Mixer_AlreadySpent();
    error Mixer_NotRoot();
    error Mixer_InvalidProof();
    error Mixer_PaymentFailed();
    error Mixer_ContractVerifierError();
}
