// Suppress benign ResizeObserver loop error overlay in webpack dev server
const isResizeObserverError = (msg) => {
  if (!msg) return false;
  const str = typeof msg === "string" ? msg : (msg.message || (msg.reason && msg.reason.message) || msg.toString?.() || "");
  return (
    str.includes("ResizeObserver") ||
    str.includes("undelivered notifications") ||
    str.includes("loop limit exceeded") ||
    (str.includes("DataCloneError") && str.includes("PerformanceServerTiming"))
  );
};

window.addEventListener(
  "error",
  (e) => {
    if (isResizeObserverError(e.message) || isResizeObserverError(e.error)) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
    }
  },
  true
);

window.addEventListener(
  "unhandledrejection",
  (e) => {
    if (isResizeObserverError(e.reason)) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
    }
  },
  true
);

if (typeof window !== "undefined" && window.ResizeObserver) {
  const NativeResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class ResizeObserver extends NativeResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        window.requestAnimationFrame(() => {
          try {
            callback(entries, observer);
          } catch {
            // ignore layout loop warnings
          }
        });
      });
    }
  };
}

const origConsoleError = console.error;
console.error = (...args) => {
  if (args.some((arg) => isResizeObserverError(arg))) return;
  origConsoleError.apply(console, args);
};

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
