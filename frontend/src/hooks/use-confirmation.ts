"use client";

import { useState, useCallback } from "react";

/**
 * Manage confirmation dialog state for delete / destructive actions.
 */
export function useConfirmation<T = unknown>() {
  const [item, setItem] = useState<T | null>(null);
  const [open, setOpen] = useState(false);

  const confirm = useCallback((target: T) => {
    setItem(target);
    setOpen(true);
  }, []);

  const cancel = useCallback(() => {
    setOpen(false);
    setItem(null);
  }, []);

  const handleConfirm = useCallback(
    (onConfirm: (target: T) => void) => {
      if (item) {
        onConfirm(item);
      }
      setOpen(false);
      setItem(null);
    },
    [item],
  );

  return { item, open, confirm, cancel, handleConfirm, setOpen };
}
