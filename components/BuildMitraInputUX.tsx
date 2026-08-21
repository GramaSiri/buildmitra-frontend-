import React, { useEffect } from "react";

const NUMERIC_EXCLUSIONS = [
  "quantity",
  "qty",
  "rate",
  "amount",
  "price",
  "cost",
  "budget",
  "mobile",
  "phone",
  "contact",
  "pincode",
  "pin code",
  "postal",
  "otp",
  "code",
  "id",
  "area",
  "volume",
  "total"
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

function fieldText(el: HTMLInputElement | HTMLSelectElement) {
  const parts: string[] = [
    el.getAttribute("name") || "",
    el.getAttribute("id") || "",
    el.getAttribute("placeholder") || "",
    el.getAttribute("aria-label") || "",
    el.getAttribute("title") || ""
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

  return parts.join(" ").toLowerCase();
}

function isProtectedBusinessNumber(input: HTMLInputElement) {
  const text = fieldText(input);
  return NUMERIC_EXCLUSIONS.some((word) => text.includes(word));
}

function isUserNumeric(input: HTMLInputElement) {
  if (input.disabled || input.readOnly) return false;

  const type = (input.type || "").toLowerCase();

  const numeric =
    type === "number" ||
    input.inputMode === "numeric" ||
    input.inputMode === "decimal";

  if (!numeric) return false;

  return !isProtectedBusinessNumber(input);
}

function isCompactText(input: HTMLInputElement) {
  if (input.disabled || input.readOnly) return false;

  const type = (input.type || "text").toLowerCase();

  if (!["text", ""].includes(type)) return false;

  const text = fieldText(input);

  return !TEXT_EXCLUSIONS.some((word) => text.includes(word));
}

function isNumericSelect(select: HTMLSelectElement) {
  const values = Array.from(select.options)
    .map((option) => option.value.trim())
    .filter(Boolean);

  if (!values.length) return false;

  return values.every((value) =>
    /^-?\d{1,3}(?:\.\d+)?$/.test(value)
  );
}

export default function BuildMitraInputUX() {
  useEffect(() => {
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

      /*
       * Live/instant calculators:
       * keep the changed value visible long enough for the user
       * to notice it, then return to normal after result settles.
       */
      const timer = window.setTimeout(() => {
        normalise(el);
      }, 1800);

      timers.set(el, timer);
    };

    const prepareInput = (input: HTMLInputElement) => {

      if (input.disabled || input.readOnly) return;

      const type = (input.type || "").toLowerCase();

      /*
       * VISUAL RULE:
       * Every user-entered numeric field gets the same compact
       * physical width, including Quantity.
       *
       * Business exclusions still control whether the 3-digit
       * restriction is applied; they do NOT prevent compact sizing.
       */
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
      }

      if (isUserNumeric(input)) {
        input.classList.add("bm-compact-number");
        input.setAttribute("data-bm-user-number", "true");
      }

      if (isCompactText(input)) {
        input.classList.add("bm-compact-text");

        if (!input.maxLength || input.maxLength > 15) {
          input.maxLength = 15;
        }

        input.setAttribute("data-bm-short-text", "true");
      }

      /*
       * Mark the immediate wrapper so label + control can be
       * consistently aligned without changing calculator formulas.
       */
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
      if (raw === "") return;

      let cleaned = raw.replace(/[^\d.-]/g, "");

      const negative = cleaned.startsWith("-");
      cleaned = cleaned.replace(/-/g, "");

      const pieces = cleaned.split(".");
      let integerPart = pieces[0] || "";

      // Absolute maximum: THREE integer digits.
      if (integerPart.length > 3) {
        integerPart = integerPart.slice(0, 3);
      }

      let decimalPart = pieces.slice(1).join("");

      // Keep reasonable precision without disturbing valid decimals.
      if (decimalPart.length > 3) {
        decimalPart = decimalPart.slice(0, 3);
      }

      let next =
        (negative ? "-" : "") +
        integerPart +
        (pieces.length > 1 ? "." + decimalPart : "");

      const numeric = Number(next);

      if (Number.isFinite(numeric)) {
        if (numeric > 999) next = "999";
        if (numeric < 0) next = "0";
      }

      if (input.value !== next) {
        input.value = next;
      }
    };

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

    /*
     * Dynamic pages, modals and calculators render fields after
     * initial page load. MutationObserver prepares those fields too.
     */

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

          /*
           * Highlight the changed result value/container.
           * Do not recolour the entire application.
           */
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

    document.addEventListener("input", handleInput, true);
    document.addEventListener("change", handleChange, true);
    document.addEventListener("click", handleAction, true);

    return () => {
      observer.disconnect();

      document.removeEventListener("input", handleInput, true);
      document.removeEventListener("change", handleChange, true);
      document.removeEventListener("click", handleAction, true);
    };
  }, []);

  return null;
}


