import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { MetamaskProvider } from "./hooks/useMetamask";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MetamaskProvider>
      <App />
    </MetamaskProvider>
  </React.StrictMode>
);
