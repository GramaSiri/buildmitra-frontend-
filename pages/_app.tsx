import "../styles/globals.css";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/router";
import ClientErrorBoundary from "../components/ClientErrorBoundary";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const noSidebarPages = ["/login", "/", "/register", "/forgot-password"];
  const showSidebar = !noSidebarPages.includes(router.pathname);

  return (
    <ClientErrorBoundary>
      {showSidebar ? (
        <Sidebar currentPath={router.pathname}>
          <Component {...pageProps} />
        </Sidebar>
      ) : (
        <Component {...pageProps} />
      )}
    </ClientErrorBoundary>
  );
}
