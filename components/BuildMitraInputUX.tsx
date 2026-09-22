// @ts-nocheck
import React, { useEffect } from "react";

const STRICT_EXCLUSIONS = [
  "mobile",
  "phone",
  "contact",
  "pincode",
  "pin code",
  "postal",
  "otp",
  "code",
  "id",
  "password",
  "username",
  "aadhaar",
  "pan"
];

const TEXT_EXCLUSIONS = [
  "name",
  "email",
  "address",
  "location",
  "city",
  "state",
  "remarks",
  "remark",
  "description",
  "details",
  "message",
  "search",
  "password",
  "username",
  "company",
  "project name",
  "property",
  "specification"
];

function fieldText(el: HTMLInputElement | HTMLSelectElement): string {
  const parts: string[] = [
    el.getAttribute("name") || "",
    el.getAttribute("id") || "",
    el.getAttribute("placeholder") || "",
    el.getAttribute("aria-label") || "",
    el.getAttribute("title") || "",
    el.getAttribute("data-bm-field") || ""
  ];

  if (el instanceof HTMLInputElement && el.labels) {
    Array.from(el.labels).forEach((label) => {
      parts.push(label.textContent || "");
    });
  }

  const directLabel = el.closest("label");
  if (directLabel) {
    parts.push(directLabel.textContent || "");
  }

  const previous = el.previousElementSibling;
  if (previous) {
    parts.push((previous.textContent || "").slice(0, 100));
  }

  const parent = el.parentElement;
  if (parent) {
    const parentLabel = parent.querySelector("label");
    if (parentLabel) {
      parts.push(parentLabel.textContent || "");
    }
  }

  return parts.join(" ").toLowerCase();
}

function isSpecialExcludedField(input: HTMLInputElement): boolean {
  const text = fieldText(input);
  return STRICT_EXCLUSIONS.some((word) => text.includes(word));
}

function isUserNumeric(input: HTMLInputElement): boolean {
  if (input.disabled || input.readOnly) return false;

  const type = (input.type || "").toLowerCase();

  const numeric =
    type === "number" ||
    input.inputMode === "numeric" ||
    input.inputMode === "decimal";

  if (!numeric) return false;

  return !isSpecialExcludedField(input);
}

function isCompactText(input: HTMLInputElement): boolean {
  if (input.disabled || input.readOnly) return false;

  const type = (input.type || "text").toLowerCase();

  if (!["text", ""].includes(type)) return false;

  const text = fieldText(input);

  return !TEXT_EXCLUSIONS.some((word) => text.includes(word));
}

function isNumericSelect(select: HTMLSelectElement): boolean {
  const values = Array.from(select.options)
    .map((option) => option.value.trim())
    .filter(Boolean);

  if (!values.length) return false;

  return values.every((value) =>
    /^-?\d{1,4}(?:\.\d+)?$/.test(value)
  );
}

/**
 * Determine exact digit limit per module:
 * 1. Housing Loan (loan amount / property cost) -> 10 digits (max 9,999,999,999)
 * 2. Marketplace cart quantity -> 5 digits (max 99,999)
 * 3. All calculator & BOQ numeric inputs -> 4 digits (max 9,999)
 */
