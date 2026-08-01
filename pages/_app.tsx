import React from "react";
import { useRouter } from "next/router";
import GlobalBrandPaymentGuard from "../components/GlobalBrandPaymentGuard";
import { PaymentBarrierProvider } from "../hooks/usePaymentBarrier";
import ClientErrorBoundary from "../components/ClientErrorBoundary";
import Sidebar from "../components/Sidebar";
import { fetchBuildMitraMasterRates } from "../utils/buildmitraMasterRates";
import "../styles/globals.css";

function BuildMitraMasterRateLoader() {
  React.useEffect(() => {
    fetchBuildMitraMasterRates(true).catch((error) => {
      console.error("BuildMitra master-rate load failed:", error);
    });
  }, []);

  return null;
}

export default function App({ Component, pageProps }: any) {
  const router = useRouter();
  const noSidebarPages = ["/login", "/", "/register", "/forgot-password"];
  const isQuickQuote = router.pathname === "/quick-quote";
  const showSidebar = !noSidebarPages.includes(router.pathname);

  return (
    <ClientErrorBoundary>
      <GlobalBrandPaymentGuard>
        <PaymentBarrierProvider>
          <BuildMitraMasterRateLoader />
          {showSidebar && !isQuickQuote ? (
            <Sidebar currentPath={router.pathname}>
              <Component {...pageProps} />
            </Sidebar>
          ) : (
            <Component {...pageProps} />
          )}
        </PaymentBarrierProvider>
      </GlobalBrandPaymentGuard>
    </ClientErrorBoundary>
  );
}
