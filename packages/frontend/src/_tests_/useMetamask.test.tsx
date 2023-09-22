import { renderHook, act } from "@testing-library/react-hooks";
import { generateTestingUtils } from "eth-testing";
import { MetamaskProvider, useMetamask } from "../hooks/useMetamask";
import { Action } from "../types/metamask.type";

describe("useMetamask", () => {
  const metamaskTestingUtils = generateTestingUtils({
    providerType: "MetaMask",
  });

  beforeAll(() => {
    window.ethereum = metamaskTestingUtils.getProvider();
  });

  test("Status should be idle when connect action is executed", async () => {
    const action: Action = {
      type: "connect",
      wallet: "0x4eae888641431Afe6533C042308C638d66D2cF35",
      balance: "0x1",
      chainId: "0x7A69",
    };
    const { result } = renderHook(useMetamask, { wrapper: MetamaskProvider });
    act(async () => {
      result.current.dispatch(action);
    });

    expect(result.current.state.wallet).toEqual(action.wallet);
    expect(result.current.state.balance).toEqual(action.balance);
    expect(result.current.state.status).toEqual("idle");
  });

  test("Wallet and balance should be null when disconnect action is executed", async () => {
    const listener = vitest
      .spyOn(window.ethereum, "removeAllListeners")
      .mockImplementationOnce(() => {});

    const { result } = renderHook(useMetamask, { wrapper: MetamaskProvider });

    act(async () => {
      result.current.dispatch({ type: "disconnect" });
    });

    expect(listener).toHaveBeenCalledOnce();
  });

  test("State should change when pageLoaded action is executed", async () => {
    const action: Action = {
      type: "pageLoaded",
      isMetamaskInstalled: true,
      wallet: "0x4eae888641431Afe6533C042308C638d66D2cF35",
      balance: "0x1",
      chainId: "0x7A69",
    };
    const { result } = renderHook(useMetamask, { wrapper: MetamaskProvider });
    act(async () => {
      result.current.dispatch(action);
    });

    expect(result.current.state.isMetamaskInstalled).toEqual(
      action.isMetamaskInstalled
    );
    expect(result.current.state.wallet).toEqual(action.wallet);
    expect(result.current.state.balance).toEqual(action.balance);
    expect(result.current.state.status).toEqual("idle");
  });

  test("Balance should change when update action is executed with a new balance", async () => {
    const action: Action = {
      type: "connect",
      wallet: "0x4eae888641431Afe6533C042308C638d66D2cF35",
      balance: "0x1",
      chainId: "0x7A69",
    };
    const { result } = renderHook(useMetamask, { wrapper: MetamaskProvider });
    act(async () => {
      result.current.dispatch(action);
    });

    expect(result.current.state.balance).toEqual(action.balance);

    act(async () => {
      result.current.dispatch({ type: "update", balance: "0x2" });
    });

    expect(result.current.state.balance).toEqual("0x2");
  });

  test("Status should be loading when loading action is executed", () => {
    const { result } = renderHook(useMetamask, { wrapper: MetamaskProvider });
    act(async () => {
      result.current.dispatch({ type: "loading" });
    });

    expect(result.current.state.status).toEqual("loading");
  });

  test("Status should be idle when idle action is executed", () => {
    const { result } = renderHook(useMetamask, { wrapper: MetamaskProvider });
    act(async () => {
      result.current.dispatch({ type: "idle" });
    });

    expect(result.current.state.status).toEqual("idle");
  });

  test("Balance should change and status been verify when changeNetwork action is executed", () => {
    const action: Action = {
      type: "connect",
      wallet: "0x4eae888641431Afe6533C042308C638d66D2cF35",
      balance: "0x1",
      chainId: "0x7A69",
    };
    const { result } = renderHook(useMetamask, { wrapper: MetamaskProvider });
    act(async () => {
      result.current.dispatch(action);
    });

    expect(result.current.state.balance).toEqual(action.balance);

    act(async () => {
      result.current.dispatch({
        type: "changeNetwork",
        balance: "0x2",
        chainId: "0x1",
      });
    });

    expect(result.current.state.balance).toEqual("0x2");
    expect(result.current.state.status).toEqual("wrongNetwork");
  });
});