function getFieldLimits(input: HTMLInputElement): { maxDigits: number; maxVal: number } {
  // Explicit attribute override
  const explicitDigits = input.getAttribute("data-bm-digits");
  if (explicitDigits) {
    const d = parseInt(explicitDigits, 10);
    if (!isNaN(d) && d > 0) {
      return { maxDigits: d, maxVal: Math.pow(10, d) - 1 };
    }
  }

  const pathname = (typeof window !== "undefined" ? window.location.pathname : "").toLowerCase();
  const text = fieldText(input);

  // Housing loan pages (housing-loan-calculator.tsx, housing-loan-finance.tsx)
  if (pathname.includes("housing-loan") || pathname.includes("loan")) {
    if (
      text.includes("property") ||
      text.includes("cost") ||
      text.includes("loan") ||
      text.includes("amount") ||
      text.includes("income") ||
      text.includes("emi") ||
      input.getAttribute("data-bm-field") === "loan-amount"
    ) {
      return { maxDigits: 10, maxVal: 9999999999 };
    }
    if (text.includes("tenure") || text.includes("year")) {
      return { maxDigits: 2, maxVal: 30 };
    }
    if (text.includes("rate") || text.includes("%") || text.includes("percent")) {
      return { maxDigits: 4, maxVal: 100 };
    }
    return { maxDigits: 10, maxVal: 9999999999 };
  }

  // Marketplace cart quantity (marketplace.tsx)
  if (pathname.includes("marketplace")) {
    if (
      text.includes("quantity") ||
      text.includes("qty") ||
      input.getAttribute("data-bm-field") === "cart-quantity" ||
      input.closest("[class*='cart']") !== null ||
      input.parentElement?.querySelector("button") !== null
    ) {
      return { maxDigits: 5, maxVal: 99999 };
    }
  }

  // All calculator pages & BOQ pages: 4 digits (max 9999)
  return { maxDigits: 4, maxVal: 9999 };
}

// Helper to set DOM value using prototype setter so React tracks changes
function setNativeValue(element: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }
}

