import "../styles/globals.css";
import Head from "next/head";
import { ContractsProvider } from "../contexts/contracts";

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </Head>
      <ContractsProvider>
        <Component {...pageProps} />
      </ContractsProvider>
    </div>
  );
}

export default MyApp;
