"use client";

import React, { createContext, useCallback, useContext } from "react";
import type { ReactNode } from "react";
import { notifications } from "@mantine/notifications";

interface ToastContextType {
  showToast: (message: string, variant?: "info" | "error") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Thin wrapper over Mantine notifications so callers keep a simple showToast API.
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const showToast = useCallback(
    (message: string, variant: "info" | "error" = "info") => {
      notifications.show({
        message,
        color: variant === "error" ? "red" : "blue",
        title: variant === "error" ? "Something went wrong" : undefined,
        autoClose: 3500,
      });
    },
    []
  );

  return <ToastContext.Provider value={{ showToast }}>{children}</ToastContext.Provider>;
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
