import { useListen } from "./hooks/useListen";
import { useMetamask } from "./hooks/useMetamask";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useEffect } from "react";
import Container from "./components/Container";
import Footer from "./components/Footer";

function App() {
  const { dispatch } = useMetamask();
  const listen = useListen();

  useEffect(() => {
    // eslint-disable-next-line valid-typeof
    if (typeof window !== undefined) {
      const ethereumProviderInjected = typeof window.ethereum !== "undefined";
      const isMetamaskInstalled =
        ethereumProviderInjected && Boolean(window.ethereum.isMetaMask);

      const local = window.localStorage.getItem("metamaskState");

      if (local) {
        listen();
      }

      const { wallet, balance, chainId } = local
        ? JSON.parse(local)
        : { wallet: null, balance: null, chainId: null };

      dispatch({
        type: "pageLoaded",
        isMetamaskInstalled,
        wallet,
        balance,
        chainId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header />
      <Container />
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName={"text-sm"}
        closeButton={false}
        toastStyle={{ backgroundColor: "rgba(17, 24, 39, 0.95)" }}
      />
    </>
  );
}

export default App;
