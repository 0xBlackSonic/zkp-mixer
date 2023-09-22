import { fireEvent, render, screen } from "@testing-library/react";
import { generateTestingUtils } from "eth-testing";

import App from "../App";

import { MetamaskProvider } from "../hooks/useMetamask";

describe("App", () => {
  const sepoliaTestingUtils = generateTestingUtils();
  const localTestingUtils = generateTestingUtils();
  const metamaskTestingUtils = generateTestingUtils({
    providerType: "MetaMask",
  });

  beforeAll(() => {
    window.ethereum = metamaskTestingUtils.getProvider();
  });

  beforeEach(() => {
    sepoliaTestingUtils.mockReadonlyProvider();
    localTestingUtils.mockReadonlyProvider({ chainId: "0x7A69" });

    sepoliaTestingUtils.ens.mockAllToEmpty();
  });

  test("user should be able to connect using Metamask", async () => {
    metamaskTestingUtils
      .mockNotConnectedWallet()
      .mockRequestAccounts(["0x4eae888641431Afe6533C042308C638d66D2cF35"], {
        chainId: "0x7A69",
      });

    render(<App />, { wrapper: MetamaskProvider });

    expect(
      screen.getByRole("button", { name: /Connect Wallet/i })
    ).toBeDefined();

    expect(
      screen.getByRole("button", { name: /Deposit/i }).getAttribute("Disabled")
    ).exist;

    fireEvent.click(screen.getByRole("button", { name: /Connect Wallet/i }));

    await screen.findByText(/0x4eae...d2cf35/i);

    expect(
      screen.getByRole("button", { name: /Deposit/i }).getAttribute("Disabled")
    ).not.exist;
  });
});
