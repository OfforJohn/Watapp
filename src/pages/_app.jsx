import { useEffect, useRef, useState } from "react";
import { StateProvider } from "@/context/StateContext";
import reducer, { initialState } from "@/context/StateReducers";
import StartupErrorScreen from "@/components/StartupErrorScreen";
import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import Head from "next/head";
import { useRouter } from "next/router";

const STARTUP_SCREEN_DISMISSED_KEY = "startupErrorScreenDismissed";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [showStartupError, setShowStartupError] = useState(false);
  const [startupScreenReady, setStartupScreenReady] = useState(false);
  const startupRetryCount = useRef(0);

  useEffect(() => {
    if (!router.isReady) return;

    try {
      const alreadyDismissed =
        window.localStorage.getItem(STARTUP_SCREEN_DISMISSED_KEY) === "true";
      setShowStartupError(router.pathname === "/" && !alreadyDismissed);
    } catch (error) {
      console.error("Could not read startup screen state:", error);
      setShowStartupError(router.pathname === "/");
    } finally {
      setStartupScreenReady(true);
    }
  }, [router.isReady, router.pathname]);

  const handleStartupRetry = () => {
    startupRetryCount.current += 1;
    if (startupRetryCount.current >= 3) {
      try {
        window.localStorage.setItem(STARTUP_SCREEN_DISMISSED_KEY, "true");
      } catch (error) {
        console.error("Could not save startup screen state:", error);
      }
      setShowStartupError(false);
    }
  };

  const shouldShowStartupError =
    startupScreenReady && router.pathname === "/" && showStartupError;

  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      <Head>
        <title>Whatsapp</title>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>
      <Component {...pageProps} />
      {shouldShowStartupError && (
        <StartupErrorScreen onRetry={handleStartupRetry} />
      )}
      
      <ToastContainer position="top-right" autoClose={3000} />
    </StateProvider>
  );
}
