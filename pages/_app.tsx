import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar";
import { PaymentBarrierProvider } from "../hooks/usePaymentBarrier";
import { syncApprovedRatesFromBackend } from "../utils/masterRates";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    syncApprovedRatesFromBackend()
      .then((res) => {
        if (res.success) console.log("✅ Master rates synced:", res.count);
        else console.warn("⚠️ Master rate sync skipped:", res.error);
      })
      .catch((err) => console.warn("⚠️ Master rate sync failed:", err));
  }, []);

  const noSidebarPages = ["/login", "/", "/register", "/forgot-password"];
  const showSidebar = !noSidebarPages.includes(router.pathname);

  return (
    <PaymentBarrierProvider>
      {showSidebar ? (
        <Sidebar currentPath={router.pathname}>
          <Component {...pageProps} />
        </Sidebar>
      ) : (
        <Component {...pageProps} />
      )}
    </PaymentBarrierProvider>
  );
}
