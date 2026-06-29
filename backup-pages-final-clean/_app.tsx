import "../styles/globals.css";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar";
import { PaymentBarrierProvider } from "../hooks/usePaymentBarrier";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Pages where sidebar should NOT show
  const noSidebarPages = ["/login", "/", "/register"];
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
