import React, { useEffect } from "react";
import { useRouter } from "next/router";

const LINK_ID = "bm-waterproofing-sidebar-link";

function findSidePanel(): HTMLElement | null {
  const selectors = [
    "aside",
    "[class*='sidebar']",
    "[class*='Sidebar']",
    "[class*='side-panel']",
    "[class*='sidePanel']",
    "[class*='drawer'] nav",
    ".MuiDrawer-paper nav",
    ".MuiDrawer-paper",
    "nav"
  ];

  for (const selector of selectors) {
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(selector)
    );

    const suitable = candidates.find((element) => {
      const text = String(element.innerText || "").toLowerCase();

      return (
        text.includes("calculator") ||
        text.includes("marketplace") ||
        text.includes("buyer") ||
        text.includes("dashboard") ||
        text.includes("boq")
      );
    });

    if (suitable) return suitable;
  }

  return null;
}

export default function WaterproofingSidebarLink() {
  const router = useRouter();

  useEffect(() => {
    const installLink = () => {
      if (document.getElementById(LINK_ID)) {
        const existing = document.getElementById(
          LINK_ID
        ) as HTMLAnchorElement | null;

        if (existing) {
          existing.classList.toggle(
            "bm-waterproofing-active",
            router.pathname === "/waterproofing-calculator"
          );
        }

        return;
      }

      const panel = findSidePanel();

      if (!panel) return;

      const link = document.createElement("a");

      link.id = LINK_ID;
      link.href = "/waterproofing-calculator";
      link.className = "bm-waterproofing-sidebar-link";
      link.setAttribute(
        "aria-label",
        "Open Waterproofing Calculator"
      );

      link.innerHTML = `
        <span class="bm-waterproofing-icon">💧</span>
        <span class="bm-waterproofing-label">
          Water Proofing BOQ
        </span>
      `;

      if (router.pathname === "/waterproofing-calculator" || router.pathname === "/boq-waterproofing") {
        link.classList.add("bm-waterproofing-active");
      }

      link.addEventListener("click", (event) => {
        event.preventDefault();

        router.push("/waterproofing-calculator");

        const mobileCloseButton =
          document.querySelector<HTMLElement>(
            "[aria-label='Close menu'], " +
            "[aria-label='Close drawer'], " +
            "[class*='drawer'] [class*='close']"
          );

        mobileCloseButton?.click();
      });

      panel.appendChild(link);
    };

    installLink();

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(installLink);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [router]);

  return null;
}
