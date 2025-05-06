import { StateProvider } from "@/context/StateContext";
import reducer, { initialState } from "@/context/StateReducers";
import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      <Head>
        <title>Whatsapp</title>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>
      <Component {...pageProps} />
      
      <ToastContainer position="top-right" autoClose={3000} />
    </StateProvider>
  );
}
