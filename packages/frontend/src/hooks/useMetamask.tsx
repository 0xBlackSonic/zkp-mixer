import React, { type PropsWithChildren } from "react";
import { Action, Dispatch, State } from "../types/metamask.type";

const networks = import.meta.env.VITE_NETWORKS.split(",");

const initialState: State = {
  wallet: null,
  isMetamaskInstalled: false,
  status: "loading",
  balance: null,
} as const;

const checkNetwork = (chainId: string | null) => {
  return chainId && !!networks.includes(parseInt(chainId, 16).toString());
};

const saveStorage = (state: State) => {
  const info = JSON.stringify(state);
  window.localStorage.setItem("metamaskState", info);
};

function metamaskReducer(state: State, action: Action): State {
  switch (action.type) {
    case "connect": {
      const { wallet, balance, chainId } = action;
      const newState = {
        ...state,
        wallet,
        balance,
        status: checkNetwork(chainId) ? "idle" : "wrongNetwork",
        chainId,
      } as State;
      saveStorage(newState);

      return newState;
    }
    case "disconnect": {
      window.localStorage.removeItem("metamaskState");
      // eslint-disable-next-line valid-typeof
      if (typeof window.ethereum !== undefined) {
        window.ethereum.removeAllListeners(["accountsChanged"]);
      }
      return { ...state, wallet: null, balance: null };
    }
    case "pageLoaded": {
      const { isMetamaskInstalled, balance, wallet, chainId } = action;
      return {
        ...state,
        isMetamaskInstalled,
        status: checkNetwork(chainId) ? "idle" : "wrongNetwork",
        wallet,
        balance,
      };
    }
    case "loading": {
      return { ...state, status: "loading" };
    }
    case "idle": {
      return { ...state, status: "idle" };
    }
    case "update": {
      const { balance } = action;
      const newState = {
        ...state,
        balance,
      } as State;

      saveStorage(newState);

      return { ...state, balance, status: "idle" };
    }
    case "changeNetwork": {
      const { chainId, balance } = action;
      const newState = {
        ...state,
        balance,
        chainId,
      } as State;

      saveStorage(newState);

      return {
        ...state,
        status: checkNetwork(chainId) ? "idle" : "wrongNetwork",
        balance,
      };
    }

    default: {
      throw new Error("Unhandled action type");
    }
  }
}

const MetamaskContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

function MetamaskProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = React.useReducer(metamaskReducer, initialState);
  const value = { state, dispatch };

  return (
    <MetamaskContext.Provider value={value}>
      {children}
    </MetamaskContext.Provider>
  );
}

function useMetamask() {
  const context = React.useContext(MetamaskContext);
  if (context === undefined) {
    throw new Error("useMetamask must be used within a MetamaskProvider");
  }
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export { MetamaskProvider, useMetamask };
