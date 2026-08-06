import React from "react";
import BuildMitraPaymentBarrier from "../components/BuildMitraPaymentBarrier";
import WaterproofingSidebarLink from "../components/WaterproofingSidebarLink";
import MarketplaceMobileGridFix from "../components/MarketplaceMobileGridFix";
import { PaymentBarrierProvider } from "../hooks/usePaymentBarrier";
import "../styles/globals.css";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/router";
import ClientErrorBoundary from "../components/ClientErrorBoundary";

export default function App({ Component, pageProps }: any) {
  const router = useRouter();

  const noSidebarPages = ["/login", "/", "/register", "/forgot-password"];
  const isQuickQuote = router.pathname === "/quick-quote";
  const showSidebar = !noSidebarPages.includes(router.pathname);

  return (
    <ClientErrorBoundary>
      <PaymentBarrierProvider>
        <MarketplaceMobileGridFix />
        <WaterproofingSidebarLink />
        <BuildMitraPaymentBarrier>
          {isQuickQuote ? (
            <Component {...pageProps} />
          ) : showSidebar ? (
            <Sidebar currentPath={router.pathname}>
              <Component {...pageProps} />
            </Sidebar>
          ) : (
            <Component {...pageProps} />
          )}
        </BuildMitraPaymentBarrier>
      </PaymentBarrierProvider>
    </ClientErrorBoundary>
  );
}
