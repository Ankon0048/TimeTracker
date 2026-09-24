import { useEffect } from "react";
import { useToast } from "@/context/ToastContext";

// Surfaces a Redux slice's `error` field as a toast whenever it changes.
export function useErrorToast(error: string | null | undefined) {
  const { showToast } = useToast();

  useEffect(() => {
    if (error) {
      showToast(error, "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);
}
