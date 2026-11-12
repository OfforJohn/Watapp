import { useRef, useState } from "react";
import { StateProvider } from "@/context/StateContext";
import reducer, { initialState } from "@/context/StateReducers";
import StartupErrorScreen from "@/components/StartupErrorScreen";
import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import Head from "next/head";

export default function App({ Component, pageProps }) {
  const [showStartupError, setShowStartupError] = useState(true);
  const startupRetryCount = useRef(0);

  const handleStartupRetry = () => {
    startupRetryCount.current += 1;
    if (startupRetryCount.current >= 3) {
      setShowStartupError(false);
    }
  };

  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      <Head>
        <title>Whatsapp</title>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>
      <Component {...pageProps} />
      {showStartupError && <StartupErrorScreen onRetry={handleStartupRetry} />}
      
      <ToastContainer position="top-right" autoClose={3000} />
    </StateProvider>
  );
}
