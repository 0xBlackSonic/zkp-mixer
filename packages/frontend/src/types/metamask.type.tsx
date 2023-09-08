type ConnectAction = {
  type: "connect";
  wallet: string | null;
  balance: string;
  chainId: string | null;
};

type DisconnectAction = { type: "disconnect" };

type PageLoadedAction = {
  type: "pageLoaded";
  isMetamaskInstalled: boolean;
  wallet: string | null;
  balance: string | null;
  chainId: string | null;
};

type LoadingAction = { type: "loading" };

type IdleAction = { type: "idle" };

type UpdateAction = { type: "update"; balance: string };

type changeNetworkAction = {
  type: "changeNetwork";
  chainId: string;
  balance: string;
};

export type Action =
  | ConnectAction
  | DisconnectAction
  | PageLoadedAction
  | LoadingAction
  | IdleAction
  | UpdateAction
  | changeNetworkAction;

export type Dispatch = (action: Action) => void;

type Status = "loading" | "idle" | "pageNotLoaded" | "wrongNetwork";

export type State = {
  wallet: string | null;
  isMetamaskInstalled: boolean;
  status: Status;
  balance: string | null;
};
