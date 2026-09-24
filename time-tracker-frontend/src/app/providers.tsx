"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { ToastProvider } from "@/context/ToastContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ToastProvider>
        <ErrorBoundary>{children}</ErrorBoundary>
      </ToastProvider>
    </Provider>
  );
}
