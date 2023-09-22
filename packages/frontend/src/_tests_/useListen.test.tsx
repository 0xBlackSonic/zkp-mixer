/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from "@testing-library/react-hooks";
import { generateTestingUtils } from "eth-testing";
import { MetamaskProvider } from "../hooks/useMetamask";
import { useListen } from "../hooks/useListen";

describe("useListen", () => {
  const metamaskTestingUtils = generateTestingUtils({
    providerType: "MetaMask",
    verbose: true,
  });

  beforeAll(() => {
    window.ethereum = metamaskTestingUtils.getProvider();
    metamaskTestingUtils.mockRequestAccounts([
      "0x4eae888641431Afe6533C042308C638d66D2cF35",
      "0xf57752d00A6a7530cd66554d3ab2B409DB417BFC",
    ]);
    metamaskTestingUtils.mockBalance(
      "0xf57752d00A6a7530cd66554d3ab2B409DB417BFC",
      "0xde0b6b3a7640000"
    );
  });

  test("Should call accountsChanged listener when account is changed", async () => {
    vitest.spyOn(window.ethereum, "on").mockImplementationOnce(() => {});
    metamaskTestingUtils.lowLevel.mockRequest("eth_chainId", () => {
      return "0x1";
    });

    const { result } = renderHook(useListen, {
      wrapper: MetamaskProvider,
    });
    result.current();

    metamaskTestingUtils.mockAccountsChanged([
      "0xf57752d00A6a7530cd66554d3ab2B409DB417BFC",
    ]);

    expect(window.ethereum.on).toBeCalledWith(
      "accountsChanged",
      expect.any(Function)
    );
  });

  test("Should call chainChanged listener when network is changed", async () => {
    vitest.spyOn(window.ethereum, "on").mockImplementationOnce(() => {});
    metamaskTestingUtils.lowLevel.mockRequest("eth_requestAccounts", () => {
      return ["0xf57752d00A6a7530cd66554d3ab2B409DB417BFC"];
    });

    const { result } = renderHook(useListen, {
      wrapper: MetamaskProvider,
    });
    result.current();

    metamaskTestingUtils.mockChainChanged("0x1");

    expect(window.ethereum.on).toBeCalledWith(
      "chainChanged",
      expect.any(Function)
    );
  });
});
