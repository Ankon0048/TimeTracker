"use client";

import { Provider } from "react-redux";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { store } from "@/lib/store";
import { theme } from "@/lib/theme";
import { ToastProvider } from "@/context/ToastContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TimerBackgroundEffects } from "@/components/TimerBackgroundEffects";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <ModalsProvider>
          <Notifications position="bottom-right" />
          <TimerBackgroundEffects />
          <ToastProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </ToastProvider>
        </ModalsProvider>
      </MantineProvider>
    </Provider>
  );
}
