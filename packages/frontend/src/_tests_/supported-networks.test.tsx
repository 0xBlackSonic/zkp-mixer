import { render, screen, fireEvent } from "@testing-library/react";
import { generateTestingUtils } from "eth-testing";

import App from "../App";

import { MetamaskProvider } from "../hooks/useMetamask";

describe("Netwoks", () => {
  const metamaskTestingUtils = generateTestingUtils({
    providerType: "MetaMask",
  });

  beforeAll(() => {
    window.ethereum = metamaskTestingUtils.getProvider();
  });

  test("user should be able to interact only on supported networks", async () => {
    metamaskTestingUtils.mockRequestAccounts([
      "0x4eae888641431Afe6533C042308C638d66D2cF35",
    ]);

    render(<App />, { wrapper: MetamaskProvider });

    fireEvent.click(screen.getByRole("button", { name: /Connect Wallet/i }));

    await screen.findByText(/0x4eae...d2cf35/i);

    expect(
      screen
        .getByRole("button", { name: /0x4eae...d2cf35/i })
        .getAttribute("class")
    ).toContain("text-yellow-300");

    expect(
      screen.getByRole("button", { name: /Deposit/i }).getAttribute("Disabled")
    ).exist;
  });
});
