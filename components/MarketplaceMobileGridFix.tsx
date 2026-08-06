import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { useRouter } from "next/router";

type ViewerImage = {
  src: string;
  alt: string;
};

export default function MarketplaceMobileGridFix() {
  const router = useRouter();

  const [viewer, setViewer] = useState<ViewerImage | null>(null);
  const [scale, setScale] = useState(1);

  const touchDistanceRef = useRef<number | null>(null);
  const touchScaleRef = useRef(1);

  const closeViewer = useCallback(() => {
    setViewer(null);
    setScale(1);
    touchDistanceRef.current = null;
    touchScaleRef.current = 1;
  }, []);

  const openViewer = useCallback((image: HTMLImageElement) => {
    const src =
      image.currentSrc ||
      image.src ||
      image.getAttribute("src") ||
      "";

    if (!src) return;

    setScale(1);
    touchScaleRef.current = 1;

    setViewer({
      src,
      alt:
        image.alt ||
        image.getAttribute("aria-label") ||
        "Marketplace product image"
    });
  }, []);

  useEffect(() => {
    if (router.pathname !== "/marketplace") {
      document.body.classList.remove("bm-marketplace-route");
      closeViewer();
      return;
    }

    document.body.classList.add("bm-marketplace-route");

    const applyMarketplaceEnhancement = () => {
      const allElements = Array.from(
        document.querySelectorAll<HTMLElement>(
          "main div, #__next div"
        )
      );

      let bestContainer: HTMLElement | null = null;
      let bestScore = 0;

      for (const element of allElements) {
        const children = Array.from(
          element.children
        ) as HTMLElement[];

        if (children.length < 2) continue;

        const matchingChildren = children.filter((child) => {
          const image = child.querySelector("img");
          const text = String(
            child.textContent || ""
          ).toLowerCase();

          const looksLikeProduct =
            text.includes("send enquiry") ||
            text.includes("add to cart") ||
            text.includes("whatsapp") ||
            text.includes("view details") ||
            text.includes("price") ||
            text.includes("₹");

          return Boolean(image) && looksLikeProduct;
        });

        if (
          matchingChildren.length >= 2 &&
          matchingChildren.length > bestScore
        ) {
          bestContainer = element;
          bestScore = matchingChildren.length;
        }
      }

      document
        .querySelectorAll<HTMLElement>(
          ".bm-marketplace-product-grid"
        )
        .forEach((element) => {
          if (element !== bestContainer) {
            element.classList.remove(
              "bm-marketplace-product-grid"
            );

            Array.from(element.children).forEach((child) => {
              child.classList.remove(
                "bm-marketplace-product-card"
              );
            });
          }
        });

      if (!bestContainer) return;

      bestContainer.classList.add(
        "bm-marketplace-product-grid"
      );

      Array.from(bestContainer.children).forEach((child) => {
        const card = child as HTMLElement;

        card.classList.add(
          "bm-marketplace-product-card"
        );

        const image = card.querySelector(
          "img"
        ) as HTMLImageElement | null;

        if (!image) return;

        image.classList.add(
          "bm-marketplace-zoom-image"
        );

        image.setAttribute(
          "data-marketplace-zoom-image",
          "true"
        );

        image.setAttribute(
          "role",
          "button"
        );

        image.setAttribute(
          "tabindex",
          "0"
        );

        image.setAttribute(
          "title",
          "Tap to enlarge"
        );

        let wrapper = image.closest(
          ".bm-marketplace-image-wrapper"
        ) as HTMLElement | null;

        if (!wrapper) {
          wrapper = document.createElement("div");
          wrapper.className =
            "bm-marketplace-image-wrapper";

          image.parentNode?.insertBefore(
            wrapper,
            image
          );

          wrapper.appendChild(image);
        }

        if (
          !wrapper.querySelector(
            ".bm-marketplace-magnifier"
          )
        ) {
          const magnifier =
            document.createElement("button");

          magnifier.type = "button";
          magnifier.className =
            "bm-marketplace-magnifier";
          magnifier.setAttribute(
            "aria-label",
            "Enlarge product image"
          );
          magnifier.setAttribute(
            "title",
            "Enlarge image"
          );
          magnifier.setAttribute(
            "data-marketplace-magnifier",
            "true"
          );
          magnifier.textContent = "🔍";

          wrapper.appendChild(magnifier);
        }
      });
    };

    const clickHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) return;

      if (
        target.closest(
          "[data-marketplace-viewer-close='true']"
        )
      ) {
        closeViewer();
        return;
      }

      const magnifier = target.closest(
        "[data-marketplace-magnifier='true']"
      );

      if (magnifier) {
        event.preventDefault();
        event.stopPropagation();

        const image = magnifier
          .closest(".bm-marketplace-image-wrapper")
          ?.querySelector(
            "img"
          ) as HTMLImageElement | null;

        if (image) openViewer(image);
        return;
      }

      const image = target.closest(
        "[data-marketplace-zoom-image='true']"
      ) as HTMLImageElement | null;

      if (image) {
        event.preventDefault();
        event.stopPropagation();
        openViewer(image);
      }
    };

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeViewer();
        return;
      }

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        const active =
          document.activeElement as HTMLElement | null;

        const image = active?.closest(
          "[data-marketplace-zoom-image='true']"
        ) as HTMLImageElement | null;

        if (image) {
          event.preventDefault();
          openViewer(image);
        }
      }
    };

    applyMarketplaceEnhancement();

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(
        applyMarketplaceEnhancement
      );
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    document.addEventListener(
      "click",
      clickHandler,
      true
    );

    document.addEventListener(
      "keydown",
      keyHandler,
      true
    );

    window.addEventListener(
      "resize",
      applyMarketplaceEnhancement
    );

    return () => {
      observer.disconnect();

      document.removeEventListener(
        "click",
        clickHandler,
        true
      );

      document.removeEventListener(
        "keydown",
        keyHandler,
        true
      );

      window.removeEventListener(
        "resize",
        applyMarketplaceEnhancement
      );

      document.body.classList.remove(
        "bm-marketplace-route"
      );
    };
  }, [
    router.pathname,
    closeViewer,
    openViewer
  ]);

  function distanceBetweenTouches(
    touches: React.TouchList
  ): number {
    if (touches.length < 2) return 0;

    const first = touches[0];
    const second = touches[1];

    return Math.hypot(
      second.clientX - first.clientX,
      second.clientY - first.clientY
    );
  }

  function handleTouchStart(
    event: React.TouchEvent<HTMLImageElement>
  ) {
    if (event.touches.length !== 2) return;

    touchDistanceRef.current =
      distanceBetweenTouches(event.touches);

    touchScaleRef.current = scale;
  }

  function handleTouchMove(
    event: React.TouchEvent<HTMLImageElement>
  ) {
    if (
      event.touches.length !== 2 ||
      !touchDistanceRef.current
    ) {
      return;
    }

    event.preventDefault();

    const newDistance =
      distanceBetweenTouches(event.touches);

    const ratio =
      newDistance / touchDistanceRef.current;

    const nextScale = Math.min(
      5,
      Math.max(
        1,
        touchScaleRef.current * ratio
      )
    );

    setScale(nextScale);
  }

  function handleTouchEnd() {
    touchDistanceRef.current = null;
    touchScaleRef.current = scale;
  }

  if (!viewer) return null;

  return (
    <div
      className="bm-marketplace-viewer-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Marketplace image viewer"
      data-payment-bypass="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeViewer();
        }
      }}
    >
      <div className="bm-marketplace-viewer-panel">
        <button
          type="button"
          className="bm-marketplace-viewer-close"
          onClick={closeViewer}
          aria-label="Close image viewer"
          data-marketplace-viewer-close="true"
          data-payment-bypass="true"
        >
          ×
        </button>

        <div className="bm-marketplace-viewer-stage">
          <img
            src={viewer.src}
            alt={viewer.alt}
            draggable={false}
            className="bm-marketplace-viewer-image"
            style={{
              transform: `scale(${scale})`
            }}
            onDoubleClick={() => {
              setScale((current) =>
                current > 1 ? 1 : 2
              );
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>

        <div className="bm-marketplace-viewer-controls">
          <button
            type="button"
            onClick={() =>
              setScale((current) =>
                Math.max(1, current - 0.5)
              )
            }
            data-payment-bypass="true"
          >
            −
          </button>

          <span>
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={() =>
              setScale((current) =>
                Math.min(5, current + 0.5)
              )
            }
            data-payment-bypass="true"
          >
            +
          </button>

          <button
            type="button"
            onClick={() => setScale(1)}
            data-payment-bypass="true"
          >
            Reset
          </button>
        </div>

        <small>
          Pinch or double-tap/click to zoom
        </small>
      </div>
    </div>
  );
}