export default function BuildMitraInputUX() {
  useEffect(() => {
    // Intercept HTMLInputElement.prototype.value setter to prevent React
    // from forcing "0" back into focused inputs that the user has cleared.
    const originalValueDescriptor = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    );

    if (originalValueDescriptor && originalValueDescriptor.set) {
      const originalSet = originalValueDescriptor.set;
      const originalGet = originalValueDescriptor.get!;

      Object.defineProperty(HTMLInputElement.prototype, "value", {
        get: function () {
          return originalGet.call(this);
        },
        set: function (val: any) {
          // If currently focused and marked as empty by user/focus clearing,
          // suppress React re-rendering "0" or "NaN" into the input
          if (
            typeof document !== "undefined" &&
            document.activeElement === this &&
            this.dataset &&
            this.dataset.bmEmptyFocused === "true" &&
            (val === 0 || val === "0" || val === "" || Number.isNaN(val) || val === "NaN")
          ) {
            return originalSet.call(this, "");
          }
          return originalSet.call(this, val);
        },
        configurable: true,
        enumerable: true
      });
    }

    const timers = new WeakMap<Element, number>();

    const normalise = (el: HTMLElement) => {
      el.classList.remove("bm-user-edited");
      el.removeAttribute("data-buildmitra-edited");

      const timer = timers.get(el);
      if (timer) {
        window.clearTimeout(timer);
        timers.delete(el);
      }
    };

    const markChanged = (el: HTMLElement) => {
      el.classList.add("bm-user-edited");
      el.setAttribute("data-buildmitra-edited", "true");

      const existing = timers.get(el);
      if (existing) window.clearTimeout(existing);

      const timer = window.setTimeout(() => {
        normalise(el);
      }, 1800);

      timers.set(el, timer);
    };

    const prepareInput = (input: HTMLInputElement) => {
      if (input.disabled || input.readOnly) return;

      const type = (input.type || "").toLowerCase();

      if (
        type === "number" ||
        input.inputMode === "numeric" ||
        input.inputMode === "decimal"
      ) {
        input.classList.add("bm-user-number-field");

        if (!input.placeholder) {
          input.placeholder = "0";
        }

        input.setAttribute("autocomplete", "off");

        if (!input.inputMode) {
          input.inputMode = "decimal";
        }
      }

      if (isUserNumeric(input)) {
        input.classList.add("bm-compact-number");
        input.setAttribute("data-bm-user-number", "true");

        const { maxDigits } = getFieldLimits(input);
        // Set HTML maxLength attribute as additional protection
        // Allow buffer for possible decimal point + decimals
        if (!input.maxLength || input.maxLength > maxDigits + 4) {
          input.maxLength = maxDigits + 4;
        }
      }

      if (isCompactText(input)) {
        input.classList.add("bm-compact-text");

        if (!input.maxLength || input.maxLength > 15) {
          input.maxLength = 15;
        }

        input.setAttribute("data-bm-short-text", "true");
      }

      const wrapper = input.parentElement;
      if (wrapper) {
        wrapper.classList.add("bm-field-shell");
      }
    };

    const prepareSelect = (select: HTMLSelectElement) => {
      if (select.disabled) return;

      if (isNumericSelect(select)) {
        select.classList.add("bm-compact-number-select");
      } else {
        select.classList.add("bm-compact-text-select");
      }

      const selected = select.options[select.selectedIndex];
      if (selected) {
        select.title = selected.text;
      }

      const wrapper = select.parentElement;
      if (wrapper) {
        wrapper.classList.add("bm-field-shell");
      }
    };

    const prepareAll = (root: ParentNode = document) => {
      root
        .querySelectorAll<HTMLInputElement>("input")
        .forEach(prepareInput);

      root
        .querySelectorAll<HTMLSelectElement>("select")
        .forEach(prepareSelect);
    };

    const enforceNumber = (input: HTMLInputElement) => {
      if (!isUserNumeric(input)) return;

      const raw = input.value.trim();

      // User must be able to erase the field fully.
      if (raw === "") {
        input.dataset.bmEmptyFocused = "true";
        return;
      }

      // User entered a non-empty value
      input.dataset.bmEmptyFocused = "false";
      input.setAttribute("data-bm-user-edited", "true");

      let cleaned = raw.replace(/[^\d.-]/g, "");

      const negative = cleaned.startsWith("-");
      cleaned = cleaned.replace(/-/g, "");

      const { maxDigits, maxVal } = getFieldLimits(input);

      const pieces = cleaned.split(".");
      let integerPart = pieces[0] || "";

      // Strip leading zeros if user typed fresh (e.g. "05" -> "5")
      if (/^0\d+/.test(integerPart)) {
        integerPart = integerPart.replace(/^0+/, "");
        if (!integerPart) integerPart = "0";
      }

      // Enforce module-specific integer digit limit
      if (integerPart.length > maxDigits) {
        integerPart = integerPart.slice(0, maxDigits);
      }

      let decimalPart = pieces.slice(1).join("");

      // Keep reasonable precision without disturbing valid decimals (up to 3 decimal places)
      if (decimalPart.length > 3) {
        decimalPart = decimalPart.slice(0, 3);
      }

      let next =
        (negative ? "-" : "") +
        integerPart +
        (pieces.length > 1 ? "." + decimalPart : "");

      const numeric = Number(next);

      if (Number.isFinite(numeric)) {
        if (numeric > maxVal) next = String(maxVal);
        if (numeric < 0) next = "0";
      }

      if (input.value !== next) {
        setNativeValue(input, next);
      }
    };

    // 1. FOCUS HANDLER (desktop click/focus & mobile tap)
    // If value === "0" || value === "1", and field was not explicitly set by user, clear to ""
    const handleFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (!isUserNumeric(target)) return;

      prepareInput(target);

      const val = target.value.trim();
      const isUserEdited = target.getAttribute("data-bm-user-edited") === "true";

      if ((val === "0" || val === "1") && !isUserEdited) {
        target.dataset.bmOriginalDefault = val;
        target.dataset.bmEmptyFocused = "true";
        setNativeValue(target, "");
        target.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };

    // 2. BLUR HANDLER (tab away / tap away)
    // If field is still empty, restore "0" (or initial default) for calculation safety
    const handleBlur = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (!isUserNumeric(target)) return;

      target.dataset.bmEmptyFocused = "false";

      const val = target.value.trim();
      if (val === "") {
        const fallback = target.dataset.bmOriginalDefault || "0";
        target.removeAttribute("data-bm-user-edited");
        setNativeValue(target, fallback);
        target.dispatchEvent(new Event("input", { bubbles: true }));
        target.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };

    // 3. INPUT HANDLER (typing, delete, backspace, paste)
    const handleInput = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;

      prepareInput(target);

      if (isUserNumeric(target)) {
        enforceNumber(target);
        markChanged(target);
        return;
      }

      if (isCompactText(target)) {
        if (target.value.length > 15) {
          target.value = target.value.slice(0, 15);
        }
        markChanged(target);
      }
    };

    const handleChange = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLSelectElement) {
        prepareSelect(target);
        const selected = target.options[target.selectedIndex];
        if (selected) target.title = selected.text;
        markChanged(target);
      }
    };

    const resetEditedInputs = () => {
      document
        .querySelectorAll<HTMLElement>("[data-buildmitra-edited='true']")
        .forEach(normalise);
    };

    const handleAction = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const action = target.closest(
        'button, [role="button"], input[type="submit"], input[type="button"]'
      ) as HTMLElement | null;

      if (!action) return;

      const text = (
        action.textContent ||
        action.getAttribute("aria-label") ||
        (action as HTMLInputElement).value ||
        ""
      )
        .trim()
        .toLowerCase();

      const resultActions = [
        "calculate",
        "generate",
        "estimate",
        "compute",
        "submit",
        "apply",
        "update",
        "preview"
      ];

      if (resultActions.some((word) => text.includes(word))) {
        window.setTimeout(resetEditedInputs, 250);
      }
    };

    // BUILDMITRA_RESULT_HIGHLIGHT_START
    const resultHighlightTimers = new WeakMap<HTMLElement, number>();

    const isResultArea = (el: HTMLElement) => {
      const identity = [
        el.className,
        el.id,
        el.getAttribute("aria-label") || ""
      ]
        .join(" ")
        .toLowerCase();

      return (
        identity.includes("result") ||
        identity.includes("output") ||
        identity.includes("summary") ||
        identity.includes("calculation") ||
        identity.includes("estimate") ||
        identity.includes("total")
      );
    };

    const highlightFreshResult = (el: HTMLElement) => {
      el.classList.add("bm-fresh-result");

      const oldTimer = resultHighlightTimers.get(el);
      if (oldTimer) {
        window.clearTimeout(oldTimer);
      }

      const timer = window.setTimeout(() => {
        el.classList.remove("bm-fresh-result");
        resultHighlightTimers.delete(el);
      }, 2200);

      resultHighlightTimers.set(el, timer);
    };

    const inspectResultNode = (node: Node) => {
      const el =
        node instanceof HTMLElement
          ? node
          : node.parentElement;

      if (!el) return;

      let current: HTMLElement | null = el;

      for (let i = 0; i < 5 && current; i++) {
        if (isResultArea(current)) {
          highlightFreshResult(el);
          break;
        }
        current = current.parentElement;
      }
    };
    // BUILDMITRA_RESULT_HIGHLIGHT_END

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") {
          inspectResultNode(mutation.target);
        }
        if (mutation.type === "childList") {
          inspectResultNode(mutation.target);
        }
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            prepareAll(node);
          }
        });
      });
    });

    prepareAll();

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // Capture phase event listeners for complete coverage
    document.addEventListener("focusin", handleFocus, true);
    document.addEventListener("focusout", handleBlur, true);
    document.addEventListener("input", handleInput, true);
    document.addEventListener("change", handleChange, true);
    document.addEventListener("click", handleAction, true);

    return () => {
      observer.disconnect();

      document.removeEventListener("focusin", handleFocus, true);
      document.removeEventListener("focusout", handleBlur, true);
      document.removeEventListener("input", handleInput, true);
      document.removeEventListener("change", handleChange, true);
      document.removeEventListener("click", handleAction, true);
    };
  }, []);

  return null;
}
