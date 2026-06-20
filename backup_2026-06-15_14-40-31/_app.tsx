import "../styles/globals.css";
import Sidebar from "../components/Sidebar";

export default function MyApp({ Component, pageProps, router }) {
  return (
    <Sidebar currentPath={router.pathname}>
      <Component {...pageProps} />
    </Sidebar>
  );
}